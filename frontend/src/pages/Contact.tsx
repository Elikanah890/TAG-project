import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import api from '@/lib/api';
import { churchConfig } from '@/lib/churchData';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data: page } = useQuery({ queryKey: ['public-page', 'contact'], queryFn: async () => (await api.get('/public/page?slug=contact')).data, staleTime: 30000 });
  const { data: settings = {} } = useQuery({ queryKey: ['site-settings-public'], queryFn: async () => (await api.get('/site-settings/public')).data, staleTime: 30000 });
  const c = page?.content || {};
  const phone = settings.contact_phone || churchConfig.contact.phone;
  const phoneDisplay = settings.contact_phone_display || churchConfig.contact.phoneDisplay;
  const email = settings.contact_email || churchConfig.contact.email;
  const address = lang === 'en' ? (c.addressValueEn || settings.contact_address_en || 'T.A.G Forest Ya Kwanza Church, Forest, Mbeya, Tanzania') : (c.addressValueSw || settings.contact_address_sw || 'Kanisa T.A.G Forest Ya Kwanza, Forest, Mbeya, Tanzania');
  const hours = lang === 'en' ? (settings.office_hours_en || churchConfig.contact.officeHours.en) : (settings.office_hours_sw || churchConfig.contact.officeHours.sw);
  const mapUrl = settings.map_embed_url || 'https://www.openstreetmap.org/export/embed.html?bbox=33.4380%2C-8.9155%2C33.4548%2C-8.9005&layer=mapnik&marker=-8.9080%2C33.4464';

  return (
    <Layout>
      <PageHeader align="center" title={lang === 'en' ? (c.titleEn || 'Contact Us') : (c.titleSw || 'Wasiliana Nasi')} subtitle={lang === 'en' ? (c.subtitleEn || "We're here and ready to connect with you.") : (c.subtitleSw || 'Tuko hapa kwa ajili yako, wasiliana nasi.')} />
      <section className="section-padding bg-background border-b border-black/5">
        <div className="container-church">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4"><MapPin className="w-6 h-6 text-[#8A6A00] mt-1" /><div><h3 className="font-semibold text-black">{lang === 'en' ? (c.addressLabelEn || 'Address') : (c.addressLabelSw || 'Anwani')}</h3><p className="text-black/60">{address}</p></div></div>
                <div className="flex items-start gap-4"><Phone className="w-6 h-6 text-[#8A6A00] mt-1" /><div><h3 className="font-semibold text-black">{lang === 'en' ? (c.phoneLabelEn || 'Phone') : (c.phoneLabelSw || 'Simu')}</h3><a href={`tel:${phone}`} className="text-black/60 hover:text-primary">{phoneDisplay}</a></div></div>
                <div className="flex items-start gap-4"><Mail className="w-6 h-6 text-[#8A6A00] mt-1" /><div><h3 className="font-semibold text-black">{lang === 'en' ? (c.emailLabelEn || 'Email') : (c.emailLabelSw || 'Barua Pepe')}</h3><a href={`mailto:${email}`} className="text-black/60 hover:text-primary">{email}</a></div></div>
                <div className="flex items-start gap-4"><Clock className="w-6 h-6 text-[#8A6A00] mt-1" /><div><h3 className="font-semibold text-black">{lang === 'en' ? (c.hoursLabelEn || 'Office Hours') : (c.hoursLabelSw || 'Saa za Ofisi')}</h3><p className="text-black/60">{hours}</p></div></div>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden border border-border"><iframe title="Church Location" src={mapUrl} style={{ border: 0 }} width="100%" height="100%" allowFullScreen loading="lazy" /></div>
              <p className="text-center text-sm text-black/60 mt-2">{lang === 'en' ? (c.mapNoteEn || 'Map showing the approximate location of the church in Forest, Mbeya.') : (c.mapNoteSw || 'Ramani inayoonyesha takriban eneo la kanisa Forest, Mbeya.')}</p>
            </div>
            <div className="card-church bg-white shadow-soft border border-black/5">
              <h2 className="font-serif text-2xl font-bold text-black mb-6">{lang === 'en' ? (c.formTitleEn || 'Send us a Message') : (c.formTitleSw || 'Tutumie Ujumbe')}</h2>
              <form className="space-y-4" onSubmit={async (e)=>{e.preventDefault(); const fd=new FormData(e.currentTarget as HTMLFormElement); const payload={name:String(fd.get('name')||''), email:String(fd.get('email')||''), subject:String(fd.get('subject')||''), message:String(fd.get('message')||''), phone:String(fd.get('phone')||'')}; try { await api.post('/public/contact-message', payload); (e.currentTarget as HTMLFormElement).reset(); alert(lang==='sw'?'Ujumbe umetumwa kikamilifu':'Message sent successfully'); } catch(err:any){ alert(err?.response?.data?.message || (lang==='sw'?'Imeshindwa kutuma ujumbe':'Failed to send message')); } }}>
                <Input name="name" required placeholder={lang === 'en' ? 'Your Name' : 'Jina Lako'} />
                <Input name="email" type="email" placeholder={lang === 'en' ? 'Your Email' : 'Barua Pepe Yako'} />
                <Input name="phone" placeholder={lang === 'en' ? 'Phone (optional)' : 'Simu (hiari)'} />
                <Input name="subject" placeholder={lang === 'en' ? 'Subject' : 'Mada'} />
                <Textarea name="message" required placeholder={lang === 'en' ? 'Your Message' : 'Ujumbe Wako'} rows={5} />
                <Button className="btn-primary-church w-full" type="submit">{lang === 'en' ? 'Send Message' : 'Tuma Ujumbe'}</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
