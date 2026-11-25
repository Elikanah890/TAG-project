import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function ChurchOverview(){
  const { data, isLoading, error } = useQuery({ queryKey:['oversight-dashboard'], queryFn: async()=> (await api.get('/admin/oversight/dashboard')).data });
  if(isLoading) return <p className="text-gray-500">Loading church overview...</p>;
  if(error) return <p className="text-red-600">Failed to load overview.</p>;
  const co = data?.churchOverview||{}; const so = data?.staffOperations||{}; const fin = data?.financialOversight||{}; const sys = data?.systemHealth||{};
  const incomeTrend = fin.monthlyIncomeTrend||[]; const expTrend = fin.monthlyExpenseTrend||[];
  const trend = mergeTrend(incomeTrend, expTrend);
  return <div className="space-y-6">
    <div><h1 className="font-serif text-3xl text-gray-800">Church Overview</h1><p className="text-gray-500">Church-wide KPIs from live database records (no hardcoded values).</p></div>
    <Section title="A. Church Overview">
      <K title="Total Members" v={co.totalMembers}/><K title="Active Members" v={co.activeMembers}/><K title="Inactive/Rejected" v={co.inactiveMembers}/>
      <K title="New Members (This Month)" v={co.newMembersThisMonth}/><K title="Pending Registrations" v={co.pendingRegistrations}/><K title="Attendance This Sunday" v={co.attendanceThisSunday}/>
      <K title="Average Attendance" v={co.averageAttendance}/><K title="Membership Growth (Month)" v={co.membershipGrowth?.thisMonth}/>
    </Section>
    <Section title="B. Staff & Operations">
      <K title="Total Administrative Users" v={so.totalAdministrativeUsers}/><K title="Active Admin Accounts" v={so.activeAdministrativeAccounts}/><K title="Total Departments" v={so.totalDepartments}/>
      <K title="Active Departments" v={so.activeDepartments}/><K title="Departments Without Leaders" v={so.departmentsWithoutLeaders}/><K title="Total Fellowships" v={so.totalFellowships}/>
      <K title="Upcoming Meetings" v={so.upcomingMeetings}/><K title="Overdue Tasks" v={so.overdueTasks}/><K title="Pending Follow-ups" v={so.pendingFollowups}/>
    </Section>
    <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-900 px-4 py-2 font-semibold">READ-ONLY REPORT · Financial Oversight</div>
    <Section title="C. Financial Oversight (Read-Only)">
      <K title="Confirmed Income" v={`TZS ${n(fin.confirmedIncome)}`}/><K title="Paid Expenses" v={`TZS ${n(fin.paidExpenses)}`}/><K title="Net Cash Movement" v={`TZS ${n(fin.netCashMovement)}`}/>
      <K title="Outstanding Pledges" v={`TZS ${n(fin.outstandingPledges)}`}/><K title="Budget Utilization" v={fin.budgetUtilization?.utilizationPercent!=null?`${fin.budgetUtilization.utilizationPercent}%`:(fin.budgetUtilization?.note||'—')}/><K title="Pending Financial Approvals" v={fin.pendingFinancialApprovals}/>
      <K title="Reconciliation Status" v={fin.financialReconciliationStatus}/>
    </Section>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="border-gray-100"><CardHeader><CardTitle>Monthly Income vs Expense Trend</CardTitle></CardHeader><CardContent style={{height:320}}>
        <ResponsiveContainer width="100%" height="100%"><BarChart data={trend}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip formatter={(v:any)=>`TZS ${Number(v).toLocaleString()}`}/><Legend/><Bar dataKey="income" fill="#7A1F2B" name="Income"/><Bar dataKey="expense" fill="#C9962B" name="Expense"/></BarChart></ResponsiveContainer>
      </CardContent></Card>
      <Card className="border-gray-100"><CardHeader><CardTitle>Income by Category</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{(fin.incomeByCategory||[]).length? (fin.incomeByCategory||[]).map((c:any)=>(<div key={c.category} className="flex justify-between border-b border-border/40 py-1"><span>{c.category}</span><b>TZS {n(c.amount)}</b></div>)) : <p className="text-gray-500">No confirmed income records.</p>}<p className="text-xs text-[#A9771F] mt-2">{fin.note}</p></CardContent></Card>
    </div>
    <Section title="D. System Health">
      <K title="Database Connectivity" v={sys.databaseConnectivity}/><K title="Backend API Status" v={sys.backendApiStatus}/><K title="Frontend Availability" v={sys.frontendAvailability}/>
      <K title="Server Uptime (s)" v={sys.serverUptimeSeconds}/><K title="Last Successful Backup" v={sys.lastSuccessfulBackup?new Date(sys.lastSuccessfulBackup).toLocaleString():'None'}/><K title="Failed Backups" v={sys.failedBackups}/>
      <K title="Failed Background Jobs" v={sys.failedBackgroundJobs}/><K title="Failed Login Attempts" v={sys.failedLoginAttempts}/><K title="Recent Audit Entries (7d)" v={sys.recentAuditEntries}/>
    </Section>
    <div className="text-xs text-gray-500">Generated: {new Date(data?.meta?.generatedAt||Date.now()).toLocaleString()} · Source: {data?.meta?.source}</div>
  </div>;
}
function Section({title,children}:{title:string;children:any}){ return <div><h2 className="font-semibold text-lg text-gray-800 mb-2">{title}</h2><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{children}</div></div>; }
function K({title,v}:{title:string;v:any}){ return <Card className="border-gray-100"><CardContent className="pt-4"><div className="text-xs text-gray-500">{title}</div><div className="text-xl font-semibold text-gray-800 break-words">{v==null||v===''?'—':String(v)}</div></CardContent></Card>; }
function n(v:any){ return Number(v||0).toLocaleString(); }
function mergeTrend(income:any[], expense:any[]){ const m:any={}; (income||[]).forEach((x:any)=>{m[x.month]={...(m[x.month]||{month:x.month}), income:Number(x.amount||0)};}); (expense||[]).forEach((x:any)=>{m[x.month]={...(m[x.month]||{month:x.month}), expense:Number(x.amount||0)};}); return Object.values(m).map((x:any)=>({month:x.month,income:x.income||0,expense:x.expense||0})).sort((a:any,b:any)=>a.month.localeCompare(b.month)); }
