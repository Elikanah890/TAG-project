import UsersManagement from './UsersManagement';
export default function CreateAdminAccount(){
  return <div className="space-y-3">
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 px-4 py-2 text-sm">System Administrator own operation: create authorized administrative accounts and assign roles explicitly. All actions are audited.</div>
    <UsersManagement />
  </div>;
}
