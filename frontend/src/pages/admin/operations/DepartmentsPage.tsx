import AdminCrudPage from '../shared/AdminCrudPage';
export default function DepartmentsPage(){
  return <AdminCrudPage title="Department Management" description="Create and manage church departments (point 8)." endpoint="/operations/departments"
    fields={[{key:'name',label:'Name',required:true},{key:'headName',label:'Head/Leader'},{key:'status',label:'Status',type:'select',options:['ACTIVE','INACTIVE']},{key:'description',label:'Description',type:'textarea'}]}
    columns={[{key:'name',label:'Name'},{key:'headName',label:'Head'},{key:'status',label:'Status'},{key:'description',label:'Description'},{key:'createdAt',label:'Created'}]} />;
}
