import AdminCrudPage from '../shared/AdminCrudPage';
export default function EventsCms(){
  return <AdminCrudPage title="Events" description="Manage public events shown on Home and News & Events pages." endpoint="/cms/events" createLabel="New Event"
    columns={[{key:'title',label:'Title'},{key:'startAt',label:'Start'},{key:'location',label:'Location'},{key:'status',label:'Status'}]}
    fields={[
      {key:'title',label:'Title (EN)',required:true},{key:'titleSw',label:'Title (SW)'},
      {key:'description',label:'Description (EN)',type:'textarea'},{key:'descriptionSw',label:'Description (SW)',type:'textarea'},
      {key:'location',label:'Location (EN)'},{key:'locationSw',label:'Location (SW)'},
      {key:'imageUrl',label:'Image URL'},{key:'timeLabel',label:'Time Label',placeholder:'09:00 AM - 12:00 PM'},
      {key:'startAt',label:'Start At',type:'date',required:true},{key:'endAt',label:'End At',type:'date'},
      {key:'category',label:'Category'},{key:'ctaLabel',label:'CTA Label'},{key:'ctaUrl',label:'CTA URL'},
      {key:'status',label:'Status',type:'select',options:['DRAFT','PUBLISHED','ARCHIVED']},
    ]} />;
}
