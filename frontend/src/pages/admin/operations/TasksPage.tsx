import AdminCrudPage from '../shared/AdminCrudPage';
export default function TasksPage(){
  return <AdminCrudPage title="Task Management" description="Manage administrative tasks (point 25)." endpoint="/operations/tasks"
    fields={[{key:'title',label:'Title',required:true},{key:'assignedTo',label:'Assigned To'},{key:'status',label:'Status',type:'select',options:['PENDING','IN_PROGRESS','DONE','CANCELLED']},{key:'priority',label:'Priority',type:'select',options:['LOW','NORMAL','HIGH','URGENT']},{key:'dueDate',label:'Due Date',type:'date'},{key:'description',label:'Description',type:'textarea'}]}
    columns={[{key:'title',label:'Title'},{key:'assignedTo',label:'Assigned'},{key:'status',label:'Status'},{key:'priority',label:'Priority'},{key:'dueDate',label:'Due'},{key:'createdAt',label:'Created'}]} />;
}
