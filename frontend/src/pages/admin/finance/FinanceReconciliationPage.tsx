import { PageHeader, SectionCard } from '@/components/admin/access/AccessUI';

export default function FinanceReconciliationPage() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Financial Accountability" title="Reconciliation" description="Compare recorded transactions against bank/mobile money/cash statements. No original transactions are silently edited." />
      <SectionCard title="Reconciliation workspace" description="Reconciliation records should be created from actual statement comparisons.">
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 text-sm text-gray-600 space-y-2">
          <p><span className="font-medium text-gray-800">Supported checks:</span> missing transactions, duplicates, amount mismatches, unmatched records.</p>
          <p><span className="font-medium text-gray-800">Rule:</span> do not silently edit original transactions during reconciliation; use adjustment/reversal workflows with audit history.</p>
          <p className="text-gray-500">No fabricated reconciliation data is displayed.</p>
        </div>
      </SectionCard>
    </div>
  );
}
