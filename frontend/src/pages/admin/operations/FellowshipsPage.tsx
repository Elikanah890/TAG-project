import AdminCrudPage from '../shared/AdminCrudPage';
export default function FellowshipsPage(){
  return <AdminCrudPage title="Fellowship Management" description="Manage fellowships and groups (point 9)." endpoint="/operations/fellowships"
    fields={[{key:'name',label:'Name',required:true},{key:'leaderName',label:'Leader'},{key:'schedule',label:'Schedule'},{key:'status',label:'Status',type:'select',options:['ACTIVE','INACTIVE']},{key:'description',label:'Description',type:'textarea'}]}
    columns={[{key:'name',label:'Name'},{key:'leaderName',label:'Leader'},{key:'schedule',label:'Schedule'},{key:'status',label:'Status'},{key:'createdAt',label:'Created'}]} />;
}
