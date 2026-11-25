import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getClaims } from '../services/claimsService';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  removeNotification,
} from '../services/notificationsService';
import { getUnreadCounts } from '../services/messagesService';
import Toast from '../components/common/Toast';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatsCards from '../components/dashboard/StatsCards';
import QuickActions from '../components/dashboard/QuickActions';
import ClaimTracker from '../components/dashboard/ClaimTracker';
import ClaimsTrackingView from '../components/dashboard/ClaimsTrackingView';
import ReportsTable from '../components/dashboard/ReportsTable';
import NotificationsCard from '../components/dashboard/NotificationsCard';
import ReportLostModal from '../components/dashboard/ReportLostModal';
import ReportFoundModal from '../components/dashboard/ReportFoundModal';
import BrowseFoundItemsPage from './BrowseFoundItemsPage';
import { X, ImageIcon, Eye, PackageCheck } from '../components/dashboard/icons';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_STATS,
  INITIAL_ACTIVE_CLAIM,
  INITIAL_CLAIMS_LIST,
  INITIAL_LOST_REPORTS,
  INITIAL_FOUND_REPORTS,
  INITIAL_NOTIFICATIONS,
} from '../components/dashboard/mockData';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { user: currentUser } = useCurrentUser();
  const claimantId = currentUser?.studentId || currentUser?.id;
  const [unauthToast, setUnauthToast] = useState(null);

  useEffect(() => {
    if (location.state?.unauthorizedMessage) {
      setUnauthToast({
        type: 'error',
        title: 'Access Restricted',
        message: location.state.unauthorizedMessage,
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('campus_sidebar_open');
      if (stored !== null) return stored === 'true';
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_sidebar_open', String(next));
      }
      return next;
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campus_sidebar_open', 'false');
    }
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campus_sidebar_open', 'true');
    }
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [isReportLostOpen, setIsReportLostOpen] = useState(false);
  const [isReportFoundOpen, setIsReportFoundOpen] = useState(false);
  const [selectedFoundReport, setSelectedFoundReport] = useState(null);

  const queryClient = useQueryClient();
  const [lostReports, setLostReports] = useState(INITIAL_LOST_REPORTS);
  const [foundReports, setFoundReports] = useState(INITIAL_FOUND_REPORTS);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [activeClaim, setActiveClaim] = useState(INITIAL_ACTIVE_CLAIM);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', claimantId],
    queryFn: () => getNotifications(claimantId),
    initialData: INITIAL_NOTIFICATIONS,
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(claimantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const removeNotifMutation = useMutation({
    mutationFn: (notifId) => removeNotification(notifId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const { data: messageUnreadCounts } = useQuery({
    queryKey: ['messages', 'unread', claimantId],
    queryFn: () => getUnreadCounts(currentUser),
    refetchInterval: 10000,
    enabled: Boolean(claimantId),
  });

  const { data: claimsList = [] } = useQuery({
    queryKey: ['claims', claimantId],
    queryFn: () => getClaims(claimantId),
    enabled: Boolean(claimantId),
  });

  const profile = {
    ...INITIAL_STUDENT_PROFILE,
    fullName:
      user?.fullName ||
      (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : INITIAL_STUDENT_PROFILE.fullName),
    studentId: user?.studentId || INITIAL_STUDENT_PROFILE.studentId,
    email: user?.email || INITIAL_STUDENT_PROFILE.email,
    role: user?.role || 'student',
    badge: user?.badge || INITIAL_STUDENT_PROFILE.badge,
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    markAllMutation.mutate();
  };

  const handleRemoveNotification = (notifId) => {
    removeNotifMutation.mutate(notifId);
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
      image: newReport.image || null,
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
      image: newFound.image || null,
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
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onOpen={openSidebar}
        onClose={closeSidebar}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        unreadCount={unreadCount}
        messageUnreadCount={messageUnreadCounts?.total || 0}
        onOpenReportLost={() => setIsReportLostOpen(true)}
        onOpenReportFound={() => setIsReportFoundOpen(true)}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          onRemoveNotification={handleRemoveNotification}
          onSelectNotification={(notif) => {
            if (notif.deepLink) {
              navigate(notif.deepLink);
            }
            markNotificationRead(notif.id);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }}
          onBrowse={() => setActiveTab('browse')}
          semester={profile.semester}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <WelcomeBanner
                semester={profile.semester}
                onOpenReportLost={() => setIsReportLostOpen(true)}
                onOpenReportFound={() => setIsReportFoundOpen(true)}
              />

              <StatsCards stats={stats} />

              <ClaimTracker
                claim={activeClaim}
                onViewAllClaims={() => setActiveTab('claims-tracking')}
              />

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
                    onRemoveNotification={handleRemoveNotification}
                    onOpenNotif={(notif) => {
                      if (notif?.deepLink) {
                        navigate(notif.deepLink);
                      } else {
                        setActiveTab('notifications');
                      }
                      if (notif?.id) {
                        markNotificationRead(notif.id);
                        queryClient.invalidateQueries({ queryKey: ['notifications'] });
                      }
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'browse' && (
            <BrowseFoundItemsPage inDashboard />
          )}

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
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {foundReports.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <div
                                  onClick={() => setSelectedFoundReport(item)}
                                  className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs cursor-pointer group/fnd"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.itemName}
                                    className="w-full h-full object-cover group-hover/fnd:scale-105 transition duration-200"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/fnd:opacity-100 transition flex items-center justify-center">
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => setSelectedFoundReport(item)}
                                  className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 cursor-pointer"
                                >
                                  <ImageIcon className="w-4 h-4 text-slate-300" />
                                  <span className="text-[8px] text-slate-400 font-medium">No photo</span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <span
                                  onClick={() => setSelectedFoundReport(item)}
                                  className="font-semibold text-slate-900 block text-xs hover:text-blue-600 transition cursor-pointer truncate max-w-[200px]"
                                >
                                  {item.itemName}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">Ref: {item.id}</span>
                              </div>
                            </div>
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
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedFoundReport(item)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedFoundReport &&
            typeof document !== 'undefined' &&
            createPortal(
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedFoundReport(null);
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="found-report-modal-title"
              >
                <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <PackageCheck className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 id="found-report-modal-title" className="text-base font-bold text-slate-900">
                          Found Item Details
                        </h3>
                        <p className="text-xs text-slate-500">ID: {selectedFoundReport.id}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFoundReport(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      aria-label="Close details"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="my-5 space-y-3.5 text-xs">
                    {selectedFoundReport.image && (
                      <div className="w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative shadow-2xs">
                        <img
                          src={selectedFoundReport.image}
                          alt={selectedFoundReport.itemName}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold bg-slate-900/80 text-white px-2.5 py-1 rounded-md backdrop-blur-xs">
                          Attached Found Photo
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 font-medium">Item Name</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedFoundReport.itemName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 font-medium">Category</span>
                        <p className="font-semibold text-slate-800">{selectedFoundReport.category}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Status</span>
                        <p className="font-semibold text-slate-800">{selectedFoundReport.status}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Location Found</span>
                        <p className="font-semibold text-slate-800">{selectedFoundReport.locationFound}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Date Found</span>
                        <p className="font-semibold text-slate-800">{selectedFoundReport.dateFound}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium">Custody Facility</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedFoundReport.custodyFacility}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium">Item Description</span>
                      <p className="mt-1 text-slate-700 leading-relaxed bg-slate-50/70 border border-slate-100 p-3 rounded-xl">
                        {selectedFoundReport.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedFoundReport(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {activeTab === 'claims-tracking' && (
            <ClaimsTrackingView claims={claimsList} unreadCounts={messageUnreadCounts} />
          )}

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
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No notifications available.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.deepLink) navigate(item.deepLink);
                        markNotificationRead(item.id);
                        queryClient.invalidateQueries({ queryKey: ['notifications'] });
                      }}
                      className={`p-5 transition flex items-start justify-between gap-4 cursor-pointer ${
                        item.unread ? 'bg-blue-50/20' : 'bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
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

                      <button
                        type="button"
                        onClick={() => handleRemoveNotification(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                        title="Remove notification"
                        aria-label="Remove notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

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

      <Toast toast={unauthToast} onDismiss={() => setUnauthToast(null)} />
    </div>
  );
}
