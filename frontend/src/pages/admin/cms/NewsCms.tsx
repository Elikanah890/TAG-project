import AdminCrudPage from '../shared/AdminCrudPage';
export default function NewsCms(){
  return <AdminCrudPage title="News & Announcements" description="Manage public news/announcements." endpoint="/cms/announcements" createLabel="New Announcement"
    columns={[{key:'title',label:'Title'},{key:'type',label:'Type'},{key:'status',label:'Status'}]}
    fields={[
      {key:'title',label:'Title (EN)',required:true},{key:'titleSw',label:'Title (SW)'},
      {key:'body',label:'Body (EN)',type:'textarea'},{key:'bodySw',label:'Body (SW)',type:'textarea'},
      {key:'type',label:'Type',type:'select',options:['NEWS','ANNOUNCEMENT']},
      {key:'imageUrl',label:'Image URL'},
      {key:'status',label:'Status',type:'select',options:['DRAFT','PUBLISHED','ARCHIVED']},
    ]} />;
}
