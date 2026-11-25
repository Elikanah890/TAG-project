import AdminCrudPage from '../shared/AdminCrudPage';
export default function SermonsCms(){
  return <AdminCrudPage title="Sermons & Media" description="Manage sermons and media resources for public pages." endpoint="/cms/sermons" createLabel="New Sermon"
    columns={[{key:'title',label:'Title'},{key:'preacher',label:'Preacher'},{key:'preachedAt',label:'Date'},{key:'status',label:'Status'}]}
    fields={[
      {key:'title',label:'Title (EN)',required:true},{key:'titleSw',label:'Title (SW)'},
      {key:'preacher',label:'Preacher'},{key:'scripture',label:'Scripture'},
      {key:'description',label:'Description (EN)',type:'textarea'},{key:'descriptionSw',label:'Description (SW)',type:'textarea'},
      {key:'preachedAt',label:'Preached At',type:'date'},{key:'duration',label:'Duration'},
      {key:'mediaUrl',label:'Audio/Media URL'},{key:'videoUrl',label:'Video URL'},{key:'thumbnailUrl',label:'Thumbnail URL'},
      {key:'series',label:'Series'},{key:'tags',label:'Tags'},
      {key:'status',label:'Status',type:'select',options:['DRAFT','PUBLISHED','ARCHIVED']},
    ]} />;
}
