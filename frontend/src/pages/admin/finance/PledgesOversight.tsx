import AdminReadOnlyPage from '../shared/AdminReadOnlyPage';
export default function PledgesOversight(){
  return <AdminReadOnlyPage title="Pledge Management (Oversight)" description="View all pledges (point 17)." endpoint="/finance/pledges" note="System Admin oversight is read-only; FINANCE_ADMIN records pledges."
    columns={[{key:'createdAt',label:'Date'},{key:'member',label:'Member',render:(r:any)=>r.member?.fullName||'—'},{key:'amount',label:'Amount',render:(r:any)=>`TZS ${Number(r.amount||0).toLocaleString()}`},{key:'status',label:'Status'},{key:'targetDate',label:'Target Date'},{key:'notes',label:'Notes'}]} />;
}
