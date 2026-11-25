import AdminCrudPage from '../shared/AdminCrudPage';
export default function BudgetsPage(){
  return <AdminCrudPage title="Budget Management" description="Create and manage church budgets." endpoint="/finance/budgets"
    fields={[{key:'name',label:'Name',required:true},{key:'category',label:'Category'},{key:'amount',label:'Amount (TZS)',type:'number',required:true},{key:'period',label:'Period'},{key:'status',label:'Status',type:'select',options:['PLANNED','ACTIVE','COMPLETED','CANCELLED']},{key:'notes',label:'Notes',type:'textarea'}]}
    columns={[{key:'name',label:'Name'},{key:'category',label:'Category'},{key:'amount',label:'Amount (TZS)'},{key:'period',label:'Period'},{key:'status',label:'Status'}]} />;
}
