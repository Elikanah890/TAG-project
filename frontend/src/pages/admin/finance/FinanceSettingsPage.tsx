import { PageHeader, SectionCard } from '@/components/admin/access/AccessUI';

export default function FinanceSettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Settings" title="Finance Settings" description="Finance configuration and operational defaults." />
      <SectionCard title="Current defaults" description="These reflect current system behavior.">
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>Currency: <span className="font-medium">TZS</span></li>
          <li>Receipt numbering: <span className="font-medium">RCT-YYYY-NNNN</span> (advisory-locked, unique)</li>
          <li>Invoice numbering: <span className="font-medium">INV-YYYY-NNNN</span> (advisory-locked, unique)</li>
          <li>WhatsApp sharing: <span className="font-medium">Click-to-chat</span> (initiated action logged; delivery not claimed)</li>
          <li>Invoice payments: linked to Contribution records by <span className="font-medium">invoiceId</span> to avoid duplicate income</li>
        </ul>
      </SectionCard>
    </div>
  );
}
