import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Search, ChevronRight, PackageCheck, AlertTriangle, Clock } from '../components/dashboard/icons';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import AdminFoundItemsView from '../components/admin/AdminFoundItemsView';
import BrowseFoundItemsPage from './BrowseFoundItemsPage';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getAllClaims, getAdminFoundItems } from '../services/adminService';
import { getUnreadCounts } from '../services/messagesService';
import { getNotifications, markNotificationRead } from '../services/notificationsService';

export default function AdminDashboard({ defaultTab }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const { data: messageUnreadCounts } = useQuery({
    queryKey: ['messages', 'unread', user?.role],
    queryFn: () => getUnreadCounts(user),
    refetchInterval: 10000,
    enabled: Boolean(user?.role === 'admin'),
  });

  const { data: adminNotifs = [] } = useQuery({
    queryKey: ['notifications', 'admin'],
    queryFn: () => getNotifications(user),
    enabled: Boolean(user?.role === 'admin'),
  });

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    defaultTab || (tabParam === 'catalog' ? 'admin-browse' : (tabParam === 'items' ? 'admin-items' : 'admin-claims'))
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (tabParam === 'catalog' && activeTab !== 'admin-browse') {
      setActiveTab('admin-browse');
    } else if (tabParam === 'items' && activeTab !== 'admin-items') {
      setActiveTab('admin-items');
    } else if ((!tabParam || tabParam === 'claims') && activeTab !== 'admin-claims' && activeTab !== 'admin-browse' && activeTab !== 'admin-items') {
      setActiveTab('admin-claims');
    }
  }, [defaultTab, tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'admin-browse') {
      setSearchParams({ tab: 'catalog' });
    } else if (tabId === 'admin-items') {
      setSearchParams({ tab: 'items' });
    } else {
      setSearchParams({});
    }
  };

  const [claimStatusFilter, setClaimStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const { data: claims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ['claims', 'admin'],
    queryFn: () => getAllClaims(user),
    enabled: Boolean(user?.role === 'admin'),
  });

  const { data: foundItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['adminFoundItems'],
    queryFn: () => getAdminFoundItems(user),
    enabled: Boolean(user?.role === 'admin'),
  });

  const filteredClaims = claims
    .filter((claim) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        claim.itemName.toLowerCase().includes(q) ||
        claim.referenceNo.toLowerCase().includes(q) ||
        (claim.claimantName || '').toLowerCase().includes(q) ||
        (claim.claimantId || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (claimStatusFilter === 'all') return true;
      if (claimStatusFilter === 'in-verification') return claim.currentStage < 5 && claim.status !== 'Rejected' && claim.status !== 'Needs More Info';
      if (claimStatusFilter === 'ready') return claim.currentStage === 5;
      if (claimStatusFilter === 'retrieved') return claim.currentStage === 6;
      if (claimStatusFilter === 'rejected') return claim.status === 'Rejected';
      if (claimStatusFilter === 'needs-info') return claim.status === 'Needs More Info';
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dateSubmitted || 0).getTime();
      const dateB = new Date(b.dateSubmitted || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const totalCount = claims.length;
  const inVerificationCount = claims.filter((c) => c.currentStage < 5 && c.status !== 'Rejected' && c.status !== 'Needs More Info').length;
  const readyCount = claims.filter((c) => c.currentStage === 5).length;
  const retrievedCount = claims.filter((c) => c.currentStage === 6).length;
  const rejectedCount = claims.filter((c) => c.status === 'Rejected').length;
  const needsInfoCount = claims.filter((c) => c.status === 'Needs More Info').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        profile={{
          fullName: user?.fullName || 'Officer R. Santos',
          studentId: user?.studentId || 'ADMIN-SEC-402',
          badge: 'Security Desk Administrator',
        }}
        messageUnreadCount={messageUnreadCounts?.total || 0}
        mode="admin"
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={adminNotifs}
          unreadCount={adminNotifs.filter((n) => n.unread).length}
          onSelectNotification={(notif) => {
            if (notif.deepLink) {
              navigate(notif.deepLink);
            }
            markNotificationRead(notif.id);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }}
          semester="Admin Security Hub • Terminal #01"
          mode="admin"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'admin-claims' && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-950 border border-yellow-300 mb-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-yellow-700" />
                      <span>Security Officer Verification Terminal</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      All Student Ownership Claims
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Cross-reference claimant private evidence against intake catalog vaults, advance stages, request clarification, and issue contactless retrieval PINs.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 shrink-0">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[70px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Total</span>
                      <span className="text-base font-extrabold text-slate-900">{totalCount}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[70px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Review</span>
                      <span className="text-base font-extrabold text-slate-900">{inVerificationCount}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[70px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Ready</span>
                      <span className="text-base font-extrabold text-slate-900">{readyCount}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[70px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Retrieved</span>
                      <span className="text-base font-extrabold text-slate-900">{retrievedCount}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[70px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Needs Info</span>
                      <span className="text-base font-extrabold text-slate-900">{needsInfoCount}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[70px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Rejected</span>
                      <span className="text-base font-extrabold text-slate-900">{rejectedCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'All', count: totalCount },
                      { id: 'in-verification', label: 'In Verification', count: inVerificationCount },
                      { id: 'ready', label: 'Ready for Pickup', count: readyCount },
                      { id: 'needs-info', label: 'Needs More Info', count: needsInfoCount },
                      { id: 'rejected', label: 'Rejected', count: rejectedCount },
                      { id: 'retrieved', label: 'Retrieved', count: retrievedCount },
                    ].map((tab) => {
                      const isActive = claimStatusFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setClaimStatusFilter(tab.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isActive
                              ? 'bg-yellow-400 text-slate-950 font-bold shadow-2xs'
                              : 'bg-slate-100 hover:bg-yellow-50 hover:text-yellow-950 text-slate-600'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                              isActive ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search item, ref, student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500"
                      />
                    </div>

                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Claim Ref &amp; Item</th>
                        <th className="py-3 px-4">Claimant Student</th>
                        <th className="py-3 px-4">Date Filed</th>
                        <th className="py-3 px-4">Custody Station</th>
                        <th className="py-3 px-4">Status &amp; Stage</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {claimsLoading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            Loading all student claims...
                          </td>
                        </tr>
                      ) : filteredClaims.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No claims match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredClaims.map((claim) => (
                          <tr key={claim.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-slate-500 text-[11px] block">
                                {claim.referenceNo}
                              </span>
                              <span className="font-bold text-slate-900 text-xs block mt-0.5">
                                {claim.itemName}
                              </span>
                              <span className="text-[11px] text-slate-400 block">{claim.category}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-800">{claim.claimantName || 'Student'}</p>
                              <p className="text-[11px] font-mono text-slate-400">ID: {claim.claimantId}</p>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 font-medium">{claim.dateSubmitted}</td>

                            <td className="py-3.5 px-4 text-slate-700 font-semibold">{claim.custodyLocation}</td>

                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${claim.statusBadge}`}>
                                  {claim.status}
                                </span>
                                {claim.hasStudentReply && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block animate-pulse">
                                    Student Replied
                                  </span>
                                )}
                                {messageUnreadCounts?.byClaim?.[claim.id] > 0 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white inline-block">
                                    {messageUnreadCounts.byClaim[claim.id]} unread
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block mt-1">
                                Stage {claim.currentStage} of 6
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/claims/${claim.id}`)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs shadow-2xs transition cursor-pointer"
                              >
                                <span>Review</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin-items' && (
            <AdminFoundItemsView items={foundItems} claims={claims} />
          )}

          {activeTab === 'admin-browse' && (
            <BrowseFoundItemsPage inDashboard />
          )}
        </main>
      </div>
    </div>
  );
}
