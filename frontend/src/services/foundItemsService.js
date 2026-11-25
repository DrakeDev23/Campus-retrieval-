const ITEMS_STORAGE_KEY = 'itemfinder_found_items_v1';
const ARTIFICIAL_DELAY_MS = 250;

function delay(ms = ARTIFICIAL_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let inMemoryItemsFallback = null;

export const INITIAL_FOUND_CATALOG = [
  {
    id: 'ITM-101',
    title: 'MacBook Air 13" M2',
    category: 'Electronics',
    status: 'In Custody',
    description: 'Space Gray laptop found inside neoprene sleeve on the 2nd floor silent study carrels.',
    foundTime: 'Today, 10:15 AM',
    location: 'Main Library',
    custody: 'Campus Security Hub',
    buttonType: 'claim',
    hiddenIdentifiers: 'Serial #C02FX40AMD6R; subtle dent near MagSafe connector; sticker of terminal prompt inside lid',
    image: null,
  },
  {
    id: 'ITM-102',
    title: 'Sony WH-1000XM4 Headphones',
    category: 'Electronics',
    status: 'In Custody',
    description: 'Black over-ear wireless headphones with original carrying case and auxiliary cable.',
    foundTime: 'Today, 08:40 AM',
    location: 'Student Center',
    custody: 'Locker #04 (Self-Service)',
    buttonType: 'claim',
    hiddenIdentifiers: 'Bluetooth MAC 70:26:05:4F:91:AA; custom silver cable clip; hairline scratch on left swivel cup',
    image: null,
  },
  {
    id: 'ITM-103',
    title: 'Student ID & Keycard Lanyard',
    category: 'IDs & Wallets',
    status: 'Retrieval Authorized',
    description: 'University branded navy lanyard holding magnetic dorm keycard and dining access badge.',
    foundTime: 'Yesterday, 04:20 PM',
    location: 'Science & Tech Quad',
    custody: 'Registrar Front Desk',
    buttonType: 'claim',
    hiddenIdentifiers: 'Card RFID #8912-4029; bronze master locker key attached with blue spiral ring',
    image: null,
  },
  {
    id: 'ITM-104',
    title: 'North Face Recon Backpack',
    category: 'Bags & Backpacks',
    status: 'In Custody',
    description: 'Charcoal gray backpack containing notebooks, binders, and a graphite mechanical pencil set.',
    foundTime: 'Yesterday, 02:15 PM',
    location: 'Gymnasium',
    custody: 'Athletics Equipment Desk',
    buttonType: 'claim',
    hiddenIdentifiers: 'Contains Chem 101 lab manual with initials "J.D." on page 3; orange carabiner on side strap',
    image: null,
  },
  {
    id: 'ITM-105',
    title: 'TI-84 Plus CE Calculator',
    category: 'Books & Stationery',
    status: 'In Custody',
    description: 'White graphing calculator with protective slide cover, found on lecture hall desk.',
    foundTime: 'Nov 09, 11:30 AM',
    location: 'Math & Sciences Bldg',
    custody: 'Locker #09 (Self-Service)',
    buttonType: 'claim',
    hiddenIdentifiers: 'Serial #K-0518E-39201; battery cover has handwritten barcode sticker #99281',
    image: null,
  },
  {
    id: 'ITM-106',
    title: 'Car Key Fob & House Keys',
    category: 'Keys & Fobs',
    status: 'Returned',
    description: 'Honda key fob on brass carabiner with two silver door keys and leather tag.',
    foundTime: 'Nov 08, 05:00 PM',
    location: 'Parking Lot B',
    custody: 'Reunited with Owner',
    buttonType: 'closed',
    hiddenIdentifiers: 'Key ring inscribed with "A.R. 2023"; black rubber emergency house key cover',
    image: null,
  },
  {
    id: 'ITM-107',
    title: 'Navy Varsity Zip-Up Hoodie',
    category: 'Clothing & Apparel',
    status: 'In Custody',
    description: 'Size medium navy hoodie with university crest, left on a cafeteria chair.',
    foundTime: 'Nov 08, 12:10 PM',
    location: 'Student Center',
    custody: 'Dining Hall Front Desk',
    buttonType: 'claim',
    hiddenIdentifiers: 'Laundry tag marked with laundry pen "L-22"; slight fray on left wrist cuff',
    image: null,
  },
  {
    id: 'ITM-108',
    title: 'Stainless Steel Water Bottle',
    category: 'Drinkware',
    status: 'Retrieval Authorized',
    description: 'Matte black insulated bottle with a dented cap and a campus trail-run sticker.',
    foundTime: 'Nov 07, 09:50 AM',
    location: 'Gymnasium',
    custody: 'Athletics Equipment Desk',
    buttonType: 'claim',
    hiddenIdentifiers: 'Under-base engraved "HYDRO 32"; neon green silicone bumper ring on base',
    image: null,
  },
  {
    id: 'ITM-109',
    title: 'Apple iPad Pro 11" with Pencil',
    category: 'Electronics',
    status: 'In Custody',
    description: 'Silver 128GB iPad inside dark green magnetic folio case with 2nd gen Apple Pencil attached.',
    foundTime: 'Nov 07, 04:30 PM',
    location: 'Main Library',
    custody: 'Locker #02 (Self-Service)',
    buttonType: 'claim',
    hiddenIdentifiers: 'Serial #DMPX801AM94K; lockscreen shows Golden Gate bridge photo; pencil has silicone grip',
    image: null,
  },
  {
    id: 'ITM-110',
    title: 'Leather Bi-Fold Wallet (Brown)',
    category: 'IDs & Wallets',
    status: 'In Custody',
    description: 'Distressed brown leather wallet containing cash card and metro transit pass.',
    foundTime: 'Nov 06, 01:15 PM',
    location: 'Student Center',
    custody: 'Campus Security Hub',
    buttonType: 'claim',
    hiddenIdentifiers: 'Fossil brand; contains expired metro transit pass #882194 and 2 silver lucky coins',
    image: null,
  },
  {
    id: 'ITM-111',
    title: 'Ray-Ban Aviator Sunglasses',
    category: 'Clothing & Apparel',
    status: 'In Custody',
    description: 'Gold-frame classic aviator sunglasses in black semi-rigid carrying case.',
    foundTime: 'Nov 06, 11:00 AM',
    location: 'Science & Tech Quad',
    custody: 'Locker #07 (Self-Service)',
    buttonType: 'claim',
    hiddenIdentifiers: 'Model RB3025; small chip on inner left ear arm; micro cleaning cloth stamped with "LensCrafters"',
    image: null,
  },
  {
    id: 'ITM-112',
    title: 'Logitech MX Master 3S Mouse',
    category: 'Electronics',
    status: 'Retrieval Authorized',
    description: 'Ergonomic wireless mouse in pale gray finish, left at computer workstation 14.',
    foundTime: 'Nov 05, 03:45 PM',
    location: 'Main Library',
    custody: 'Registrar Front Desk',
    buttonType: 'claim',
    hiddenIdentifiers: 'P/N: 810-007421; faint yellow mark on thumb scroll wheel; paired with Bolt receiver',
    image: null,
  },
];

export function readItemsStore() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(ITEMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryItemsFallback = parsed;
          return parsed;
        }
      }
    }
  } catch {
  }

  if (inMemoryItemsFallback) return inMemoryItemsFallback;
  inMemoryItemsFallback = INITIAL_FOUND_CATALOG;
  writeItemsStore(INITIAL_FOUND_CATALOG);
  return INITIAL_FOUND_CATALOG;
}

export function writeItemsStore(items) {
  inMemoryItemsFallback = items;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
  }
}

export async function getPublicFoundItems() {
  await delay(200);
  const raw = readItemsStore();
  return raw.map(({ hiddenIdentifiers, ...publicFields }) => ({
    ...publicFields,
    statusColor:
      publicFields.status === 'In Custody'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : publicFields.status === 'Claimed' || publicFields.status === 'Retrieval Authorized'
        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    buttonType: publicFields.status === 'Returned' ? 'closed' : 'claim',
  }));
}
