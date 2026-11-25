import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_SITE_SETTINGS = [
  'nav_home_label', 'nav_about_label', 'nav_leadership_label', 'nav_ministries_label', 'nav_schedule_label', 'nav_news_label', 'nav_giving_label', 'nav_contact_label', 'nav_testimonials_label', 'nav_register_label', 'nav_login_label', 'nav_give_label',
  'hero_welcome', 'hero_tagline', 'hero_subtitle_en', 'hero_subtitle_sw', 'hero_images_json',
  'hero_title_line1', 'hero_title_line2', 'hero_watch_url',
  'church_name', 'church_short_name', 'church_tagline_en', 'church_tagline_sw', 'church_logo_url',
  'about_title_en', 'about_title_sw', 'about_subtitle_en', 'about_subtitle_sw',
  'about_history_en', 'about_history_sw', 'about_vision_en', 'about_vision_sw',
  'about_mission_en', 'about_mission_sw', 'about_values_en', 'about_values_sw',
  'about_members_count', 'about_members_label_en', 'about_members_label_sw',
  'about_pastor_message_en', 'about_pastor_message_sw', 'about_pastor_name', 'about_pastor_role_en', 'about_pastor_role_sw',
  'statement_faith_en', 'statement_faith_sw',
  'contact_phone', 'contact_phone_display', 'contact_email',
  'contact_address_en', 'contact_address_sw', 'contact_city', 'contact_country',
  'office_hours_en', 'office_hours_sw', 'map_embed_url',
  'social_whatsapp', 'social_youtube', 'social_instagram', 'social_facebook', 'social_tiktok',
  'giving_church_name', 'giving_contact_label_en', 'giving_contact_label_sw', 'giving_contact_phone', 'giving_note_en', 'giving_note_sw',
  'giving_title_en', 'giving_title_sw', 'giving_description_en', 'giving_description_sw',
  'giving_banner_title_en', 'giving_banner_title_sw', 'giving_banner_desc_en', 'giving_banner_desc_sw',
  'home_about_image', 'home_about_stat_value', 'home_about_stat_label_en', 'home_about_stat_label_sw',
  'home_values_json',
  'footer_description_en', 'footer_description_sw', 'footer_copyright_text',
] as const;

@Injectable()
export class SiteSettingsService {
  constructor(private prisma: PrismaService) {}

  async getPublic() {
    const rows = await this.prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  }

  async getAdmin() {
    return this.getPublic();
  }

  async updateMany(data: Record<string, string>, actorId?: string) {
    const allowed = new Set<string>(ALLOWED_SITE_SETTINGS);
    const updates: any[] = [];
    for (const [key, raw] of Object.entries(data || {})) {
      if (!allowed.has(key)) continue;
      const value = String(raw ?? '');
      updates.push(this.prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }));
      updates.push(this.prisma.auditLog.create({
        data: { actorId: actorId || null, action: 'CMS_SETTING_UPDATED', entityType: 'SiteSetting', entityId: key, metadata: { key, value } },
      }));
    }
    if (updates.length) await this.prisma.$transaction(updates);
    return this.getPublic();
  }
}
