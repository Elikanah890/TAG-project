import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}
  private async audit(actorId: string|undefined, action: string, entityType: string, entityId?: string, metadata?: any) {
    await this.prisma.auditLog.create({ data: { actorId: actorId||null, action, entityType, entityId: entityId||null, metadata } }).catch(()=>null);
  }
  // Pages/Homepage
  listPages(){ return this.prisma.page.findMany({orderBy:{updatedAt:'desc'}}); }
  async upsertPage(dto:any, actor?:string){ const r = await this.prisma.page.upsert({ where:{slug:dto.slug}, update:{title:dto.title, content:dto.content||{}, status:dto.status||'DRAFT', publishedAt:dto.status==='PUBLISHED'?new Date():null}, create:{slug:dto.slug,title:dto.title,content:dto.content||{},status:dto.status||'DRAFT',publishedAt:dto.status==='PUBLISHED'?new Date():null} }); await this.audit(actor,'PAGE_SAVED','Page',r.id,{slug:r.slug}); return r; }
  async deletePage(id:string,actor?:string){ await this.audit(actor,'PAGE_DELETED','Page',id,{}); return this.prisma.page.delete({where:{id}}); }
  // News & Announcements
  listAnnouncements(){ return this.prisma.announcement.findMany({orderBy:{createdAt:'desc'}}); }
  private announcementData(dto:any){ const clean=(v:any)=>v===undefined?undefined:(v===''?null:v); return { title:dto.title,titleSw:clean(dto.titleSw),body:clean(dto.body),bodySw:clean(dto.bodySw),type:dto.type||undefined,imageUrl:clean(dto.imageUrl),status:dto.status,publishedAt:dto.status==='PUBLISHED'?(dto.publishedAt?new Date(dto.publishedAt):new Date()):dto.publishedAt===''?null:undefined }; }
  async createAnnouncement(dto:any,actor?:string){ const data:any=this.announcementData(dto); if(!data.type) data.type='NEWS'; if(!data.status) data.status='DRAFT'; const r=await this.prisma.announcement.create({data}); await this.audit(actor,'ANNOUNCEMENT_CREATED','Announcement',r.id,{}); return r; }
  async updateAnnouncement(id:string,dto:any,actor?:string){ const r=await this.prisma.announcement.update({where:{id},data:this.announcementData(dto)}); await this.audit(actor,'ANNOUNCEMENT_UPDATED','Announcement',id,{}); return r; }
  async deleteAnnouncement(id:string,actor?:string){ await this.audit(actor,'ANNOUNCEMENT_DELETED','Announcement',id,{}); return this.prisma.announcement.delete({where:{id}}); }
  // Events
  listEvents(){ return this.prisma.event.findMany({orderBy:{startAt:'desc'}}); }
  private eventData(dto:any){ const clean=(v:any)=>v===undefined?undefined:(v===''?null:v); return { title:dto.title,titleSw:clean(dto.titleSw),description:clean(dto.description),descriptionSw:clean(dto.descriptionSw),location:clean(dto.location),locationSw:clean(dto.locationSw),imageUrl:clean(dto.imageUrl),startAt:dto.startAt?new Date(dto.startAt):undefined,endAt:dto.endAt?new Date(dto.endAt):dto.endAt=== ''?null:undefined,timeLabel:clean(dto.timeLabel),category:clean(dto.category),ctaLabel:clean(dto.ctaLabel),ctaUrl:clean(dto.ctaUrl),status:dto.status }; }
  async createEvent(dto:any,actor?:string){ const data:any=this.eventData(dto); if(!data.status) data.status='DRAFT'; if(!data.startAt) data.startAt=new Date(); const r=await this.prisma.event.create({data}); await this.audit(actor,'EVENT_CREATED','Event',r.id,{}); return r; }
  async updateEvent(id:string,dto:any,actor?:string){ const r=await this.prisma.event.update({where:{id},data:this.eventData(dto)}); await this.audit(actor,'EVENT_UPDATED','Event',id,{}); return r; }
  async deleteEvent(id:string,actor?:string){ await this.audit(actor,'EVENT_DELETED','Event',id,{}); return this.prisma.event.delete({where:{id}}); }
  // Sermons
  listSermons(){ return this.prisma.sermon.findMany({orderBy:{preachedAt:'desc'}}); }
  private sermonData(dto:any){ const clean=(v:any)=>v===undefined?undefined:(v===''?null:v); return { title:dto.title,titleSw:clean(dto.titleSw),preacher:clean(dto.preacher),description:clean(dto.description),descriptionSw:clean(dto.descriptionSw),scripture:clean(dto.scripture),preachedAt:dto.preachedAt?new Date(dto.preachedAt):dto.preachedAt===''?null:undefined,duration:clean(dto.duration),mediaUrl:clean(dto.mediaUrl),videoUrl:clean(dto.videoUrl),thumbnailUrl:clean(dto.thumbnailUrl),series:clean(dto.series),tags:clean(dto.tags),status:dto.status }; }
  async createSermon(dto:any,actor?:string){ const data:any=this.sermonData(dto); if(!data.status) data.status='DRAFT'; const r=await this.prisma.sermon.create({data}); await this.audit(actor,'SERMON_CREATED','Sermon',r.id,{}); return r; }
  async updateSermon(id:string,dto:any,actor?:string){ const r=await this.prisma.sermon.update({where:{id},data:this.sermonData(dto)}); await this.audit(actor,'SERMON_UPDATED','Sermon',id,{}); return r; }
  async deleteSermon(id:string,actor?:string){ await this.audit(actor,'SERMON_DELETED','Sermon',id,{}); return this.prisma.sermon.delete({where:{id}}); }
  // Leadership
  listLeadership(){ return this.prisma.leadership.findMany({orderBy:[{ministry:'asc'},{order:'asc'},{createdAt:'asc'}]}); }
  private leadershipData(dto:any){ const clean=(v:any)=>v===undefined?undefined:(v===''?null:v); const bool=(v:any)=>v===undefined?undefined:(v===true||v==='true'); return { name:dto.name,title:dto.title,titleSw:clean(dto.titleSw),ministry:dto.ministry===undefined?undefined:(dto.ministry||null),bio:clean(dto.bio),bioSw:clean(dto.bioSw),imageUrl:clean(dto.imageUrl),phone:clean(dto.phone),email:clean(dto.email),featured:bool(dto.featured),roleType:clean(dto.roleType),order:dto.order!=null?Number(dto.order):undefined,status:dto.status }; }
  async createLeadership(dto:any,actor?:string){ const data:any=this.leadershipData(dto); if(data.order===undefined) data.order=0; if(data.featured===undefined) data.featured=false; if(!data.status) data.status='PUBLISHED'; const r=await this.prisma.leadership.create({data}); await this.audit(actor,'LEADERSHIP_CREATED','Leadership',r.id,{ministry:r.ministry}); return r; }
  async updateLeadership(id:string,dto:any,actor?:string){ try { const r=await this.prisma.leadership.update({where:{id},data:this.leadershipData(dto)}); await this.audit(actor,'LEADERSHIP_UPDATED','Leadership',id,{}); return r; } catch(e:any){ throw new NotFoundException('Leader not found'); } }
  async deleteLeadership(id:string,actor?:string){ await this.audit(actor,'LEADERSHIP_DELETED','Leadership',id,{}); return this.prisma.leadership.delete({where:{id}}); }
  // Ministries
  listMinistries(){ return this.prisma.ministry.findMany({orderBy:[{order:'asc'},{createdAt:'desc'}]}); }
  private ministryData(dto:any){
    const clean=(v:any)=> v===undefined?undefined:(v===''?null:v);
    const num=(v:any)=> v===undefined?undefined:(Number(v||0));
    const bool=(v:any)=> v===undefined?undefined:(v===true||v==='true'||v==='PUBLISHED_FEATURED');
    return {
      slug: clean(dto.slug), name: dto.name, nameSw: clean(dto.nameSw),
      description: clean(dto.description), descriptionSw: clean(dto.descriptionSw),
      vision: clean(dto.vision), visionSw: clean(dto.visionSw),
      mission: clean(dto.mission), missionSw: clean(dto.missionSw),
      purpose: clean(dto.purpose), purposeSw: clean(dto.purposeSw),
      revivalHistory: clean(dto.revivalHistory), revivalHistorySw: clean(dto.revivalHistorySw),
      leaderName: clean(dto.leaderName), logoUrl: clean(dto.logoUrl), imageUrl: clean(dto.imageUrl),
      category: clean(dto.category), featured: bool(dto.featured), order: num(dto.order), status: dto.status
    };
  }
  async createMinistry(dto:any,actor?:string){ const data:any=this.ministryData(dto); if(data.order===undefined) data.order=0; if(data.featured===undefined) data.featured=false; if(!data.status) data.status='PUBLISHED'; const r=await this.prisma.ministry.create({data}); await this.audit(actor,'MINISTRY_CREATED','Ministry',r.id,{slug:r.slug}); return r; }
  async updateMinistry(id:string,dto:any,actor?:string){ const r=await this.prisma.ministry.update({where:{id},data:this.ministryData(dto)}); await this.audit(actor,'MINISTRY_UPDATED','Ministry',id,{slug:r.slug}); return r; }
  async deleteMinistry(id:string,actor?:string){ await this.audit(actor,'MINISTRY_DELETED','Ministry',id,{}); return this.prisma.ministry.delete({where:{id}}); }
  // Testimonials
  listTestimonials(){ return this.prisma.testimonial.findMany({orderBy:[{order:'asc'},{createdAt:'desc'}]}); }
  private testimonialData(dto:any){ const clean=(v:any)=>v===undefined?undefined:(v===''?null:v); return { authorName:dto.authorName,role:clean(dto.role),titleEn:clean(dto.titleEn),titleSw:clean(dto.titleSw),quoteEn:dto.quoteEn,quoteSw:clean(dto.quoteSw),date:clean(dto.date),audioUrl:clean(dto.audioUrl),imageUrl:clean(dto.imageUrl),order:dto.order!=null?Number(dto.order):undefined,status:dto.status }; }
  async createTestimonial(dto:any,actor?:string){ const data:any=this.testimonialData(dto); if(data.order===undefined) data.order=0; if(!data.status) data.status='PUBLISHED'; const r=await this.prisma.testimonial.create({data}); await this.audit(actor,'TESTIMONIAL_CREATED','Testimonial',r.id,{}); return r; }
  async updateTestimonial(id:string,dto:any,actor?:string){ const r=await this.prisma.testimonial.update({where:{id},data:this.testimonialData(dto)}); await this.audit(actor,'TESTIMONIAL_UPDATED','Testimonial',id,{}); return r; }
  async deleteTestimonial(id:string,actor?:string){ await this.audit(actor,'TESTIMONIAL_DELETED','Testimonial',id,{}); return this.prisma.testimonial.delete({where:{id}}); }
  // Contact Messages
  listContactMessages(){ return this.prisma.contactMessage.findMany({orderBy:{createdAt:'desc'}}); }
  async updateContactMessage(id:string,dto:any,actor?:string){ const r=await this.prisma.contactMessage.update({where:{id},data:{status:dto.status||undefined}}); await this.audit(actor,'CONTACT_MESSAGE_UPDATED','ContactMessage',id,{status:r.status}); return r; }
  async deleteContactMessage(id:string,actor?:string){ await this.audit(actor,'CONTACT_MESSAGE_DELETED','ContactMessage',id,{}); return this.prisma.contactMessage.delete({where:{id}}); }

  // Media
  listMedia(){ return this.prisma.media.findMany({orderBy:{createdAt:'desc'}}); }
  async createUploadedMedia(dto:{title:string,url:string,category?:string|null,description?:string|null},actor?:string){ const r=await this.prisma.media.create({data:{title:dto.title,type:'IMAGE',url:dto.url,category:dto.category||null,description:dto.description||null,status:'ACTIVE'}}); await this.audit(actor,'MEDIA_UPLOADED','Media',r.id,{url:r.url}); return r; }
  async createMedia(dto:any,actor?:string){ const r=await this.prisma.media.create({data:{title:dto.title,type:dto.type||'IMAGE',url:dto.url,category:dto.category||null,description:dto.description||null,status:dto.status||'ACTIVE'}}); await this.audit(actor,'MEDIA_CREATED','Media',r.id,{}); return r; }
  async updateMedia(id:string,dto:any,actor?:string){ const r=await this.prisma.media.update({where:{id},data:{title:dto.title,type:dto.type,url:dto.url,category:dto.category,description:dto.description,status:dto.status}}); await this.audit(actor,'MEDIA_UPDATED','Media',id,{}); return r; }
  async deleteMedia(id:string,actor?:string){ await this.audit(actor,'MEDIA_DELETED','Media',id,{}); return this.prisma.media.delete({where:{id}}); }
}
