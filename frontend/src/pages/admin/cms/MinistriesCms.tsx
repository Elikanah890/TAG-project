import AdminCrudPage from '../shared/AdminCrudPage';

export default function MinistriesCms(){
  return <AdminCrudPage
    title="Ministries"
    description="Manage ministry content shown on the public Ministries page. Add/edit ministry leaders in the separate 'Ministry Leaders' page."
    endpoint="/cms/ministries"
    createLabel="New Ministry"
    columns={[{key:'name',label:'Name (EN)'},{key:'nameSw',label:'Name (SW)'},{key:'slug',label:'Slug/Key'},{key:'order',label:'Order'},{key:'status',label:'Status'}]}
    fields={[
      {key:'name',label:'Name (EN)',required:true},
      {key:'nameSw',label:'Name (SW)'},
      {key:'slug',label:'Slug / Key (used to link leaders)',placeholder:'cmf, wwk, cas, watoto...'},
      {key:'logoUrl',label:'Logo URL',placeholder:'/logos/cmf.png or uploaded URL'},
      {key:'imageUrl',label:'Cover Image URL'},
      {key:'category',label:'Category'},
      {key:'order',label:'Order',type:'number'},
      {key:'status',label:'Status',type:'select',options:['DRAFT','PUBLISHED','ARCHIVED']},
      {key:'description',label:'Description (EN)',type:'textarea'},
      {key:'descriptionSw',label:'Description (SW)',type:'textarea'},
      {key:'vision',label:'Vision (EN)',type:'textarea'},
      {key:'visionSw',label:'Vision (SW)',type:'textarea'},
      {key:'mission',label:'Mission (EN)',type:'textarea'},
      {key:'missionSw',label:'Mission (SW)',type:'textarea'},
      {key:'purpose',label:'Purpose (EN)',type:'textarea'},
      {key:'purposeSw',label:'Purpose (SW)',type:'textarea'},
      {key:'revivalHistory',label:'Revival History (EN)',type:'textarea'},
      {key:'revivalHistorySw',label:'Revival History (SW)',type:'textarea'},
    ]} />;
}
