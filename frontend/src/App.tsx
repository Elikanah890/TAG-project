import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import '@/lib/i18n';
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import PermissionGuard from "@/components/auth/PermissionGuard";
import AccessDenied from "./pages/AccessDenied";
import AdminLayout from "@/components/admin/AdminLayout";
import MemberLayout from "@/components/admin/MemberLayout";

import Index from "./pages/Index";
import About from "./pages/About";
import Leadership from "./pages/Leadership";
import Ministries from "./pages/Ministries";
import Schedule from "./pages/Schedule";
import News from "./pages/News";
import Giving from "./pages/Giving";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";

import AdminRegistrations from "./pages/admin/AdminRegistrations";
import MembershipReport from "./pages/admin/reports/MembershipReport";
import RegistrationsReport from "./pages/admin/reports/RegistrationsReport";
import FinanceReport from "./pages/admin/reports/FinanceReport";
import { DepartmentReports, FellowshipReports, AttendanceReports, MeetingsReports, FollowupReports, TasksReports, ProjectsReports, CmsReports, ParticipationReports } from "./pages/admin/reports/SimpleReports";
import { FinancialAccountability } from "./pages/admin/governance/GovernancePages";
import ChurchDashboard from "./pages/admin/access/ChurchDashboard";
import UserActivity from "./pages/admin/access/UserActivity";
import Backups from "./pages/admin/access/Backups";
import UserManagement from "./pages/admin/access/UserManagement";
import RoleManagement from "./pages/admin/access/RoleManagement";
import PermissionManagement from "./pages/admin/access/PermissionManagement";
import RoleAssignment from "./pages/admin/access/RoleAssignment";
import AccountManagement from "./pages/admin/access/AccountManagement";
import SessionManagement from "./pages/admin/access/SessionManagement";
import AuditLogs from "./pages/admin/access/AuditLogs";
import SystemConfiguration from "./pages/admin/access/SystemConfiguration";
import SystemHealth from "./pages/admin/access/SystemHealth";
import RolesPermissionsPage from "./pages/admin/access/RolesPermissionsPage";
import ActivityAuditPage from "./pages/admin/access/ActivityAuditPage";
import MembershipOverview from "./pages/admin/membership/MembershipOverview";
import MembershipAnalytics from "./pages/admin/membership/MembershipAnalytics";
import MembershipHistory from "./pages/admin/membership/MembershipHistory";
import OrgOverviewPage from "./pages/admin/operations/OrgOverviewPage";
import AttendanceMeetingsPage from "./pages/admin/operations/AttendanceMeetingsPage";
import TasksProjectsPage from "./pages/admin/operations/TasksProjectsPage";

import SecretaryDashboard from "./pages/admin/SecretaryDashboard";
import MembersDirectory from "./pages/admin/MembersDirectory";
import FinanceDashboard from "./pages/admin/FinanceDashboard";
import FinanceRecord from "./pages/admin/FinanceRecord";
import FinancePledges from "./pages/admin/FinancePledges";
import FinanceExpenses from "./pages/admin/FinanceExpenses";
import ContributionsOversight from "./pages/admin/finance/ContributionsOversight";
import ReceiptsOversight from "./pages/admin/finance/ReceiptsOversight";
import FinanceReportsPage from "./pages/admin/finance/ReportsPage";
import InvoicesPage from "./pages/admin/finance/InvoicesPage";
import InvoiceDetailPage from "./pages/admin/finance/InvoiceDetailPage";
import WhatsAppNotificationsPage from "./pages/admin/finance/WhatsAppNotificationsPage";
import FinanceAccountsPage from "./pages/admin/finance/FinanceAccountsPage";
import FinanceApprovalsPage from "./pages/admin/finance/FinanceApprovalsPage";
import FinanceReconciliationPage from "./pages/admin/finance/FinanceReconciliationPage";
import FinanceAuditTrailPage from "./pages/admin/finance/FinanceAuditTrailPage";
import FinanceSettingsPage from "./pages/admin/finance/FinanceSettingsPage";
import CmsDashboard from "./pages/cms/CmsDashboard";
import ChurchLeadershipCms from "./pages/admin/cms/ChurchLeadershipCms";
import HomepageCms from "./pages/admin/cms/HomepageCms";
import MinistriesCms from "./pages/admin/cms/MinistriesCms";
import MinistryLeadersCms from "./pages/admin/cms/MinistryLeadersCms";
import MediaCms from "./pages/admin/cms/MediaCms";
import NewsCms from "./pages/admin/cms/NewsCms";
import EventsCms from "./pages/admin/cms/EventsCms";
import TestimonialsCms from "./pages/admin/cms/TestimonialsCms";
import AboutCms from "./pages/admin/cms/AboutCms";
import ScheduleCms from "./pages/admin/cms/ScheduleCms";
import GivingCms from "./pages/admin/cms/GivingCms";
import ContactCms from "./pages/admin/cms/ContactCms";
import ContactMessagesCms from "./pages/admin/cms/ContactMessagesCms";
import SiteSettingsCms from "./pages/admin/cms/SiteSettingsCms";
import DepartmentsPage from "./pages/admin/operations/DepartmentsPage";
import FellowshipsPage from "./pages/admin/operations/FellowshipsPage";
import MeetingsPage from "./pages/admin/operations/MeetingsPage";
import AttendancePage from "./pages/admin/operations/AttendancePage";
import SecretaryAttendancePage from "./pages/admin/SecretaryAttendancePage";
import FollowupsPage from "./pages/admin/operations/FollowupsPage";
import TasksPage from "./pages/admin/operations/TasksPage";
import BudgetsPage from "./pages/admin/finance/BudgetsPage";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberContributions from "./pages/member/MemberContributions";
import MemberProfile from "./pages/member/MemberProfile";
import MemberReceipts from "./pages/member/MemberReceipts";
import MemberPledges from "./pages/member/MemberPledges";
import MemberRequests from "./pages/member/MemberRequests";

