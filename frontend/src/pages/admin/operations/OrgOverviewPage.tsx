import { Building2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/access/AccessUI';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DepartmentReports, FellowshipReports } from '@/pages/admin/reports/SimpleReports';

export default function OrgOverviewPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Church Operations"
        title="Departments & Fellowships"
        description="Read-only oversight of church departments and fellowships. Operational maintenance remains with the Church Secretary."
      />
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-4">
          <Tabs defaultValue="departments" className="space-y-4">
            <TabsList className="bg-[#F4EBDD]/60">
              <TabsTrigger value="departments" className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Departments
              </TabsTrigger>
              <TabsTrigger value="fellowships">Fellowships</TabsTrigger>
            </TabsList>
            <TabsContent value="departments">
              <DepartmentReports />
            </TabsContent>
            <TabsContent value="fellowships">
              <FellowshipReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
