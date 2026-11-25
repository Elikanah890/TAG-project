import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminReadOnlyPage({ title, description, endpoint, columns, note, dataKey }:{ title:string; description?:string; endpoint:string; columns:{key:string;label:string;render?: (r:any)=>any}[]; note?:string; dataKey?: string; }){
  const { data, isLoading, error, refetch, isFetching } = useQuery({ queryKey:[endpoint], queryFn: async()=> (await api.get(endpoint)).data });
  const [q,setQ]=useState('');
  const raw = dataKey ? (data?.[dataKey] ?? []) : (Array.isArray(data)?data:(data?.data||data?.items||data?.applications||data?.members||data?.contributions||data?.departments||data?.fellowships||data?.meetings||data?.attendance||data?.followups||data?.tasks||data?.projects||data?.logs||[]));
  const rowsAll = Array.isArray(raw)?raw:[];
  const rows = useMemo(()=>{ if(!q) return rowsAll; const s=q.toLowerCase(); return rowsAll.filter((r:any)=> JSON.stringify(r).toLowerCase().includes(s)); },[rowsAll,q]);
  const exportCsv = () => {
    const keys = columns.map(c=>c.key);
    const csv = [keys.join(','), ...rows.map(r=> keys.map(k=>JSON.stringify(cVal(r,k))).join(','))].join('\n');
    const blob = new Blob([csv], {type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${title.replace(/\s+/g,'_')}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-4">
    <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-900 px-4 py-2 font-semibold tracking-wide">READ-ONLY REPORT</div>
    <div><h1 className="font-serif text-2xl md:text-3xl text-gray-800">{title}</h1>{description && <p className="text-gray-500">{description}</p>}</div>
    {note && <div className="text-sm bg-[#C9962B]/10 border border-gray-100 text-[#7A5A10] rounded p-3">{note}</div>}
    <Card className="card-church border-gray-100"><CardHeader className="pb-2"><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="text-base">Records ({rows.length}{rowsAll.length!==rows.length?` / ${rowsAll.length}`:''})</CardTitle><div className="flex gap-2 flex-wrap"><Input placeholder="Search/filter..." value={q} onChange={e=>setQ(e.target.value)} className="w-56"/><Button variant="outline" onClick={()=>refetch()} disabled={isFetching}>{isFetching?'Refreshing...':'Refresh'}</Button><Button variant="outline" onClick={exportCsv} disabled={!rows.length}>Export CSV</Button></div></div></CardHeader>
      <CardContent>{isLoading? <p className="text-gray-500">Loading...</p> : error ? <p className="text-red-600">Error loading report. <Button variant="link" onClick={()=>refetch()}>Retry</Button></p> : rows.length===0? <p className="text-gray-500">No records found.</p> : <div className="overflow-auto"><Table><TableHeader><TableRow>{columns.map(c=><TableHead key={c.key}>{c.label}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((r:any,i:number)=>(<TableRow key={r.id||r.receiptNo||i}>{columns.map(c=><TableCell key={c.key}>{c.render?c.render(r):fmt(cVal(r,c.key))}</TableCell>)}</TableRow>))}</TableBody></Table></div>}
      </CardContent></Card>
  </div>;
}
function cVal(r:any,k:string){ return k.includes('.') ? k.split('.').reduce((a:any,b)=>a?.[b], r) : r?.[k]; }
function fmt(v:any){ if(v==null||v==='') return '—'; if(typeof v==='string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString(); if(typeof v==='object') return (v.fullName||v.name||v.email||v.title||JSON.stringify(v)).toString().slice(0,80); if(typeof v==='number') return v.toLocaleString(); return String(v); }
