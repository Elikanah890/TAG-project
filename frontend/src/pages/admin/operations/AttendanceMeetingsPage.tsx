import { CalendarCheck } from 'lucide-react';
import { PageHeader } from '@/components/admin/access/AccessUI';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceReports, MeetingsReports } from '@/pages/admin/reports/SimpleReports';

export default function AttendanceMeetingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Church Operations"
        title="Attendance & Meetings"
        description="Read-only attendance and meeting records. The System Administrator cannot record or edit attendance; that remains an operational responsibility."
      />
      <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-4">
          <Tabs defaultValue="attendance" className="space-y-4">
            <TabsList className="bg-[#F4EBDD]/60">
              <TabsTrigger value="attendance" className="flex items-center gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5" /> Attendance
              </TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
            </TabsList>
            <TabsContent value="attendance">
              <AttendanceReports />
            </TabsContent>
            <TabsContent value="meetings">
              <MeetingsReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
