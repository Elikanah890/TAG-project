import AdminCrudPage from '../shared/AdminCrudPage';
export default function FollowupsPage(){
  return <AdminCrudPage title="Follow-up Management" description="Track pastoral/admin follow-up cases (point 24)." endpoint="/operations/followups"
    fields={[{key:'subject',label:'Subject',required:true},{key:'assignedTo',label:'Assigned To'},{key:'status',label:'Status',type:'select',options:['OPEN','IN_PROGRESS','COMPLETED','CLOSED']},{key:'priority',label:'Priority',type:'select',options:['LOW','NORMAL','HIGH','URGENT']},{key:'dueDate',label:'Due Date',type:'date'},{key:'description',label:'Description',type:'textarea'}]}
    columns={[{key:'subject',label:'Subject'},{key:'member',label:'Member',render:(r:any)=>r.member?.fullName||'—'},{key:'assignedTo',label:'Assigned'},{key:'status',label:'Status'},{key:'priority',label:'Priority'},{key:'dueDate',label:'Due'}]} />;
}
