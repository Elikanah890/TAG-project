import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}
  private async audit(actorId: string|undefined, action: string, entityType: string, entityId?: string, metadata?: any) {
    await this.prisma.auditLog.create({ data: { actorId: actorId||null, action, entityType, entityId: entityId||null, metadata } });
  }
  // Departments
  listDepartments() { return this.prisma.department.findMany({ orderBy: { createdAt: 'desc' } }); }
  async createDepartment(dto:any, actor?:string){ const r=await this.prisma.department.create({data:{name:dto.name,description:dto.description||null,headName:dto.headName||null,status:dto.status||'ACTIVE'}}); await this.audit(actor,'DEPARTMENT_CREATED','Department',r.id,{}); return r; }
  async updateDepartment(id:string,dto:any,actor?:string){ const r=await this.prisma.department.update({where:{id},data:{name:dto.name,description:dto.description,headName:dto.headName,status:dto.status}}); await this.audit(actor,'DEPARTMENT_UPDATED','Department',id,{}); return r; }
  async deleteDepartment(id:string,actor?:string){ await this.audit(actor,'DEPARTMENT_DELETED','Department',id,{}); return this.prisma.department.delete({where:{id}}); }
  // Fellowships
  listFellowships() { return this.prisma.fellowship.findMany({ orderBy: { createdAt: 'desc' } }); }
  async createFellowship(dto:any, actor?:string){ const r=await this.prisma.fellowship.create({data:{name:dto.name,description:dto.description||null,leaderName:dto.leaderName||null,schedule:dto.schedule||null,status:dto.status||'ACTIVE'}}); await this.audit(actor,'FELLOWSHIP_CREATED','Fellowship',r.id,{}); return r; }
  async updateFellowship(id:string,dto:any,actor?:string){ const r=await this.prisma.fellowship.update({where:{id},data:{name:dto.name,description:dto.description,leaderName:dto.leaderName,schedule:dto.schedule,status:dto.status}}); await this.audit(actor,'FELLOWSHIP_UPDATED','Fellowship',id,{}); return r; }
  async deleteFellowship(id:string,actor?:string){ await this.audit(actor,'FELLOWSHIP_DELETED','Fellowship',id,{}); return this.prisma.fellowship.delete({where:{id}}); }
  // Meetings
  listMeetings() { return this.prisma.meeting.findMany({ orderBy: { startsAt: 'desc' }, include:{ _count:{select:{attendances:true}} } }); }
  async createMeeting(dto:any, actor?:string){ const r=await this.prisma.meeting.create({data:{title:dto.title,type:dto.type||null,description:dto.description||null,location:dto.location||null,startsAt:new Date(dto.startsAt),endsAt:dto.endsAt?new Date(dto.endsAt):null,status:dto.status||'SCHEDULED'}}); await this.audit(actor,'MEETING_CREATED','Meeting',r.id,{}); return r; }
  async updateMeeting(id:string,dto:any,actor?:string){ const r=await this.prisma.meeting.update({where:{id},data:{title:dto.title,type:dto.type,description:dto.description,location:dto.location,startsAt:dto.startsAt?new Date(dto.startsAt):undefined,endsAt:dto.endsAt?new Date(dto.endsAt):null,status:dto.status}}); await this.audit(actor,'MEETING_UPDATED','Meeting',id,{}); return r; }
  async deleteMeeting(id:string,actor?:string){ await this.audit(actor,'MEETING_DELETED','Meeting',id,{}); return this.prisma.meeting.delete({where:{id}}); }
  // Attendance
  listAttendance(meetingId?: string) { return this.prisma.attendance.findMany({ where: meetingId?{meetingId}:undefined, orderBy:{createdAt:'desc'}, include:{ meeting:true, member:{select:{id:true,fullName:true,memberNo:true}} } }); }
  async createAttendance(dto:any, actor?:string){ const r=await this.prisma.attendance.create({data:{meetingId:dto.meetingId,memberId:dto.memberId||null,fullName:dto.fullName||null,status:dto.status||'PRESENT',notes:dto.notes||null}}); await this.audit(actor,'ATTENDANCE_RECORDED','Attendance',r.id,{}); return r; }
  async deleteAttendance(id:string,actor?:string){ await this.audit(actor,'ATTENDANCE_DELETED','Attendance',id,{}); return this.prisma.attendance.delete({where:{id}}); }
  // Followups
  listFollowups() { return this.prisma.followupCase.findMany({ orderBy:{createdAt:'desc'}, include:{ member:{select:{id:true,fullName:true,memberNo:true}} } }); }
  async createFollowup(dto:any, actor?:string){ const r=await this.prisma.followupCase.create({data:{memberId:dto.memberId||null,subject:dto.subject,description:dto.description||null,assignedTo:dto.assignedTo||null,status:dto.status||'OPEN',priority:dto.priority||'NORMAL',dueDate:dto.dueDate?new Date(dto.dueDate):null}}); await this.audit(actor,'FOLLOWUP_CREATED','FollowupCase',r.id,{}); return r; }
  async updateFollowup(id:string,dto:any,actor?:string){ const r=await this.prisma.followupCase.update({where:{id},data:{memberId:dto.memberId||null,subject:dto.subject,description:dto.description,assignedTo:dto.assignedTo,status:dto.status,priority:dto.priority,dueDate:dto.dueDate?new Date(dto.dueDate):null}}); await this.audit(actor,'FOLLOWUP_UPDATED','FollowupCase',id,{}); return r; }
  async deleteFollowup(id:string,actor?:string){ await this.audit(actor,'FOLLOWUP_DELETED','FollowupCase',id,{}); return this.prisma.followupCase.delete({where:{id}}); }
  // Tasks
  listTasks() { return this.prisma.task.findMany({ orderBy:{createdAt:'desc'} }); }
  async createTask(dto:any, actor?:string){ const r=await this.prisma.task.create({data:{title:dto.title,description:dto.description||null,assignedTo:dto.assignedTo||null,status:dto.status||'PENDING',priority:dto.priority||'NORMAL',dueDate:dto.dueDate?new Date(dto.dueDate):null}}); await this.audit(actor,'TASK_CREATED','Task',r.id,{}); return r; }
  async updateTask(id:string,dto:any,actor?:string){ const r=await this.prisma.task.update({where:{id},data:{title:dto.title,description:dto.description,assignedTo:dto.assignedTo,status:dto.status,priority:dto.priority,dueDate:dto.dueDate?new Date(dto.dueDate):null}}); await this.audit(actor,'TASK_UPDATED','Task',id,{}); return r; }
  async deleteTask(id:string,actor?:string){ await this.audit(actor,'TASK_DELETED','Task',id,{}); return this.prisma.task.delete({where:{id}}); }
}
