import AdminCrudPage from '../shared/AdminCrudPage';
export default function MediaCms(){
  return <AdminCrudPage title="Media & Image Management" description="Manage media library entries (point 33)." endpoint="/cms/media"
    fields={[{key:'title',label:'Title',required:true},{key:'type',label:'Type',type:'select',options:['IMAGE','VIDEO','AUDIO','DOCUMENT']},{key:'url',label:'URL',required:true},{key:'category',label:'Category'},{key:'status',label:'Status',type:'select',options:['ACTIVE','INACTIVE']},{key:'description',label:'Description',type:'textarea'}]}
    columns={[{key:'title',label:'Title'},{key:'type',label:'Type'},{key:'category',label:'Category'},{key:'url',label:'URL'},{key:'status',label:'Status'}]} />;
}
