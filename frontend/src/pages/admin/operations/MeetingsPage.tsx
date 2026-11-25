import AdminCrudPage from '../shared/AdminCrudPage';
export default function MeetingsPage(){
  return <AdminCrudPage title="Meeting Management" description="Plan and track church meetings (point 22)." endpoint="/operations/meetings"
    fields={[{key:'title',label:'Title',required:true},{key:'type',label:'Type'},{key:'location',label:'Location'},{key:'startsAt',label:'Starts At',type:'date',required:true},{key:'endsAt',label:'Ends At',type:'date'},{key:'status',label:'Status',type:'select',options:['SCHEDULED','COMPLETED','CANCELLED']},{key:'description',label:'Description',type:'textarea'}]}
    columns={[{key:'title',label:'Title'},{key:'type',label:'Type'},{key:'location',label:'Location'},{key:'startsAt',label:'Starts'},{key:'status',label:'Status'},{key:'_count',label:'Attendance',render:(r:any)=>r?._count?.attendances ?? '—'}]} />;
}
