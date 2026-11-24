import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatsCards from '../components/dashboard/StatsCards';
import QuickActions from '../components/dashboard/QuickActions';
import ClaimTracker from '../components/dashboard/ClaimTracker';
import ReportsTable from '../components/dashboard/ReportsTable';
import NotificationsCard from '../components/dashboard/NotificationsCard';
import ReportLostModal from '../components/dashboard/ReportLostModal';
import ReportFoundModal from '../components/dashboard/ReportFoundModal';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_STATS,
  INITIAL_ACTIVE_CLAIM,
  INITIAL_LOST_REPORTS,
  INITIAL_FOUND_REPORTS,
  INITIAL_NOTIFICATIONS,
} from '../components/dashboard/mockData';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [isReportLostOpen, setIsReportLostOpen] = useState(false);
  const [isReportFoundOpen, setIsReportFoundOpen] = useState(false);

  // Live data states
  const [lostReports, setLostReports] = useState(INITIAL_LOST_REPORTS);
  const [foundReports, setFoundReports] = useState(INITIAL_FOUND_REPORTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [activeClaim, setActiveClaim] = useState(INITIAL_ACTIVE_CLAIM);

  // Student Profile
  const profile = {
    ...INITIAL_STUDENT_PROFILE,
    fullName: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.studentId
      ? `Student #${user.studentId}`
      : INITIAL_STUDENT_PROFILE.fullName,
    studentId: user?.studentId || INITIAL_STUDENT_PROFILE.studentId,
    email: user?.email || INITIAL_STUDENT_PROFILE.email,
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNewLostReport = (newReport) => {
    const formatted = {
      id: newReport.id,
      itemName: newReport.title,
      category: newReport.category,
      dateLost: newReport.dateLost,
      locationLost: newReport.locationLost,
      status: 'Active Searching',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      hasMatch: false,
      matchedItemTitle: null,
      description: newReport.description,
    };

    setLostReports((prev) => [formatted, ...prev]);
    setStats((prev) =>
      prev.map((s) =>
        s.id === 'lost-reports'
          ? { ...s, value: String(parseInt(s.value, 10) + 1) }
          : s
      )
    );
  };

  const handleNewFoundReport = (newFound) => {
    const formatted = {
      id: newFound.id,
      itemName: newFound.title,
      category: newFound.category,
      dateFound: newFound.dateFound,
      locationFound: newFound.locationFound,
      custodyFacility: newFound.custodyStatus,
      status: 'Verified in Custody',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: newFound.description,
    };

    setFoundReports((prev) => [formatted, ...prev]);
    setStats((prev) =>
      prev.map((s) =>
        s.id === 'found-reports'
          ? { ...s, value: String(parseInt(s.value, 10) + 1) }
          : s
      )
    );
  };

  const handleSelectStatCard = (cardId) => {
    if (cardId === 'lost-reports') setActiveTab('my-lost-reports');
    else if (cardId === 'found-reports') setActiveTab('my-found-reports');
    else if (cardId === 'pending-claims' || cardId === 'approved-retrieved') {
      setActiveTab('claims-tracking');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      {/* Fixed Vertical Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        unreadCount={unreadCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenReportLost={() => setIsReportLostOpen(true)}
        onOpenReportFound={() => setIsReportFoundOpen(true)}
      />

      {/* Main Dashboard Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Header */}
        <Header
          onOpenMobile={() => setMobileSidebarOpen(true)}
          unreadCount={unreadCount}
          onOpenNotifications={() => setActiveTab('notifications')}
          semester={profile.semester}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* A. Welcome Banner */}
              <WelcomeBanner semester={profile.semester} />

              {/* B. Dashboard Statistics */}
              <StatsCards stats={stats} onSelectCard={handleSelectStatCard} />

              {/* C. Quick Actions */}
              <QuickActions
                onOpenReportLost={() => setIsReportLostOpen(true)}
                onOpenReportFound={() => setIsReportFoundOpen(true)}
              />

              {/* D. Active Claim Tracker */}
              <ClaimTracker claim={activeClaim} />

              {/* E & F. Active Lost Reports & Recent Notifications Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                  <ReportsTable
                    reports={lostReports}
                    onOpenReportLost={() => setIsReportLostOpen(true)}
                    onViewAllReports={() => setActiveTab('my-lost-reports')}
                  />
                </div>
                <div className="lg:col-span-1">
                  <NotificationsCard
                    notifications={notifications}
                    onMarkAllRead={handleMarkAllRead}
                    onOpenNotif={() => setActiveTab('notifications')}
                  />
                </div>
              </div>
            </>
          )}

          {/* Sub-view: My Lost Reports */}
          {activeTab === 'my-lost-reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    My Lost Item Reports
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage and track all missing belonging inquiries submitted under Student ID {profile.studentId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportLostOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition cursor-pointer shrink-0"
                >
                  <span>+ File Lost Report</span>
                </button>
              </div>

              <ReportsTable
                reports={lostReports}
                onOpenReportLost={() => setIsReportLostOpen(true)}
              />
            </div>
          )}

          {/* Sub-view: My Found Reports */}
          {activeTab === 'my-found-reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    My Found Item Submissions
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Items you turned into campus staff or logged to help fellow students find their belongings
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportFoundOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition cursor-pointer shrink-0"
                >
                  <span>+ Report Found Item</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Item Details</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Date Found</th>
                        <th className="py-3 px-4">Location Found</th>
                        <th className="py-3 px-4">Custody Facility</th>
                        <th className="py-3 px-4">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {foundReports.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block text-xs">{item.itemName}</span>
                            <span className="text-[11px] font-mono text-slate-400">Ref: {item.id}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{item.category}</td>
                          <td className="py-3.5 px-4 text-slate-600">{item.dateFound}</td>
                          <td className="py-3.5 px-4 text-slate-600">{item.locationFound}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">{item.custodyFacility}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${item.statusColor}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-view: My Claims & Tracking */}
          {activeTab === 'claims-tracking' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  My Claims & Real-Time Tracking
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Track student identity and ownership verification status across all active item claims
                </p>
              </div>

              {/* Claim Tracker component */}
              <ClaimTracker claim={activeClaim} />

              {/* Claim Policy Reference */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Claim Verification Standards & Guidelines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">1. Proof of Ownership</p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Ensure you bring valid matching credentials (device unlock passcode, purchase receipt, serial registration, or physical description).
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">2. University Photo ID</p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Present your physical student identification card upon in-person retrieval at the Student Center Room 104.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">3. Handover Receipt</p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      A digital sign-off will be logged to finalize retrieval and automatically update your student dashboard status.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-view: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Student Notifications & Alerts
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    System notifications, status changes, and campus item match recommendations
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 transition flex items-start gap-3 ${
                      item.unread ? 'bg-blue-50/20' : 'bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-view: Profile & Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Student Profile & System Settings
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your university contact information and notification preferences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    University Student Identification
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Full Student Name</span>
                      <span className="font-semibold text-slate-800 text-sm">{profile.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Student ID Number</span>
                      <span className="font-mono font-semibold text-slate-800">{profile.studentId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Academic Course & Level</span>
                      <span className="font-medium text-slate-800">{profile.course} • {profile.yearLevel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Official University Email</span>
                      <span className="font-medium text-blue-600">{profile.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Account Status</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {profile.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    Notification & Retrieval Alerts
                  </h3>
                  <div className="space-y-3 text-xs">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-slate-700">Immediate email alert when a potential item match is logged</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-slate-700">SMS updates for claim verification & approval ready for pickup</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-slate-700">Daily summary of newly logged campus items in your category</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ReportLostModal
        isOpen={isReportLostOpen}
        onClose={() => setIsReportLostOpen(false)}
        onSubmitSuccess={handleNewLostReport}
      />

      <ReportFoundModal
        isOpen={isReportFoundOpen}
        onClose={() => setIsReportFoundOpen(false)}
        onSubmitSuccess={handleNewFoundReport}
      />
    </div>
  );
}
