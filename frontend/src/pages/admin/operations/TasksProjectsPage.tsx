import { ListChecks } from 'lucide-react';
import { PageHeader } from '@/components/admin/access/AccessUI';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectsReports, TasksReports } from '@/pages/admin/reports/SimpleReports';

export default function TasksProjectsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Church Operations"
        title="Tasks & Projects"
        description="Read-only oversight of tasks, performance indicators and church projects. Execution remains with the responsible operational teams."
      />
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-4">
          <Tabs defaultValue="tasks" className="space-y-4">
            <TabsList className="bg-[#F4EBDD]/60">
              <TabsTrigger value="tasks" className="flex items-center gap-1.5">
                <ListChecks className="h-3.5 w-3.5" /> Tasks
              </TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks">
              <TasksReports />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectsReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
