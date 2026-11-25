import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordSundayAttendanceDto } from './dto/record-sunday-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async recordSunday(dto: RecordSundayAttendanceDto, actorId?: string) {
    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);
    const firstServiceCount = Number(dto.firstServiceCount || 0);
    const secondServiceCount = Number(dto.secondServiceCount || 0);
    const totalCount = firstServiceCount + secondServiceCount;

    const record = await this.prisma.sundayAttendance.upsert({
      where: { date },
      create: {
        date,
        firstServiceCount,
        secondServiceCount,
        totalCount,
        recordedById: actorId || null,
      },
      update: {
        firstServiceCount,
        secondServiceCount,
        totalCount,
        recordedById: actorId || null,
      },
      include: { recordedBy: { select: { id: true, email: true } } },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action: 'SUNDAY_ATTENDANCE_SAVED',
        entityType: 'SundayAttendance',
        entityId: record.id,
        metadata: { date: record.date, firstServiceCount, secondServiceCount, totalCount },
      },
    }).catch(() => null);

    return record;
  }

  async latestSunday() {
    return this.prisma.sundayAttendance.findFirst({
      orderBy: { date: 'desc' },
      include: { recordedBy: { select: { id: true, email: true } } },
    });
  }

  async listSunday(limit = 20) {
    return this.prisma.sundayAttendance.findMany({
      orderBy: { date: 'desc' },
      take: limit,
      include: { recordedBy: { select: { id: true, email: true } } },
    });
  }
}
