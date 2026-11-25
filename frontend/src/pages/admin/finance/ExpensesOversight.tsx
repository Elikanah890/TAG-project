import AdminReadOnlyPage from '../shared/AdminReadOnlyPage';
export default function ExpensesOversight(){
  return <AdminReadOnlyPage title="Expense Management (Oversight)" description="View all expenses (point 18)." endpoint="/finance/expenses" note="System Admin oversight is read-only; FINANCE_ADMIN records expenses."
    columns={[{key:'date',label:'Date'},{key:'description',label:'Description'},{key:'category',label:'Category'},{key:'amount',label:'Amount',render:(r:any)=>`TZS ${Number(r.amount||0).toLocaleString()}`}]} />;
}
