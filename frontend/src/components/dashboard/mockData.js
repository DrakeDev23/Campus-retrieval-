export const INITIAL_STUDENT_PROFILE = {
  fullName: 'Jane G. Doe',
  studentId: '2024-08912',
  course: 'BS Computer Science',
  yearLevel: '3rd Year',
  badge: 'Verified Student',
  email: 'janedoe@gmail.com',
  semester: 'AY 2026–2027 • 1st Semester',
};

export const INITIAL_STATS = [
  {
    id: 'lost-reports',
    title: 'My Lost Reports',
    value: '2',
    highlight: '1 Potential Match Found',
    highlightType: 'warning',
    description: 'Active reports filed across campus',
  },
  {
    id: 'found-reports',
    title: 'My Found Reports',
    value: '1',
    highlight: '1 Verified in Custody',
    highlightType: 'success',
    description: 'Belongings turned in by you',
  },
  {
    id: 'pending-claims',
    title: 'Pending Claims',
    value: '1',
    highlight: 'Stage 3 of 6 • In Progress',
    highlightType: 'warning',
    description: 'Active claim undergoing review',
  },
  {
    id: 'approved-retrieved',
    title: 'Approved / Retrieved',
    value: '3',
    highlight: '100% Successfully Returned',
    highlightType: 'success',
    description: 'Resolved cases & reclaimed items',
  },
];

export const CLAIM_STAGES = [
  { step: 1, label: 'Claim Submitted', desc: 'Initial claim request received' },
  { step: 2, label: 'Under Initial Review', desc: 'Desk staff checking catalog records' },
  { step: 3, label: 'Verification in Progress', desc: 'Matching unique identifiers & proofs' },
  { step: 4, label: 'Awaiting Admin Approval', desc: 'Security officer sign-off' },
  { step: 5, label: 'Approved for Retrieval', desc: 'Ready for locker / desk pickup' },
  { step: 6, label: 'Successfully Retrieved', desc: 'Item reunited with student' },
];

export const INITIAL_ACTIVE_CLAIM = {
  itemName: 'Sony WH-1000XM4 Headphones',
  referenceNo: 'CLM-2026-0841',
  dateSubmitted: 'Nov 22, 2026',
  currentStage: 3,
  status: 'Verification in Progress',
  statusBadge: 'bg-amber-50 text-amber-700 border-amber-200',
  nextAction: 'Present physical student ID and Bluetooth device pairing proof at Locker Station #04 or Central Security Hub.',
  adminNote: 'Admin Desk: Bluetooth MAC address matches our recorded device intake log. Please visit Central Custody Room 102 before Friday 4:30 PM for final handover.',
  custodyLocation: 'Locker #04 (Self-Service Station)',
};

export const INITIAL_LOST_REPORTS = [
  {
    id: 'REP-2026-1049',
    itemName: 'MacBook Air 13" M2',
    category: 'Electronics',
    dateLost: 'Nov 20, 2026',
    locationLost: 'Main Library, 2nd Floor',
    status: 'Potential Match Found',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    hasMatch: true,
    matchedItemTitle: 'Space Gray MacBook Air in custody at Security Hub',
    description: 'Space Gray with subtle scratches near the USB-C port. Fitted in dark gray felt sleeve.',
  },
  {
    id: 'REP-2026-0982',
    itemName: 'TI-84 Plus CE Calculator',
    category: 'Books & Stationery',
    dateLost: 'Nov 18, 2026',
    locationLost: 'Math & Sciences Bldg 102',
    status: 'Active Searching',
    statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    hasMatch: false,
    matchedItemTitle: null,
    description: 'White case with name sticker inside slide cover. Battery was low when misplaced.',
  },
];

export const INITIAL_FOUND_REPORTS = [
  {
    id: 'FND-2026-0422',
    itemName: 'Stainless Steel Water Bottle (Hydro Flask)',
    category: 'Drinkware',
    dateFound: 'Nov 16, 2026',
    locationFound: 'Gymnasium Bleachers',
    custodyFacility: 'Athletics Equipment Desk',
    status: 'Verified in Custody',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Matte black 32oz bottle with minor dent on bottom rim and trail stickers.',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Potential Match Found',
    message: 'A Space Gray MacBook Air matching report REP-2026-1049 was cataloged at Campus Security Hub.',
    timestamp: '15m ago',
    unread: true,
    type: 'match',
  },
  {
    id: 'notif-2',
    title: 'Claim Verification Progress',
    message: 'Your claim CLM-2026-0841 for Sony WH-1000XM4 Headphones has advanced to stage 3: Verification in Progress.',
    timestamp: '2h ago',
    unread: true,
    type: 'claim',
  },
  {
    id: 'notif-3',
    title: 'Claim Approved for Retrieval',
    message: 'Claim CLM-2026-0710 (Navy Student ID Lanyard) has been approved. Present your ID at Registrar Desk to collect.',
    timestamp: '1d ago',
    unread: false,
    type: 'approved',
  },
  {
    id: 'notif-4',
    title: 'Verification Details Requested',
    message: 'Security desk requested serial number clarification for lost calculator report REP-2026-0982.',
    timestamp: '3d ago',
    unread: false,
    type: 'info',
  },
];
