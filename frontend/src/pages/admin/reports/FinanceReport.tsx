import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function FinanceReport(){
  const { data, isLoading } = useQuery({ queryKey:['r-finance'], queryFn: async()=> (await api.get('/admin/oversight/reports/finance')).data });
  const trend = merge(data?.monthlyIncomeTrend||[], data?.monthlyExpenseTrend||[]);
  return <div className="space-y-4">
    <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-900 px-4 py-2 font-semibold">READ-ONLY REPORT</div>
    <div><h1 className="font-serif text-3xl text-gray-800">Finance Reports</h1><p className="text-gray-500">Authorized financial oversight from live records. System Administrator cannot record or modify financial transactions.</p></div>
    {isLoading? <p>Loading...</p> : <>
      <div className="grid sm:grid-cols-4 gap-3"><K t="Confirmed Income" v={`TZS ${n(data?.confirmedIncome)}`}/><K t="Paid Expenses" v={`TZS ${n(data?.paidExpenses)}`}/><K t="Net Cash Movement" v={`TZS ${n(data?.netCashMovement)}`}/><K t="Outstanding Pledges" v={`TZS ${n(data?.outstandingPledges)}`}/></div>
      <div className="text-sm text-[#7A5A10] bg-[#C9962B]/10 border border-gray-100 rounded p-3">{data?.note} No record/payment/expense create, edit, delete, or approve controls are available.</div>
      <Card className="border-gray-100"><CardHeader><CardTitle>Monthly Income vs Expense Trend</CardTitle></CardHeader><CardContent style={{height:320}}><ResponsiveContainer width="100%" height="100%"><BarChart data={trend}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip formatter={(v:any)=>`TZS ${Number(v).toLocaleString()}`}/><Legend/><Bar dataKey="income" fill="#7A1F2B" name="Confirmed Income"/><Bar dataKey="expense" fill="#C9962B" name="Paid Expenses"/></BarChart></ResponsiveContainer></CardContent></Card>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-gray-100"><CardHeader><CardTitle>Income by Category</CardTitle></CardHeader><CardContent>{(data?.incomeByCategory||[]).map((c:any)=><Row key={c.category} k={c.category} v={`TZS ${n(c.amount)}`}/>)}</CardContent></Card>
        <Card className="border-gray-100"><CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader><CardContent>{(data?.expensesByCategory||[]).map((c:any)=><Row key={c.category} k={c.category} v={`TZS ${n(c.amount)}`}/>)}</CardContent></Card>
      </div>
      <Card className="border-gray-100"><CardHeader><CardTitle>Confirmed Contributions (records)</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Receipt</TableHead><TableHead>Member</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{(data?.contributions||[]).map((c:any)=>(<TableRow key={c.id}><TableCell>{new Date(c.contributedAt).toLocaleString()}</TableCell><TableCell>{c.receiptNo||'—'}</TableCell><TableCell>{c.member?.fullName||'—'}</TableCell><TableCell>{c.category}</TableCell><TableCell>TZS {n(c.amount)}</TableCell><TableCell>{c.status}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </>}
  </div>;
}
function K({t,v}:{t:string;v:any}){ return <Card className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">{t}</div><div className="text-xl font-semibold">{v??'—'}</div></CardContent></Card>; }
function Row({k,v}:{k:string;v:any}){ return <div className="flex justify-between border-b border-border/40 py-1 text-sm"><span>{k}</span><b>{v}</b></div>; }
function n(v:any){ return Number(v||0).toLocaleString(); }
function merge(i:any[],e:any[]){ const m:any={}; (i||[]).forEach(x=>m[x.month]={...(m[x.month]||{month:x.month}),income:Number(x.amount||0)}); (e||[]).forEach(x=>m[x.month]={...(m[x.month]||{month:x.month}),expense:Number(x.amount||0)}); return Object.values(m).map((x:any)=>({month:x.month,income:x.income||0,expense:x.expense||0})).sort((a:any,b:any)=>a.month.localeCompare(b.month)); }
