import RolesManagement from '../staff/RolesManagement';
export default function AccessControlPage(){
  return <div className="space-y-4"><div className="text-sm bg-[#C9962B]/10 border border-gray-100 rounded p-3">System Access Control (point 41): manage role-permission mappings and enforce RBAC across modules. Backend verifies SYSTEM_ADMIN on admin endpoints and enforces separation of duties (finance write restricted to FINANCE_ADMIN).</div><RolesManagement /></div>;
}
