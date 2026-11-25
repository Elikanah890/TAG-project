import { useAuth } from '@/contexts/AuthContext';
import AdminReadOnlyPage from '../shared/AdminReadOnlyPage';

export default function ContributionsOversight(){
  const { hasRole } = useAuth();
  const isFinanceAdmin = hasRole('FINANCE_ADMIN');

  return <AdminReadOnlyPage
    title={isFinanceAdmin ? 'Contribution History' : 'Contributions Management (View All)'}
    description={isFinanceAdmin ? 'Recorded member and external contributions from live records.' : 'Oversee all contributions (points 10, 11).'}
    endpoint="/finance/payments"
    note={isFinanceAdmin ? 'Record new payments from Record Payment. This view is read-only.' : 'System Admin has full finance oversight but cannot record transactions (separation of duties).'}
    columns={[
      {key:'contributedAt',label:'Date'},
      {key:'receiptNo',label:'Receipt'},
      {key:'member',label:'Member',render:(r:any)=>r.member?.fullName||'—'},
      {key:'category',label:'Category'},
      {key:'amount',label:'Amount',render:(r:any)=>`TZS ${Number(r.amount||0).toLocaleString()}`},
      {key:'paymentMethod',label:'Method'},
      {key:'status',label:'Status'},
    ]}
  />;
}
