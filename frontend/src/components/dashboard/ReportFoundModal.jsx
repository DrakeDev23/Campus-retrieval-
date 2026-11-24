import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, PackagePlus, CheckCircle2, ShieldCheck, MapPin } from './icons';

export default function ReportFoundModal({ isOpen, onClose, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    dateFound: new Date().toISOString().split('T')[0],
    locationFound: 'Student Center Cafeteria',
    custodyStatus: 'Turned over to Campus Lost & Found Office',
    description: '',
    storageRef: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setErrors({});
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Item name is required';
    if (!formData.description.trim()) newErrors.description = 'Please describe the found item';
    if (!formData.locationFound.trim()) newErrors.locationFound = 'Location where found is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newFoundReport = {
        id: `FR-${Math.floor(1000 + Math.random() * 9000)}`,
        title: formData.title,
        category: formData.category,
        dateFound: formData.dateFound,
        locationFound: formData.locationFound,
        description: formData.description,
        custodyStatus: formData.custodyStatus,
        status: 'Verified by Staff',
        statusColor: 'emerald',
      };

      setIsSubmitting(false);
      setSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(newFoundReport);
      }
      setTimeout(() => {
        onClose();
      }, 1400);
    }, 700);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Report a Found Belonging</h2>
              <p className="text-xs text-slate-500">Log an item found on campus to help return it to its owner</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Found Item Registered!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for your honesty and contribution to our campus community. The item has been logged into the central retrieval registry.
              </p>
            </div>
          ) : (
            <form id="found-item-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Name / Brief Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Black Casio Scientific Calculator fx-991EX"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.title ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-300 focus:ring-blue-600/20 focus:border-blue-600'
                  }`}
                />
                {errors.title && <p className="text-rose-600 text-[11px] mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="Electronics">Electronics & Gadgets</option>
                    <option value="Identification & Cards">ID, Wallets & Banking Cards</option>
                    <option value="Bags & Backpacks">Bags & Pouches</option>
                    <option value="Keys">Keys & Access Fobs</option>
                    <option value="Books & Stationery">Books, Notes & Stationery</option>
                    <option value="Personal Accessories">Eyewear, Jewelry & Apparel</option>
                    <option value="Other">Other Personal Belonging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Found</label>
                  <input
                    type="date"
                    name="dateFound"
                    value={formData.dateFound}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Found <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="locationFound"
                  value={formData.locationFound}
                  onChange={handleChange}
                  placeholder="e.g. Student Center 2nd Floor Dining Table 6"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.locationFound ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-300 focus:ring-blue-600/20 focus:border-blue-600'
                  }`}
                />
                {errors.locationFound && <p className="text-rose-600 text-[11px] mt-1">{errors.locationFound}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Custody / Where Turned In
                </label>
                <select
                  name="custodyStatus"
                  value={formData.custodyStatus}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="Turned over to Campus Lost & Found Office">Turned over to Campus Lost & Found Office (Student Center 104)</option>
                  <option value="Turned over to Campus Security Desk">Turned over to Campus Security Desk (Main Gate / Post 1)</option>
                  <option value="Turned over to Library Information Counter">Turned over to Library Information Counter</option>
                  <option value="Currently in my safe custody pending surrender">Currently in my safe custody pending turnover</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Description & Condition <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe color, general condition, distinctive stickers or marks (keep sensitive contents or passwords confidential)..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.description ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-300 focus:ring-blue-600/20 focus:border-blue-600'
                  }`}
                />
                {errors.description && <p className="text-rose-600 text-[11px] mt-1">{errors.description}</p>}
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Thank you for helping keep campus trustworthy. High-value belongings turned into campus security or the retrieval office receive priority cataloging and automated owner matching.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="found-item-form"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Registering Found Item...' : 'Submit Found Item'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
