import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import campusBg from '../assets/uc.jpg';
import Breadcrumb from '../components/common/Breadcrumb';
import ItemCard from '../components/common/ItemCard';

const CATEGORIES = [
  'All',
  'Electronics',
  'Bags & Backpacks',
  'IDs & Wallets',
  'Keys & Fobs',
  'Books & Stationery',
  'Clothing & Apparel',
  'Drinkware',
];

const STATUS_COLORS = {
  'In Custody': 'bg-blue-50 text-blue-700 border-blue-200',
  'Verification Required': 'bg-amber-50 text-amber-700 border-amber-200',
  'Retrieval Authorized': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Retrieved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const CUSTODY_COLORS = {
  Retrieved: 'text-emerald-600',
  default: 'text-blue-600',
};

const ITEMS = [
  {
    title: 'MacBook Air 13" M2',
    category: 'Electronics',
    status: 'Verification Required',
    description: 'Space Gray laptop found inside neoprene sleeve on the 2nd floor silent study carrels.',
    foundTime: 'Today, 10:15 AM',
    location: 'Main Library',
    custody: 'Campus Security Hub',
    buttonType: 'claim',
  },
  {
    title: 'Sony WH-1000XM4 Headphones',
    category: 'Electronics',
    status: 'In Custody',
    description: 'Black over-ear wireless headphones with original carrying case and auxiliary cable.',
    foundTime: 'Today, 08:40 AM',
    location: 'Student Center',
    custody: 'Locker #04 (Self-Service)',
    buttonType: 'claim',
  },
  {
    title: 'Student ID & Keycard Lanyard',
    category: 'IDs & Wallets',
    status: 'Retrieval Authorized',
    description: 'University branded navy lanyard holding magnetic dorm keycard and dining access badge.',
    foundTime: 'Yesterday, 04:20 PM',
    location: 'Science & Tech Quad',
    custody: 'Registrar Front Desk',
    buttonType: 'claim',
  },
  {
    title: 'North Face Recon Backpack',
    category: 'Bags & Backpacks',
    status: 'Verification Required',
    description: 'Charcoal gray backpack containing notebooks, binders, and a graphite mechanical pencil set.',
    foundTime: 'Yesterday, 02:15 PM',
    location: 'Gymnasium',
    custody: 'Athletics Equipment Desk',
    buttonType: 'claim',
  },
  {
    title: 'TI-84 Plus CE Calculator',
    category: 'Books & Stationery',
    status: 'In Custody',
    description: 'White graphing calculator with protective slide cover, found on lecture hall desk.',
    foundTime: 'Nov 09, 11:30 AM',
    location: 'Math & Sciences Bldg',
    custody: 'Locker #09 (Self-Service)',
    buttonType: 'claim',
  },
  {
    title: 'Car Key Fob & House Keys',
    category: 'Keys & Fobs',
    status: 'Retrieved',
    description: 'Honda key fob on brass carabiner with two silver door keys and leather tag.',
    foundTime: 'Nov 08, 05:00 PM',
    location: 'Parking Lot B',
    custody: 'Reunited with Owner',
    buttonType: 'closed',
  },
  {
    title: 'Navy Varsity Zip-Up Hoodie',
    category: 'Clothing & Apparel',
    status: 'In Custody',
    description: 'Size medium navy hoodie with university crest, left on a cafeteria chair.',
    foundTime: 'Nov 08, 12:10 PM',
    location: 'Student Center',
    custody: 'Dining Hall Front Desk',
    buttonType: 'claim',
  },
  {
    title: 'Stainless Steel Water Bottle',
    category: 'Drinkware',
    status: 'Retrieval Authorized',
    description: 'Matte black insulated bottle with a dented cap and a campus trail-run sticker.',
    foundTime: 'Nov 07, 09:50 AM',
    location: 'Gymnasium',
    custody: 'Athletics Equipment Desk',
    buttonType: 'claim',
  },
];

const LOCATIONS = ['All Locations', ...Array.from(new Set(ITEMS.map((item) => item.location)))];
const STATUSES = ['All Statuses', ...Array.from(new Set(ITEMS.map((item) => item.status)))];

const SELECT_CLASSES =
  'w-full sm:w-auto pl-3 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none';

export default function BrowseFoundItemsPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState('All Locations');
  const [status, setStatus] = useState('All Statuses');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('grid');

  const items = useMemo(
    () =>
      ITEMS.map((item) => ({
        ...item,
        statusColor: STATUS_COLORS[item.status],
        custodyColor: item.status === 'Retrieved' ? CUSTODY_COLORS.Retrieved : CUSTODY_COLORS.default,
      })),
    []
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (location !== 'All Locations' && item.location !== location) return false;
      if (status !== 'All Statuses' && item.status !== status) return false;
      if (query && !`${item.title} ${item.description}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, category, location, status, searchQuery]);

  return (
    <section className="relative overflow-hidden isolate pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <img src={campusBg} alt="University campus background texture" className="absolute inset-0 -z-30 h-full w-full object-cover object-center opacity-15 grayscale" />
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-white/90 to-slate-50" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(15,23,42,0.10)_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Browse Found Items' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Browse Found Items
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-2xl">
            Currently cataloged campus belongings in official security custody.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <label htmlFor="browse-search" className="sr-only">Search found items</label>
              <input
                id="browse-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label htmlFor="browse-location" className="sr-only">Filter by location</label>
                <select
                  id="browse-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={SELECT_CLASSES}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="browse-status" className="sr-only">Filter by status</label>
                <select
                  id="browse-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={SELECT_CLASSES}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-1 shadow-sm self-start" role="group" aria-label="Toggle item layout">
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  aria-pressed={view === 'grid'}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    view === 'grid' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  aria-label="List view"
                  className={`p-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    view === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  category === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 text-sm font-medium text-slate-500">
          Showing {filteredItems.length} of {items.length} items
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white/60 border border-dashed border-slate-300 rounded-2xl">
            <p className="text-sm font-semibold text-slate-600">No items match your filters.</p>
            <p className="mt-1 text-sm text-slate-500">Try clearing the search or selecting a different category.</p>
          </div>
        ) : (
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'grid grid-cols-1 gap-4 max-w-3xl'
            }
          >
            {filteredItems.map((item) => (
              <ItemCard key={item.title} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
