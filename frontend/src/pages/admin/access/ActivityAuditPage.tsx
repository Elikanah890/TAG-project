import { Activity } from 'lucide-react';
import { PageHeader } from '@/components/admin/access/AccessUI';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserActivity from '@/pages/admin/access/UserActivity';
import AuditLogs from '@/pages/admin/access/AuditLogs';

export default function ActivityAuditPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="System & Users"
        title="Activity & Audit"
        description="Login activity and the immutable audit trail for administrative actions. Audit history is read-only and cannot be edited or deleted."
      />
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-4">
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList className="bg-[#F4EBDD]/60">
              <TabsTrigger value="activity" className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" /> User activity
              </TabsTrigger>
              <TabsTrigger value="audit">Audit logs</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <UserActivity />
            </TabsContent>
            <TabsContent value="audit">
              <AuditLogs />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
