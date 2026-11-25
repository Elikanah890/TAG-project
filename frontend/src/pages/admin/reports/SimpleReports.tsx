import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function Page({title, desc, endpoint, dataKey, cols}:{title:string;desc:string;endpoint:string;dataKey:string;cols:{k:string;l:string;r?:(row:any)=>any}[]}){
  const { data, isLoading, error } = useQuery({ queryKey:[endpoint], queryFn: async()=> (await api.get(endpoint)).data });
  const rows = (data?.[dataKey] || []) as any[];
  const sum = data?.summary || data?.totals || data?.counts || {};
  return <div className="space-y-4">
    <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-900 px-4 py-2 font-semibold">READ-ONLY REPORT</div>
    <div><h1 className="font-serif text-3xl text-gray-800">{title}</h1><p className="text-gray-500">{desc}</p></div>
    {data?.note && <div className="text-sm bg-[#C9962B]/10 border border-gray-100 rounded p-3">{data.note}</div>}
    {isLoading? <p>Loading...</p> : error ? <p className="text-red-600">Failed to load.</p> : <>
      {Object.keys(sum).length>0 && <div className="grid sm:grid-cols-4 gap-3">{Object.entries(sum).slice(0,8).map(([k,v])=>(<Card key={k} className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">{k}</div><div className="text-xl font-semibold">{typeof v==='object'?JSON.stringify(v):String(v)}</div></CardContent></Card>))}</div>}
      <Card className="border-gray-100"><CardHeader><CardTitle>Records ({rows.length})</CardTitle></CardHeader><CardContent className="overflow-auto"><Table><TableHeader><TableRow>{cols.map(c=><TableHead key={c.k}>{c.l}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row:any,i:number)=>(<TableRow key={row.id||i}>{cols.map(c=><TableCell key={c.k}>{c.r?c.r(row):fmt(row[c.k])}</TableCell>)}</TableRow>))}{rows.length===0 && <TableRow><TableCell colSpan={cols.length} className="text-gray-500">No records found.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
    </>}
  </div>;
}
function fmt(v:any){ if(v==null||v==='') return '—'; if(typeof v==='string' && /\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString(); if(typeof v==='object') return (v.name||v.title||v.fullName||JSON.stringify(v)).slice(0,60); return String(v); }

export const DepartmentReports = ()=> <Page title="Department Reports" desc="Department records and status (read-only overseer view)." endpoint="/admin/oversight/reports/departments" dataKey="departments" cols={[{k:'name',l:'Name'},{k:'headName',l:'Head/Leader'},{k:'status',l:'Status'},{k:'description',l:'Description'}]} />;
export const FellowshipReports = ()=> <Page title="Fellowship Reports" desc="Fellowship records and participation context (read-only)." endpoint="/admin/oversight/reports/fellowships" dataKey="fellowships" cols={[{k:'name',l:'Name'},{k:'leaderName',l:'Leader'},{k:'schedule',l:'Schedule'},{k:'status',l:'Status'}]} />;
export const AttendanceReports = ()=> <Page title="Attendance Reports" desc="Attendance records across meetings (read-only). System Administrator cannot record or edit attendance." endpoint="/admin/oversight/reports/attendance" dataKey="attendance" cols={[{k:'meeting',l:'Meeting',r:(r)=>r.meeting?.title||'—'},{k:'attendeeName',l:'Attendee'},{k:'status',l:'Status'},{k:'createdAt',l:'Recorded At'}]} />;
export const MeetingsReports = ()=> <Page title="Meetings & Activities Reports" desc="Meetings and activities (read-only overseer view)." endpoint="/admin/oversight/reports/meetings" dataKey="meetings" cols={[{k:'title',l:'Title'},{k:'type',l:'Type'},{k:'startsAt',l:'Starts'},{k:'status',l:'Status'},{k:'_count',l:'Attendance',r:(r)=>r._count?.attendances??0}]} />;
export const FollowupReports = ()=> <Page title="Follow-up Reports" desc="Follow-up status summaries (read-only). Sensitive pastoral follow-up note content is restricted in overseer view." endpoint="/admin/oversight/reports/followups" dataKey="followups" cols={[{k:'subject',l:'Subject'},{k:'member',l:'Member',r:(r)=>r.member?.fullName||'—'},{k:'assignedTo',l:'Assigned'},{k:'status',l:'Status'},{k:'priority',l:'Priority'},{k:'dueDate',l:'Due'}]} />;
export const TasksReports = ()=> <Page title="Tasks & Performance Reports" desc="Tasks and performance indicators (read-only)." endpoint="/admin/oversight/reports/tasks" dataKey="tasks" cols={[{k:'title',l:'Title'},{k:'assignedTo',l:'Assigned'},{k:'status',l:'Status'},{k:'priority',l:'Priority'},{k:'dueDate',l:'Due'}]} />;
export const ProjectsReports = ()=> <Page title="Projects Reports" desc="Church projects and budgets (read-only)." endpoint="/admin/oversight/reports/projects" dataKey="projects" cols={[{k:'name',l:'Name'},{k:'status',l:'Status'},{k:'targetAmount',l:'Target',r:(r)=>r.targetAmount?`TZS ${Number(r.targetAmount).toLocaleString()}`:'—'},{k:'startDate',l:'Start'},{k:'endDate',l:'End'}]} />;
export const ParticipationReports = ()=> {
  const { data, isLoading } = useQuery({ queryKey:['r-part'], queryFn: async()=> (await api.get('/admin/oversight/reports/participation')).data });
  return <div className="space-y-4"><div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-900 px-4 py-2 font-semibold">READ-ONLY REPORT</div><div><h1 className="font-serif text-3xl text-gray-800">Member Participation Reports</h1><p className="text-gray-500">Authorized participation summaries from records.</p></div>{isLoading?<p>Loading...</p>:<div className="grid sm:grid-cols-3 gap-3"><Card className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">Total Approved Members</div><div className="text-xl font-semibold">{data?.totalApprovedMembers??'—'}</div></CardContent></Card><Card className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">Members with Attendance Records</div><div className="text-xl font-semibold">{data?.membersWithAttendanceRecords??'—'}</div></CardContent></Card></div>}{data?.note && <div className="text-sm text-gray-500">{data.note}</div>}</div>;
};
export const CmsReports = ()=> {
  const { data, isLoading } = useQuery({ queryKey:['r-cms'], queryFn: async()=> (await api.get('/admin/oversight/reports/cms')).data });
  const c = data?.counts||{};
  return <div className="space-y-4"><div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-900 px-4 py-2 font-semibold">READ-ONLY REPORT</div><div><h1 className="font-serif text-3xl text-gray-800">CMS & Website Reports</h1><p className="text-gray-500">Website/CMS activity counts (read-only). Routine publishing remains with Website Administrator.</p></div>{isLoading?<p>Loading...</p>:<div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">{Object.entries(c).map(([k,v])=>(<Card key={k} className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">{k}</div><div className="text-xl font-semibold">{String(v)}</div></CardContent></Card>))}</div>}</div>;
};
