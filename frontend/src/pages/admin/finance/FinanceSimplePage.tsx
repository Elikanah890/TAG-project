import { PageHeader, SectionCard } from '@/components/admin/access/AccessUI';

export default function FinanceSimplePage({ title, description, eyebrow = 'Financial Accountability', children }: { title: string; description: string; eyebrow?: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <SectionCard title={title} description={description}>{children || <p className="text-sm text-gray-500">This section is available and will display live data as records are created. No fabricated figures are shown.</p>}</SectionCard>
    </div>
  );
}