const queryClient = new QueryClient();

const AdminIndex = () => {
  const { user } = useAuth();
  if (user?.roles?.includes('SYSTEM_ADMIN')) return <Navigate to="/admin/dashboard" replace />;
  if (user?.roles?.includes('FINANCE_ADMIN')) return <Navigate to="/admin/finance" replace />;
  if (user?.roles?.includes('CHURCH_SECRETARY')) return <Navigate to="/admin/secretary" replace />;
  if (user?.roles?.includes('WEBSITE_ADMIN')) return <Navigate to="/cms/dashboard" replace />;
  return <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/leadership" element={<Leadership />} />
            <Route path="/ministries" element={<Ministries />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/news" element={<News />} />
            <Route path="/giving" element={<Giving />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/change-password" element={<ProtectedRoute roles={["SYSTEM_ADMIN","CHURCH_SECRETARY","FINANCE_ADMIN","WEBSITE_ADMIN","CHURCH_MEMBER"]} allowPasswordChange><ChangePassword /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute roles={["SYSTEM_ADMIN","CHURCH_SECRETARY","FINANCE_ADMIN","WEBSITE_ADMIN"]}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminIndex />} />

              {/* SYSTEM_ADMIN: centralized access management */}
              <Route path="dashboard" element={<PermissionGuard permissions={["reports.system.view"]}><ChurchDashboard /></PermissionGuard>} />
              <Route path="users" element={<PermissionGuard permissions={["users.view"]}><UserManagement /></PermissionGuard>} />
              <Route path="roles" element={<PermissionGuard permissions={["roles.view"]}><RoleManagement /></PermissionGuard>} />
              <Route path="permissions" element={<PermissionGuard permissions={["permissions.view"]}><PermissionManagement /></PermissionGuard>} />
              <Route path="role-assignments" element={<PermissionGuard permissions={["users.assign_roles"]}><RoleAssignment /></PermissionGuard>} />
              <Route path="accounts" element={<PermissionGuard permissions={["users.view"]}><AccountManagement /></PermissionGuard>} />
              <Route path="sessions" element={<PermissionGuard permissions={["system.sessions"]}><SessionManagement /></PermissionGuard>} />
              <Route path="user-activity" element={<PermissionGuard permissions={["users.view"]}><UserActivity /></PermissionGuard>} />
              <Route path="audit-logs" element={<PermissionGuard permissions={["audit.view"]}><AuditLogs /></PermissionGuard>} />
              <Route path="system-config" element={<PermissionGuard permissions={["system.settings"]}><SystemConfiguration /></PermissionGuard>} />
              <Route path="system-health" element={<PermissionGuard permissions={["system.health"]}><SystemHealth /></PermissionGuard>} />
              <Route path="backups" element={<PermissionGuard permissions={["system.backup"]}><Backups /></PermissionGuard>} />

              {/* SYSTEM_ADMIN: five-pillar consolidation */}
              <Route path="membership" element={<PermissionGuard permissions={["reports.membership.view"]}><MembershipOverview /></PermissionGuard>} />
              <Route path="membership/analytics" element={<PermissionGuard permissions={["reports.membership.view"]}><MembershipAnalytics /></PermissionGuard>} />
              <Route path="membership/history" element={<PermissionGuard permissions={["audit.view"]}><MembershipHistory /></PermissionGuard>} />
              <Route path="operations/org" element={<PermissionGuard permissions={["reports.departments.view"]}><OrgOverviewPage /></PermissionGuard>} />
              <Route path="operations/attendance-meetings" element={<PermissionGuard permissions={["reports.attendance.view"]}><AttendanceMeetingsPage /></PermissionGuard>} />
              <Route path="operations/tasks-projects" element={<PermissionGuard permissions={["reports.system.view"]}><TasksProjectsPage /></PermissionGuard>} />
              <Route path="access/roles" element={<PermissionGuard permissions={["roles.view"]}><RolesPermissionsPage /></PermissionGuard>} />
              <Route path="access/activity" element={<PermissionGuard permissions={["audit.view"]}><ActivityAuditPage /></PermissionGuard>} />

              {/* Backward-compatible redirects from earlier routes */}
              <Route path="staff/users" element={<Navigate to="/admin/users" replace />} />
              <Route path="staff/create" element={<Navigate to="/admin/users?new=1" replace />} />
              <Route path="staff/roles" element={<Navigate to="/admin/roles" replace />} />
              <Route path="staff/permissions" element={<Navigate to="/admin/permissions" replace />} />
              <Route path="staff/account-status" element={<Navigate to="/admin/accounts" replace />} />
              <Route path="staff/user-activity" element={<Navigate to="/admin/user-activity" replace />} />
              <Route path="system/audit-logs" element={<Navigate to="/admin/audit-logs" replace />} />
              <Route path="system/health" element={<Navigate to="/admin/system-health" replace />} />
              <Route path="system/settings" element={<Navigate to="/admin/system-config" replace />} />
              <Route path="system/security" element={<Navigate to="/admin/system-config" replace />} />
              <Route path="system/config" element={<Navigate to="/admin/system-config" replace />} />
              <Route path="system/notifications" element={<Navigate to="/admin/system-config" replace />} />
              <Route path="system/access-control" element={<Navigate to="/admin/roles" replace />} />
              <Route path="system/backup" element={<Navigate to="/admin/backups" replace />} />
              <Route path="overview" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="reports" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="org/departments" element={<Navigate to="/admin/reports/departments" replace />} />
              <Route path="org/fellowships" element={<Navigate to="/admin/reports/fellowships" replace />} />
              <Route path="org/department-leadership" element={<Navigate to="/admin/reports/departments" replace />} />
              <Route path="org/fellowship-leadership" element={<Navigate to="/admin/reports/fellowships" replace />} />
              <Route path="org/meetings" element={<Navigate to="/admin/reports/meetings" replace />} />
              <Route path="org/performance" element={<Navigate to="/admin/reports/tasks" replace />} />
              <Route path="org/outstanding" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="insights" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="church-insights" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="governance/audit-reports" element={<Navigate to="/admin/audit-logs" replace />} />
              <Route path="governance/administrative-activity" element={<Navigate to="/admin/audit-logs" replace />} />
              <Route path="governance/access-history" element={<Navigate to="/admin/audit-logs" replace />} />
              <Route path="governance/system-wide" element={<Navigate to="/admin/dashboard" replace />} />

              {/* SYSTEM_ADMIN: Church-Wide Reports (READ-ONLY) */}
              <Route path="reports/membership" element={<PermissionGuard permissions={["reports.membership.view"]}><MembershipReport /></PermissionGuard>} />
              <Route path="reports/finance" element={<PermissionGuard permissions={["reports.finance.view"]}><FinanceReport /></PermissionGuard>} />
              <Route path="reports/departments" element={<PermissionGuard permissions={["reports.departments.view"]}><DepartmentReports /></PermissionGuard>} />
              <Route path="reports/fellowships" element={<PermissionGuard permissions={["reports.departments.view"]}><FellowshipReports /></PermissionGuard>} />
              <Route path="reports/attendance" element={<PermissionGuard permissions={["reports.attendance.view"]}><AttendanceReports /></PermissionGuard>} />
              <Route path="reports/meetings" element={<PermissionGuard permissions={["reports.system.view"]}><MeetingsReports /></PermissionGuard>} />
              <Route path="reports/followups" element={<PermissionGuard permissions={["reports.system.view"]}><FollowupReports /></PermissionGuard>} />
              <Route path="reports/tasks" element={<PermissionGuard permissions={["reports.system.view"]}><TasksReports /></PermissionGuard>} />
              <Route path="reports/projects" element={<PermissionGuard permissions={["reports.system.view"]}><ProjectsReports /></PermissionGuard>} />
              <Route path="reports/cms" element={<PermissionGuard permissions={["reports.cms.view"]}><CmsReports /></PermissionGuard>} />
              <Route path="reports/participation" element={<PermissionGuard permissions={["reports.system.view"]}><ParticipationReports /></PermissionGuard>} />
              <Route path="reports/registrations" element={<PermissionGuard permissions={["members.view"]}><RegistrationsReport /></PermissionGuard>} />
              <Route path="governance/financial-accountability" element={<PermissionGuard permissions={["reports.finance.view"]}><FinancialAccountability /></PermissionGuard>} />

              {/* Secretary operational (CHURCH_SECRETARY only - retains workflow) */}
              <Route path="secretary" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><SecretaryDashboard /></ProtectedRoute>} />
              <Route path="members" element={<ProtectedRoute roles={["CHURCH_SECRETARY", "SYSTEM_ADMIN"]}><MembersDirectory /></ProtectedRoute>} />
              <Route path="registrations" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><AdminRegistrations /></ProtectedRoute>} />
              <Route path="departments" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><DepartmentsPage /></ProtectedRoute>} />
              <Route path="fellowships" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><FellowshipsPage /></ProtectedRoute>} />
              <Route path="meetings" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><MeetingsPage /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><AttendancePage /></ProtectedRoute>} />
              <Route path="secretary/attendance" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><SecretaryAttendancePage /></ProtectedRoute>} />
              <Route path="followups" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><FollowupsPage /></ProtectedRoute>} />
              <Route path="tasks" element={<ProtectedRoute roles={["CHURCH_SECRETARY"]}><TasksPage /></ProtectedRoute>} />

              {/* Finance operational (FINANCE_ADMIN only) */}
              <Route path="finance" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceDashboard /></ProtectedRoute>} />
              <Route path="finance/record" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceRecord /></ProtectedRoute>} />
              <Route path="finance/invoices" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><InvoicesPage /></ProtectedRoute>} />
              <Route path="finance/invoices/:id" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><InvoiceDetailPage /></ProtectedRoute>} />
              <Route path="finance/contributions" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><ContributionsOversight /></ProtectedRoute>} />
              <Route path="finance/receipts" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><ReceiptsOversight /></ProtectedRoute>} />
              <Route path="finance/pledges" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinancePledges /></ProtectedRoute>} />
              <Route path="finance/expenses" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceExpenses /></ProtectedRoute>} />
              <Route path="finance/budgets" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><BudgetsPage /></ProtectedRoute>} />
              <Route path="finance/reports" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceReportsPage /></ProtectedRoute>} />
              <Route path="finance/whatsapp" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><WhatsAppNotificationsPage /></ProtectedRoute>} />
              <Route path="finance/accounts" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceAccountsPage /></ProtectedRoute>} />
              <Route path="finance/approvals" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceApprovalsPage /></ProtectedRoute>} />
              <Route path="finance/reconciliation" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceReconciliationPage /></ProtectedRoute>} />
              <Route path="finance/audit" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceAuditTrailPage /></ProtectedRoute>} />
              <Route path="finance/settings" element={<ProtectedRoute roles={["FINANCE_ADMIN"]}><FinanceSettingsPage /></ProtectedRoute>} />
            </Route>

            <Route path="/cms" element={<ProtectedRoute roles={["WEBSITE_ADMIN"]}><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<CmsDashboard />} />
              <Route path="homepage" element={<HomepageCms />} />
              <Route path="about" element={<AboutCms />} />
              <Route path="leadership" element={<ChurchLeadershipCms />} />
              <Route path="ministries" element={<MinistriesCms />} />
              <Route path="ministry-leaders" element={<MinistryLeadersCms />} />
              <Route path="schedule" element={<ScheduleCms />} />
              <Route path="events" element={<EventsCms />} />
              <Route path="news" element={<NewsCms />} />
              <Route path="testimonials" element={<TestimonialsCms />} />
              <Route path="giving" element={<GivingCms />} />
              <Route path="contact" element={<ContactCms />} />
              <Route path="contact-messages" element={<ContactMessagesCms />} />
              <Route path="media" element={<MediaCms />} />
              <Route path="settings" element={<SiteSettingsCms />} />
            </Route>

            <Route path="/member" element={<ProtectedRoute roles={["CHURCH_MEMBER"]}><MemberLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<MemberDashboard />} />
              <Route path="profile" element={<MemberProfile />} />
              <Route path="contributions" element={<MemberContributions />} />
              <Route path="receipts" element={<MemberReceipts />} />
              <Route path="pledges" element={<MemberPledges />} />
              <Route path="requests" element={<MemberRequests />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
