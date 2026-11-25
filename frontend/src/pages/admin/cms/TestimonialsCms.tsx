import AdminCrudPage from '../shared/AdminCrudPage';
export default function TestimonialsCms(){
  return <AdminCrudPage title="Testimonials" description="Manage public testimonies shown on Home and Testimonials pages." endpoint="/cms/testimonials" createLabel="New Testimony"
    columns={[{key:'authorName',label:'Author'},{key:'role',label:'Role/Since'},{key:'date',label:'Date'},{key:'status',label:'Status'}]}
    fields={[
      {key:'authorName',label:'Author Name',required:true},{key:'role',label:'Role / Member Since'},
      {key:'titleEn',label:'Title (EN)'},{key:'titleSw',label:'Title (SW)'},
      {key:'quoteEn',label:'Quote/Testimony (EN)',type:'textarea',required:true},{key:'quoteSw',label:'Quote/Testimony (SW)',type:'textarea'},
      {key:'date',label:'Date Label',placeholder:'2026 or March 2026'},{key:'audioUrl',label:'Audio URL'},{key:'imageUrl',label:'Image URL'},
      {key:'order',label:'Order',type:'number'},{key:'status',label:'Status',type:'select',options:['DRAFT','PUBLISHED','ARCHIVED']},
    ]} />;
}
