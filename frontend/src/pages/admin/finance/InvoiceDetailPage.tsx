import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, MessageCircle, ReceiptText, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ErrorBlock, LoadingBlock, PageHeader, SectionCard, formatDate, formatMoney } from '@/components/admin/access/AccessUI';
import { cn } from '@/lib/utils';

const CATEGORIES = ['ZAKA', 'FUNGU_LA_KUMI', 'SADAKA', 'UJENZI', 'GENERAL_DONATION', 'PROJECT', 'SPECIAL'];

function statusClass(status?: string) {
  const value = String(status || '').toUpperCase();
  if (['PAID', 'CONFIRMED'].includes(value)) return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (['PARTIALLY_PAID', 'ISSUED', 'SENT', 'PENDING'].includes(value)) return 'border-gray-100 bg-[#C9962B]/10 text-[#7A5A10]';
  if (['OVERDUE', 'CANCELLED', 'FAILED', 'REVERSED'].includes(value)) return 'border-rose-200 bg-rose-50 text-rose-800';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function whatsappUrl(phone?: string | null, text?: string) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d]/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text || '')}`;
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [category, setCategory] = useState('UJENZI');
  const [reference, setReference] = useState('');
  const [receiptNo, setReceiptNo] = useState<string | null>(null);

  const invoiceQuery = useQuery({
    queryKey: ['finance-invoice', id],
    queryFn: async () => (await api.get(`/finance/invoices/${id}`)).data,
    enabled: !!id,
  });

  const record = useMutation({
    mutationFn: async () => (await api.post(`/finance/invoices/${id}/payments`, { amount: Number(amount), method, category, reference: reference || undefined })).data,
    onSuccess: (data: any) => {
      setReceiptNo(data?.receiptNo || null);
      setAmount(''); setReference('');
      toast.success(`Payment recorded. Receipt ${data?.receiptNo || ''}`);
      qc.invalidateQueries({ queryKey: ['finance-invoice', id] });
      qc.invalidateQueries({ queryKey: ['finance-invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard-finance'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to record payment'),
  });

  const downloadInvoice = async () => {
    if (!id) return;
    const res = await api.get(`/finance/invoices/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceQuery.data?.invoiceNo || 'invoice'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReceipt = async () => {
    if (!receiptNo) return;
    const res = await api.get(`/finance/receipts/${receiptNo}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receiptNo}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const invoice = invoiceQuery.data;
  const wa = useMemo(() => {
    if (!invoice) return null;
    const msg = `Hello ${invoice.recipientName},\n\nTAG Forest Church has prepared an invoice for you.\n\nInvoice Number: ${invoice.invoiceNo}\nDescription: ${invoice.title || String(invoice.category || 'Church Contribution').replaceAll('_', ' ')}\nAmount Due: ${formatMoney(invoice.outstandingAmount)}\nDue Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}\n\nPlease review the invoice and follow the payment instructions provided.\n\nThank you.\nTAG Forest Church.`;
    return { url: whatsappUrl(invoice.recipientWhatsapp || invoice.recipientPhone || invoice.member?.whatsappNumber || invoice.member?.phone, msg), message: msg, phone: invoice.recipientWhatsapp || invoice.recipientPhone || invoice.member?.whatsappNumber || invoice.member?.phone };
  }, [invoice]);

  const shareWhatsapp = async () => {
    if (!wa?.url) return;
    try { await api.post(`/finance/invoices/${id}/whatsapp-log`, { messageBody: wa.message }); } catch { /* do not block sharing */ }
    window.open(wa.url, '_blank', 'noopener,noreferrer');
    toast.success('WhatsApp opened with prepared message (delivery not confirmed).');
  };

  if (invoiceQuery.isLoading) return <LoadingBlock label="Loading invoice…" />;
  if (invoiceQuery.isError || !invoice) return <ErrorBlock message={(invoiceQuery.error as any)?.response?.data?.message || 'Invoice not found'} onRetry={invoiceQuery.refetch} />;

  const canPay = !['PAID', 'CANCELLED'].includes(String(invoice.status)) && Number(invoice.outstandingAmount) > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Income & Receipts"
        title={invoice.invoiceNo}
        description={`Invoice for ${invoice.recipientName} · ${formatDate(invoice.issueDate)}`}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/admin/finance/invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back to invoices</Link></Button>
            <Button variant="outline" onClick={downloadInvoice}><Download className="mr-2 h-4 w-4" />Download PDF</Button>
            {wa?.url ? <Button onClick={shareWhatsapp} className="bg-emerald-700 text-white hover:bg-emerald-800"><MessageCircle className="mr-2 h-4 w-4" />Share via WhatsApp</Button> : <Button variant="outline" disabled><MessageCircle className="mr-2 h-4 w-4" />No WhatsApp number</Button>}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_420px]">
        <div className="space-y-4">
          <SectionCard title="Invoice summary" description="Amounts are calculated from recorded line items and confirmed payments.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-100 bg-white/70 p-3"><p className="text-[10px] uppercase tracking-wide text-gray-500">Status</p><div className="mt-2"><Badge variant="outline" className={cn('font-semibold', statusClass(invoice.status))}>{String(invoice.status).replaceAll('_', ' ')}</Badge></div></div>
              <div className="rounded-lg border border-gray-100 bg-white/70 p-3"><p className="text-[10px] uppercase tracking-wide text-gray-500">Total</p><p className="mt-1 text-lg font-semibold text-gray-800">{formatMoney(invoice.total)}</p></div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3"><p className="text-[10px] uppercase tracking-wide text-gray-500">Paid</p><p className="mt-1 text-lg font-semibold text-emerald-800">{formatMoney(invoice.paidAmount)}</p></div>
              <div className={cn('rounded-lg border p-3', Number(invoice.outstandingAmount) > 0 ? 'border-gray-100 bg-[#C9962B]/10' : 'border-emerald-100 bg-emerald-50/60')}><p className="text-[10px] uppercase tracking-wide text-gray-500">Outstanding</p><p className="mt-1 text-lg font-semibold text-gray-800">{formatMoney(invoice.outstandingAmount)}</p></div>
            </div>

            <div className="mt-4 grid gap-3 rounded-lg border border-gray-100 bg-white/70 p-4 text-sm sm:grid-cols-2">
              <div><p className="text-xs uppercase tracking-wide text-gray-500">Recipient</p><p className="mt-1 font-medium text-gray-800">{invoice.recipientName}</p>{invoice.member?.memberNo ? <p className="text-xs text-gray-500">Member No: {invoice.member.memberNo}</p> : <p className="text-xs text-amber-700">Unregistered / Ad-hoc recipient</p>}{invoice.title ? <p className="text-xs text-gray-500">{invoice.title}</p> : null}</div>
              <div><p className="text-xs uppercase tracking-wide text-gray-500">Contact</p><p className="mt-1 text-gray-500">{invoice.recipientEmail || invoice.member?.email || 'No email'} · {invoice.recipientPhone || invoice.member?.phone || 'No phone'} · WA: {invoice.recipientWhatsapp || invoice.member?.whatsappNumber || '—'}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-gray-500">Issue date</p><p className="mt-1 text-gray-500">{formatDate(invoice.issueDate)}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-gray-500">Due date</p><p className="mt-1 text-gray-500">{invoice.dueDate ? formatDate(invoice.dueDate) : 'Not set'}</p></div>
            </div>

            <div className="mt-4 overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(invoice.items || []).map((item: any) => (
                    <TableRow key={item.id}><TableCell className="text-sm">{item.description}</TableCell><TableCell className="text-right font-medium">{formatMoney(item.amount)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          <SectionCard title="Payment history" description="Confirmed contribution records linked to this invoice.">
            {(invoice.contributions || []).length ? (
              <div className="overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Receipt</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {invoice.contributions.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap text-xs text-gray-500">{formatDate(payment.contributedAt)}</TableCell>
                        <TableCell className="font-mono text-xs">{payment.receiptNo || '—'}</TableCell>
                        <TableCell className="text-xs">{payment.paymentMethod || '—'}</TableCell>
                        <TableCell className="text-right font-medium">{formatMoney(payment.amount)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn('font-semibold', statusClass(payment.status))}>{payment.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : <p className="text-sm text-gray-500">No payments recorded yet.</p>}
          </SectionCard>
        </div>

        <SectionCard title="Record payment" description={canPay ? 'Partial payments are allowed. A receipt is generated automatically and the invoice status is updated.' : 'This invoice has no outstanding balance or cannot accept payments.'}>
          <form onSubmit={(e) => { e.preventDefault(); if (!canPay) return; record.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>Amount (TZS)</Label><Input type="number" min="1" max={Number(invoice.outstandingAmount)} value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!canPay} required /></div>
            <div className="space-y-2"><Label>Method</Label>
              <Select value={method} onValueChange={setMethod} disabled={!canPay}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CASH">Cash</SelectItem><SelectItem value="MPESA">M-Pesa</SelectItem><SelectItem value="BANK">Bank</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={!canPay}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replaceAll('_', ' ')}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Reference (optional)</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} disabled={!canPay} /></div>
            <Button type="submit" className="w-full bg-[#7A1F2B] text-white hover:bg-[#651925]" disabled={!canPay || record.isPending}><Wallet className="mr-2 h-4 w-4" />{record.isPending ? 'Recording payment…' : 'Record payment & generate receipt'}</Button>
          </form>

          {receiptNo ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-900">Payment recorded successfully</p>
              <p className="mt-1 font-mono text-sm text-emerald-950">{receiptNo}</p>
              <Button type="button" variant="outline" className="mt-3 w-full border-emerald-700 text-emerald-900 hover:bg-emerald-100" onClick={downloadReceipt}><ReceiptText className="mr-2 h-4 w-4" />Download receipt PDF</Button>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
