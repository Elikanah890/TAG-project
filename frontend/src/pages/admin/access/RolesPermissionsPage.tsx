import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/admin/access/AccessUI';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoleManagement from '@/pages/admin/access/RoleManagement';
import PermissionManagement from '@/pages/admin/access/PermissionManagement';
import RoleAssignment from '@/pages/admin/access/RoleAssignment';

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="System & Users"
        title="Roles & Permissions"
        description="Central authority for system roles, permission definitions and role assignments. Changes are audited."
      />
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-4">
          <Tabs defaultValue="roles" className="space-y-4">
            <TabsList className="bg-[#F4EBDD]/60">
              <TabsTrigger value="roles" className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Roles
              </TabsTrigger>
              <TabsTrigger value="permissions">Permission definitions</TabsTrigger>
              <TabsTrigger value="assignments">Role assignments</TabsTrigger>
            </TabsList>
            <TabsContent value="roles">
              <RoleManagement />
            </TabsContent>
            <TabsContent value="permissions">
              <PermissionManagement />
            </TabsContent>
            <TabsContent value="assignments">
              <RoleAssignment />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
