import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import api from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';

export default function SermonsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'sw';
  const { data=[] } = useQuery({ queryKey:['public-sermons'], queryFn: async()=> (await api.get('/public/sermons')).data, staleTime:30000 });
  const items = Array.isArray(data) ? data : [];
  return <Layout>
    <PageHeader align="center" title={lang==='sw'?'Mahubiri':'Sermons'} subtitle={lang==='sw'?'Sikiliza na tazama mahubiri ya hivi karibuni.':'Watch and listen to recent sermons.'} />
    <section className="section-padding bg-background border-b border-black/5"><div className="container-church grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.length===0 ? <p className="text-black/60">{lang==='sw'?'Hakuna mahubiri kwa sasa.':'No sermons available yet.'}</p> : items.map((s:any)=>(
        <article key={s.id} className="card-church bg-white shadow-soft border border-black/5">
          {s.thumbnailUrl ? <img src={resolveMediaUrl(s.thumbnailUrl)} alt={s.title} className="mb-4 aspect-video w-full rounded-md object-cover" /> : null}
          <h3 className="font-serif text-xl font-semibold text-black">{lang==='sw'?(s.titleSw||s.title):s.title}</h3>
          <p className="text-sm text-black/60 mt-1">{s.preacher}{s.preachedAt ? ` • ${new Date(s.preachedAt).toLocaleDateString()}`:''}{s.duration ? ` • ${s.duration}`:''}</p>
          {s.scripture && <p className="text-sm text-[#8A6A00] mt-1">{s.scripture}</p>}
          <p className="text-sm text-black/70 mt-3 whitespace-pre-wrap">{lang==='sw'?(s.descriptionSw||s.description):s.description}</p>
          <div className="mt-4 flex gap-3 text-sm">
            {s.mediaUrl && <a className="text-[#8A6A00] underline" href={resolveMediaUrl(s.mediaUrl)} target="_blank" rel="noreferrer">Audio</a>}
            {s.videoUrl && <a className="text-[#8A6A00] underline" href={resolveMediaUrl(s.videoUrl)} target="_blank" rel="noreferrer">Video</a>}
          </div>
        </article>
      ))}
    </div></section>
  </Layout>;
}
