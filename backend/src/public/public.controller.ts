import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public')
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Get('leaders')
  async leaders(@Query('ministry') ministry?: string) {
    const where: any = { status: 'PUBLISHED' };
    if (ministry) where.ministry = ministry;
    return this.prisma.leadership.findMany({
      where,
      select: { id: true, name: true, title: true, titleSw: true, ministry: true, bio: true, bioSw: true, imageUrl: true, phone: true, email: true, featured: true, roleType: true, order: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  @Get('testimonials')
  async testimonials() {
    return this.prisma.testimonial.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, authorName: true, role: true, titleEn: true, titleSw: true, quoteEn: true, quoteSw: true, date: true, audioUrl: true, imageUrl: true, order: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  @Get('ministries')
  async ministries() {
    return this.prisma.ministry.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  @Get('events')
  async events() {
    return this.prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ startAt: 'asc' }],
    });
  }

  @Get('announcements')
  async announcements() {
    return this.prisma.announcement.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  @Get('sermons')
  async sermons() {
    return this.prisma.sermon.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ preachedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  @Get('pages')
  async pages() {
    return this.prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, slug: true, title: true, content: true, updatedAt: true, publishedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  @Get('page')
  async page(@Query('slug') slug?: string) {
    if (!slug) return null;
    return this.prisma.page.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true, slug: true, title: true, content: true, updatedAt: true, publishedAt: true },
    });
  }

  @Get('settings')
  async settings() {
    const rows = await this.prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  }

  @Post('contact-message')
  async contactMessage(@Body() body: any) {
    const name = String(body?.name || '').trim();
    const message = String(body?.message || '').trim();
    if (!name || !message) return { ok: false, message: 'Name and message are required' };
    await this.prisma.contactMessage.create({
      data: {
        name,
        email: body?.email ? String(body.email).trim() : null,
        phone: body?.phone ? String(body.phone).trim() : null,
        subject: body?.subject ? String(body.subject).trim() : null,
        message,
        status: 'NEW',
      },
    });
    return { ok: true };
  }
}
