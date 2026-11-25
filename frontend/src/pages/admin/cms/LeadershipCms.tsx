import AdminCrudPage from '../shared/AdminCrudPage';
export default function LeadershipCms(){
  return <AdminCrudPage title="Leadership Information Management" description="Manage leadership profiles (point 31)." endpoint="/cms/leadership"
    fields={[{key:'name',label:'Name',required:true},{key:'title',label:'Title/Role',required:true},{key:'order',label:'Order',type:'number'},{key:'phone',label:'Phone'},{key:'email',label:'Email'},{key:'imageUrl',label:'Image URL'},{key:'status',label:'Status',type:'select',options:['DRAFT','PUBLISHED','ARCHIVED']},{key:'bio',label:'Bio',type:'textarea'}]}
    columns={[{key:'name',label:'Name'},{key:'title',label:'Role'},{key:'order',label:'Order'},{key:'status',label:'Status'}]} />;
}
