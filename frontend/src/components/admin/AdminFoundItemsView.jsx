import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PackageCheck, PlusCircle, Search, Edit, Trash2, X, AlertTriangle, ShieldCheck } from '../dashboard/icons';
import ItemImageUpload from '../dashboard/ItemImageUpload';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { addFoundItem, editFoundItem, deleteFoundItem, updateItemStatus, hasActiveClaimsForItem } from '../../services/adminService';
import Toast from '../common/Toast';

const CATEGORIES = [
  'Electronics',
  'IDs & Wallets',
  'Bags & Backpacks',
  'Keys & Fobs',
  'Books & Stationery',
  'Clothing & Apparel',
  'Drinkware',
  'Jewelry & Watches',
  'Other',
];

export default function AdminFoundItemsView({ items = [], claims = [] }) {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    status: 'In Custody',
    location: '',
    custody: 'Campus Security Hub',
    description: '',
    hiddenIdentifiers: '',
    image: null,
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return item.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const openAddModal = () => {
    setFormData({
      title: '',
      category: 'Electronics',
      status: 'In Custody',
      location: '',
      custody: 'Campus Security Hub Room 102',
      description: '',
      hiddenIdentifiers: '',
      image: null,
    });
    setFormErrors({});
    setModalMode('add');
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      status: item.status,
      location: item.location,
      custody: item.custody,
      description: item.description || '',
      hiddenIdentifiers: item.hiddenIdentifiers || '',
      image: item.image || null,
    });
    setFormErrors({});
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingItem(null);
  };

  const addMutation = useMutation({
    mutationFn: (data) => addFoundItem(data, user),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['adminFoundItems'] });
      queryClient.invalidateQueries({ queryKey: ['publicFoundItems'] });
      setToast({
        type: 'success',
        title: 'Found Item Logged',
        message: `${newItem.title} (${newItem.id}) logged into inventory.`,
      });
      closeModal();
    },
    onError: (err) => {
      setFormErrors((p) => ({ ...p, form: err?.message || 'Failed to save item.' }));
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => editFoundItem(id, data, user),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminFoundItems'] });
      queryClient.invalidateQueries({ queryKey: ['publicFoundItems'] });
      setToast({
        type: 'success',
        title: 'Item Record Updated',
        message: `Updated catalog entry for ${updated.title}.`,
      });
      closeModal();
    },
    onError: (err) => {
      setFormErrors((p) => ({ ...p, form: err?.message || 'Failed to update item.' }));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => updateItemStatus(id, newStatus, user),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminFoundItems'] });
      queryClient.invalidateQueries({ queryKey: ['publicFoundItems'] });
      setToast({
        type: 'success',
        title: 'Status Updated',
        message: `${updated.title} marked as "${updated.status}".`,
      });
    },
    onError: (err) => {
      setToast({
        type: 'error',
        title: 'Action Blocked',
        message: err?.message || 'Cannot update status.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFoundItem(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoundItems'] });
      queryClient.invalidateQueries({ queryKey: ['publicFoundItems'] });
      setToast({
        type: 'success',
        title: 'Item Removed',
        message: 'Found item record deleted from database.',
      });
    },
    onError: (err) => {
      setToast({
        type: 'error',
        title: 'Deletion Blocked',
        message: err?.message || 'Cannot delete item.',
      });
    },
  });

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Item title is required.';
    if (!formData.location.trim()) errs.location = 'Location found is required.';
    if (!formData.custody.trim()) errs.custody = 'Custody facility is required.';
    if (!formData.hiddenIdentifiers.trim()) {
      errs.hiddenIdentifiers = 'Hidden identifying marks (serial #, private marks) are required for fraud prevention.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (modalMode === 'add') {
      addMutation.mutate(formData);
    } else if (modalMode === 'edit' && editingItem) {
      editMutation.mutate({ id: editingItem.id, data: formData });
    }
  };

  const isSaving = addMutation.isPending || editMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Authorized Intake &amp; Vault Custody</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Found Items Management
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Record newly turned-in articles, maintain custody vaults, store private identifying marks withheld from public browsing, and coordinate student retrievals.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Log Found Item</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('In Custody')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'In Custody'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            In Custody
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Claimed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'Claimed'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Claimed / Authorized
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Returned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'Returned'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Returned
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search items, custody, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Item &amp; ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location Found</th>
                <th className="py-3 px-4">Custody Station</th>
                <th className="py-3 px-4">Status &amp; Actions</th>
                <th className="py-3 px-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No found items match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const hasActiveClaims = hasActiveClaimsForItem(claims, item.id, item.title);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <PackageCheck className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">{item.title}</p>
                            <p className="text-[11px] font-mono text-slate-400">{item.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{item.category}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.location}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{item.custody}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={item.status}
                            disabled={statusMutation.isPending}
                            onChange={(e) => {
                              statusMutation.mutate({ id: item.id, newStatus: e.target.value });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 ${
                              item.status === 'In Custody'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : item.status === 'Claimed' || item.status === 'Retrieval Authorized'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            <option value="In Custody">In Custody</option>
                            <option value="Claimed">Claimed</option>
                            <option value="Returned">Returned</option>
                          </select>

                          {hasActiveClaims && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0"
                              title="Active claim in progress"
                            >
                              Active Claim
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Edit Item Details"
                          >
                            <span className="text-xs font-semibold">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete item ${item.title} (${item.id})?`)) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            disabled={hasActiveClaims || deleteMutation.isPending}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={hasActiveClaims ? 'Cannot delete while active claims exist' : 'Delete item'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <PackageCheck className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {modalMode === 'add' ? 'Log New Found Item' : `Edit Item (${editingItem?.id})`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs" noValidate>
                {formErrors.form && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                    {formErrors.form}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Item Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Sony WH-1000XM4 Headphones"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  {formErrors.title && <p className="text-[11px] text-red-600 mt-1">{formErrors.title}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="In Custody">In Custody</option>
                      <option value="Claimed">Claimed</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Location Found *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Student Center Cafeteria"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    {formErrors.location && <p className="text-[11px] text-red-600 mt-1">{formErrors.location}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Custody Station *</label>
                    <input
                      type="text"
                      value={formData.custody}
                      onChange={(e) => setFormData((p) => ({ ...p, custody: e.target.value }))}
                      placeholder="e.g. Locker #04 (Self-Service)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    {formErrors.custody && <p className="text-[11px] text-red-600 mt-1">{formErrors.custody}</p>}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Public Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="General description visible to students on the public browse catalog..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <label className="block font-bold text-amber-950 mb-1">
                    Hidden Identifying Details (Admin Vault Only) *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.hiddenIdentifiers}
                    onChange={(e) => setFormData((p) => ({ ...p, hiddenIdentifiers: e.target.value }))}
                    placeholder="Withheld serial numbers, device MAC address, stickers, hidden contents, or unique scratches..."
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    These details are never exposed to public browse views. They are used exclusively by administrators to compare against claimant proof.
                  </p>
                  {formErrors.hiddenIdentifiers && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.hiddenIdentifiers}</p>
                  )}
                </div>

                <div>
                  <ItemImageUpload
                    value={formData.image}
                    onChange={(img) => setFormData((p) => ({ ...p, image: img }))}
                    label="Item Photo (Optional)"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : modalMode === 'add' ? 'Log Found Item' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
