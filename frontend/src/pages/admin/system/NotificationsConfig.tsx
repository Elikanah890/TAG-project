import NotificationsPage from './NotificationsPage';
export default function NotificationsConfig(){
  return <div className="space-y-3"><div className="rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 px-4 py-2 text-sm">System Administrator own operation: configure/manage system notifications. All actions audited.</div><NotificationsPage/></div>;
}
