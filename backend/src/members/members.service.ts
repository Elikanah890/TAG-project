import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterMemberDto } from './dto/register-member.dto';
import { MembershipStatus, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  private normalizePhone(raw?: string | null): string | null {
    if (!raw) return null;
    let s = String(raw).trim();
    if (!s) return null;
    s = s.replace(/[\s\-()]/g, '');
    if (s.startsWith('00')) s = `+${s.slice(2)}`;
    if (s.startsWith('0') && s.length >= 9) s = `+255${s.slice(1)}`;
    if (!s.startsWith('+')) s = `+${s}`;
    if (!/^\+[1-9]\d{7,14}$/.test(s)) throw new BadRequestException('Invalid phone number format. Use international format, e.g. +2557XXXXXXXX');
    return s;
  }

  private normalizePhoneOptional(raw?: string | null): string | null {
    if (raw === undefined || raw === null || String(raw).trim() === '') return null;
    return this.normalizePhone(raw);
  }

  async register(dto: RegisterMemberDto) {
    const fullName = dto.fullName?.trim();
    if (!fullName) throw new BadRequestException('Full name is required');
    const phone = this.normalizePhoneOptional(dto.phone);
    const whatsappNumber = this.normalizePhoneOptional(dto.whatsappNumber ?? dto.phone);
    const emergencyContactPhone = this.normalizePhoneOptional(dto.emergencyContactPhone);
    const member = await this.prisma.member.create({
      data: {
        fullName,
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || null,
        gender: dto.gender, phone, whatsappNumber, email: dto.email?.trim() || null,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        maritalStatus: dto.maritalStatus,
        originRegion: dto.originRegion, originDistrict: dto.originDistrict,
        currentRegion: dto.currentRegion, currentDistrict: dto.currentDistrict, currentWard: dto.currentWard,
        currentStreet: dto.currentStreet,
        employmentStatus: dto.employmentStatus, occupation: dto.occupation,
        emergencyContactName: dto.emergencyContactName, emergencyContactPhone,
        baptismStatus: dto.baptismStatus,
        preferredDepartment: dto.preferredDepartment || dto.desiredDepartment,
        desiredDepartment: dto.desiredDepartment || dto.preferredDepartment,
        currentPosition: dto.currentPosition,
        ushemasi: dto.ushemasi, timeInChurch: dto.timeInChurch, expectedStayDuration: dto.expectedStayDuration,
        originalLocation: [dto.originDistrict, dto.originRegion].filter(Boolean).join(', ') || null,
        currentLocation: [dto.currentStreet, dto.currentWard, dto.currentDistrict, dto.currentRegion].filter(Boolean).join(', ') || null,
        membershipStatus: MembershipStatus.PENDING,
        registrationData: dto as any,
      },
    });
    await this.prisma.auditLog.create({ data: { action: 'MEMBER_REGISTERED', entityType: 'Member', entityId: member.id, metadata: { fullName: member.fullName, phone: member.phone, whatsappNumber: member.whatsappNumber, email: member.email } } });
    return { success: true, message: 'Application submitted', id: member.id, status: member.membershipStatus };
  }

  async findAll() {
    return this.prisma.member.findMany({ where: { membershipStatus: MembershipStatus.APPROVED }, orderBy: { fullName: 'asc' }, include: { user: { select: { id: true, email: true, status: true } } } });
  }

  async findPending() {
    return this.prisma.member.findMany({ where: { membershipStatus: { in: [MembershipStatus.PENDING, MembershipStatus.PENDING_REVIEW] } }, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, email: true, status: true } } } });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, phone: true, status: true, lastLoginAt: true, createdAt: true } } },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async updateFinanceContact(id: string, dto: { phone?: string; whatsappNumber?: string }, actorId?: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    const data: any = {};
    if (dto.phone !== undefined) data.phone = this.normalizePhoneOptional(dto.phone);
    if (dto.whatsappNumber !== undefined) data.whatsappNumber = this.normalizePhoneOptional(dto.whatsappNumber);
    if (Object.keys(data).length === 0) return member;
    const updated = await this.prisma.member.update({ where: { id }, data });
    await this.prisma.auditLog.create({
      data: { actorId: actorId || null, action: 'MEMBER_CONTACT_UPDATED', entityType: 'Member', entityId: id, metadata: { fields: Object.keys(data) } },
    }).catch(() => null);
    return updated;
  }

  private async generateMemberNo() {
    const year = new Date().getFullYear();
    const count = await this.prisma.member.count({ where: { memberNo: { startsWith: `TAG-${year}-` } } });
    return `TAG-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  async approve(id: string, approvedByUserId?: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    const memberNo = member.memberNo || (await this.generateMemberNo());
    let userId = member.userId;
    if (!userId) {
      const email = member.email || `${memberNo.toLowerCase()}@members.tagchurch.org`;
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (!existing) {
        const tempPassword = randomBytes(6).toString('base64url');
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const memberRole = await this.prisma.role.upsert({ where: { name: 'CHURCH_MEMBER' }, update: {}, create: { name: 'CHURCH_MEMBER', description: 'Church member' } });
        const phoneTaken = member.phone ? await this.prisma.user.findFirst({ where: { phone: member.phone } }) : null;
        const user = await this.prisma.user.create({ data: { email, phone: phoneTaken ? null : (member.phone || null), passwordHash, status: UserStatus.ACTIVE, roles: { create: { roleId: memberRole.id, assignedBy: approvedByUserId } } } });
        userId = user.id;
      } else { userId = existing.id; const memberRole = await this.prisma.role.upsert({ where: { name: 'CHURCH_MEMBER' }, update: {}, create: { name: 'CHURCH_MEMBER', description: 'Church member' } }); await this.prisma.userRole.upsert({ where: { userId_roleId: { userId, roleId: memberRole.id } }, update: {}, create: { userId, roleId: memberRole.id, assignedBy: approvedByUserId } }); }
    }
    const updated = await this.prisma.member.update({ where: { id }, data: { memberNo, userId, membershipStatus: MembershipStatus.APPROVED, approvedAt: new Date(), approvedBy: approvedByUserId || null, joinedAt: member.joinedAt || new Date() }, include: { user: { select: { id: true, email: true, status: true } } } });
    await this.prisma.auditLog.create({ data: { actorId: approvedByUserId || null, action: 'MEMBER_APPROVED', entityType: 'Member', entityId: id, metadata: { memberNo, userId } } });
    return updated;
  }

  async reject(id: string, reason?: string, actorId?: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    const updated = await this.prisma.member.update({ where: { id }, data: { membershipStatus: MembershipStatus.REJECTED } });
    await this.prisma.auditLog.create({ data: { actorId: actorId || null, action: 'MEMBER_REJECTED', entityType: 'Member', entityId: id, metadata: { reason: reason || null } } });
    return updated;
  }

  async resetPassword(id: string, actorId?: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (!member.userId || !member.user) throw new BadRequestException('Member has no linked user account. Approve member first.');
    const tempPassword = randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    await this.prisma.user.update({ where: { id: member.userId }, data: { passwordHash, status: UserStatus.ACTIVE } });
    await this.prisma.auditLog.create({ data: { actorId: actorId || null, action: 'MEMBER_PASSWORD_RESET', entityType: 'User', entityId: member.userId, metadata: { memberId: member.id, memberNo: member.memberNo } } });
    return { success: true, memberId: member.id, email: member.user.email, temporaryPassword: tempPassword };
  }
  // Member self-service
  private readonly selfEditable = [
    'phone', 'whatsappNumber', 'address', 'currentRegion', 'currentDistrict', 'currentWard', 'currentStreet', 'currentLocation',
    'occupation', 'employmentStatus', 'maritalStatus', 'emergencyContactName', 'emergencyContactPhone',
  ] as const;

  async myProfile(userId?: string) {
    if (!userId) return null;
    const member = await this.prisma.member.findUnique({
      where: { userId },
      select: {
        id: true, memberNo: true, fullName: true, firstName: true, lastName: true,
        gender: true, phone: true, whatsappNumber: true, email: true, dateOfBirth: true, maritalStatus: true,
        originRegion: true, originDistrict: true, currentRegion: true, currentDistrict: true,
        currentWard: true, currentStreet: true, employmentStatus: true, occupation: true,
        emergencyContactName: true, emergencyContactPhone: true, baptismStatus: true,
        preferredDepartment: true, desiredDepartment: true, currentPosition: true, ushemasi: true,
        timeInChurch: true, expectedStayDuration: true,
        address: true, originalLocation: true, currentLocation: true,
        membershipStatus: true, joinedAt: true,
      },
    });
    return member;
  }

  async updateMyProfile(userId: string | undefined, dto: any) {
    if (!userId) throw new BadRequestException('Unauthorized');
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member profile not found');
    const data: any = {};
    for (const key of this.selfEditable) {
      if (dto[key] !== undefined) {
        const v = dto[key];
        if (['phone', 'whatsappNumber', 'emergencyContactPhone'].includes(key)) data[key] = this.normalizePhoneOptional(v);
        else data[key] = typeof v === 'string' && v.trim() === '' ? null : v;
      }
    }
    if (Object.keys(data).length === 0) return this.myProfile(userId);
    const updated = await this.prisma.member.update({ where: { id: member.id }, data });
    await this.prisma.auditLog.create({
      data: { actorId: userId, action: 'MEMBER_PROFILE_UPDATED', entityType: 'Member', entityId: member.id, metadata: { fields: Object.keys(data) } },
    }).catch(() => null);
    return this.myProfile(userId);
  }

  // My Requests (member self-service)
  async createMyRequest(userId: string | undefined, dto: any) {
    if (!userId) throw new BadRequestException('Unauthorized');
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member profile not found');
    const subject = String(dto?.subject || '').trim();
    const message = String(dto?.message || '').trim();
    if (!subject || !message) throw new BadRequestException('Subject and message are required');
    const created = await this.prisma.memberRequest.create({
      data: { memberId: member.id, subject: subject.slice(0, 200), message: message.slice(0, 5000) },
    });
    await this.prisma.auditLog.create({
      data: { actorId: userId, action: 'MEMBER_REQUEST_CREATED', entityType: 'MemberRequest', entityId: created.id, metadata: { subject } },
    }).catch(() => null);
    return created;
  }

  async listMyRequests(userId: string | undefined) {
    if (!userId) throw new BadRequestException('Unauthorized');
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) return [];
    return this.prisma.memberRequest.findMany({ where: { memberId: member.id }, orderBy: { createdAt: 'desc' } });
  }
}
