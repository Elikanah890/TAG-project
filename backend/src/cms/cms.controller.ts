import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/enums/roles.enum';

@Controller('cms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CmsController {
  constructor(private service: CmsService) {}

  // READ-ONLY reports/views: WEBSITE_ADMIN operates, SYSTEM_ADMIN oversees
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('pages') pages(){ return this.service.listPages(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('announcements') anns(){ return this.service.listAnnouncements(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('events') events(){ return this.service.listEvents(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('sermons') sermons(){ return this.service.listSermons(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('leadership') leaders(){ return this.service.listLeadership(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('ministries') mins(){ return this.service.listMinistries(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('media') media(){ return this.service.listMedia(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('testimonials') testimonials(){ return this.service.listTestimonials(); }
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('contact-messages') contactMessages(){ return this.service.listContactMessages(); }

  // OPERATIONAL (write) - WEBSITE_ADMIN only
  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('pages') upsertPage(@Body() b:any,@Req() r:any){ return this.service.upsertPage(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('pages/:id') delPage(@Param('id') id:string,@Req() r:any){ return this.service.deletePage(id,r.user?.userId); }

  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('announcements') cAnn(@Body() b:any,@Req() r:any){ return this.service.createAnnouncement(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('announcements/:id') uAnn(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateAnnouncement(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('announcements/:id') dAnn(@Param('id') id:string,@Req() r:any){ return this.service.deleteAnnouncement(id,r.user?.userId); }

  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('contact-messages/:id') uContact(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateContactMessage(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('contact-messages/:id') dContact(@Param('id') id:string,@Req() r:any){ return this.service.deleteContactMessage(id,r.user?.userId); }

  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('events') cEv(@Body() b:any,@Req() r:any){ return this.service.createEvent(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('events/:id') uEv(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateEvent(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('events/:id') dEv(@Param('id') id:string,@Req() r:any){ return this.service.deleteEvent(id,r.user?.userId); }

  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('sermons') cSer(@Body() b:any,@Req() r:any){ return this.service.createSermon(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('sermons/:id') uSer(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateSermon(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('sermons/:id') dSer(@Param('id') id:string,@Req() r:any){ return this.service.deleteSermon(id,r.user?.userId); }

  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Post('media/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const dir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
        mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
        cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.mimetype)) return cb(new BadRequestException('Only JPEG, PNG, WebP or GIF images are allowed'), false);
      cb(null, true);
    },
  }))
  uploadMedia(@UploadedFile() file: any, @Body() body: any, @Req() r: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.service.createUploadedMedia({
      title: body?.title || file.originalname,
      url: `/uploads/${file.filename}`,
      category: body?.category || 'LEADERS',
      description: body?.description || null,
    }, r.user?.userId);
  }

  // Leadership CRUD: WEBSITE_ADMIN operates; SYSTEM_ADMIN read-only oversight
  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('leadership') cLead(@Body() b:any,@Req() r:any){ return this.service.createLeadership(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('leadership/:id') uLead(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateLeadership(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('leadership/:id') dLead(@Param('id') id:string,@Req() r:any){ return this.service.deleteLeadership(id,r.user?.userId); }

  // /cms/leaders aliases (same handlers, same guards)
  @Roles(RoleName.SYSTEM_ADMIN, RoleName.WEBSITE_ADMIN)
  @Get('leaders') leadersAlias(){ return this.service.listLeadership(); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('leaders') cLeaders(@Body() b:any,@Req() r:any){ return this.service.createLeadership(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('leaders/:id') uLeaders(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateLeadership(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('leaders/:id') dLeaders(@Param('id') id:string,@Req() r:any){ return this.service.deleteLeadership(id,r.user?.userId); }

  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('ministries') cMin(@Body() b:any,@Req() r:any){ return this.service.createMinistry(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('ministries/:id') uMin(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateMinistry(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('ministries/:id') dMin(@Param('id') id:string,@Req() r:any){ return this.service.deleteMinistry(id,r.user?.userId); }

  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('media') cMed(@Body() b:any,@Req() r:any){ return this.service.createMedia(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('media/:id') uMed(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateMedia(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('media/:id') dMed(@Param('id') id:string,@Req() r:any){ return this.service.deleteMedia(id,r.user?.userId); }

  @Roles(RoleName.WEBSITE_ADMIN)
  @Post('testimonials') cTes(@Body() b:any,@Req() r:any){ return this.service.createTestimonial(b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Put('testimonials/:id') uTes(@Param('id') id:string,@Body() b:any,@Req() r:any){ return this.service.updateTestimonial(id,b,r.user?.userId); }
  @Roles(RoleName.WEBSITE_ADMIN)
  @Delete('testimonials/:id') dTes(@Param('id') id:string,@Req() r:any){ return this.service.deleteTestimonial(id,r.user?.userId); }
}
