import { StaffRecord, Zone, PhotoSubmission } from '../types';

export const RAW_STAFF_LIST: Array<{ zone: Zone; nip: string; name: string }> = [
  { zone: 'COMMERCIAL ZONE', nip: '94840', name: 'LUKMANUL HAKIM.' },
  { zone: 'COMMERCIAL ZONE', nip: '101172', name: 'RIZKY BUDI PRASTYA' },
  { zone: 'COMMERCIAL ZONE', nip: '101853', name: 'RIKI SUBAGJA' },
  { zone: 'DINING ZONE', nip: '102885', name: 'SUKMA ANDIKA' },
  { zone: 'LIVING ZONE', nip: '103337', name: 'PRIMA MAELANA' },
  { zone: 'LIVING ZONE', nip: '105269', name: 'AHMAD SOBANDI' },
  { zone: 'SLEEPING ZONE', nip: '106202', name: 'PEPI FIRDAUS' },
  { zone: 'COMMERCIAL ZONE', nip: '106399', name: 'PRATAMA SUKARNO PUTRA' },
  { zone: 'LIVING ZONE', nip: '108387', name: 'CHOIRUN NISSA' },
  { zone: 'LIVING ZONE', nip: '110376', name: 'FEBIN EDWANSYAH' },
  { zone: 'COMMERCIAL ZONE', nip: '112669', name: 'DWI APRINA' },
  { zone: 'COMMERCIAL ZONE', nip: '115570', name: 'NOVITA SARI' },
  { zone: 'DINING ZONE', nip: '117452', name: 'DODI SANMARTIN' },
  { zone: 'SLEEPING ZONE', nip: '119738', name: 'NANDA WARIZKA' },
  { zone: 'SLEEPING ZONE', nip: '119861', name: 'ANGKY LESMANA' },
  { zone: 'SLEEPING ZONE', nip: '121591', name: 'YOSEP YUDISTIRA' },
  { zone: 'DINING ZONE', nip: '122727', name: 'RETNO BUDI RIANTO' },
  { zone: 'COMMERCIAL ZONE', nip: '130459', name: 'ADEI VAHLEVIE' },
  { zone: 'DINING ZONE', nip: '133169', name: 'PERDI DWISEPTIAN' },
  { zone: 'LIVING ZONE', nip: '137443', name: 'ULFAN ADITA PRATAMA' },
  { zone: 'COMMERCIAL ZONE', nip: '142106', name: 'FAISAL RAMADHAN' },
  { zone: 'COMMERCIAL ZONE', nip: '143021', name: 'NUKY SEPTIAN CHRISANDY' },
  { zone: 'DINING ZONE', nip: '148068', name: 'ZAM ZAM SALEHUDIN AHMADI' },
  { zone: 'COMMERCIAL ZONE', nip: '154035', name: 'MOCHAMMAD SANWANI' },
  { zone: 'SLEEPING ZONE', nip: '154251', name: 'FITRI SILPANI' },
  { zone: 'SLEEPING ZONE', nip: '160190', name: 'MUHAMMAD CHOIRUL' },
  { zone: 'LIVING ZONE', nip: '160429', name: 'BAYU CAHYO HUTOYO' },
  { zone: 'DINING ZONE', nip: '162284', name: 'YUKI FHILIF SAPUTRA' },
  { zone: 'DINING ZONE', nip: '162604', name: 'RICKY SUBAGJA' },
  { zone: 'LIVING ZONE', nip: '165513', name: 'MOH FARHAN NURRAHMAN' },
  { zone: 'DINING ZONE', nip: '166968', name: 'MOHAMMAD RIZALY FAHMI AFANDI' },
  { zone: 'LIVING ZONE', nip: '168289', name: 'GABRIEL SEBASTIAN JAMES UMBOH' },
  { zone: 'DINING ZONE', nip: '171189', name: 'ABDURAHMAN WAHID' },
  { zone: 'LIVING ZONE', nip: '171706', name: 'DISHA FEBRIANI' },
  { zone: 'LIVING ZONE', nip: '171707', name: 'PUTRI AYU NAIBAHO' },
  { zone: 'LIVING ZONE', nip: '171995', name: 'GALUH DEWI ANJANI' },
  { zone: 'DINING ZONE', nip: '171999', name: 'INDAH LIANA SARI' },
  { zone: 'LIVING ZONE', nip: '172000', name: 'AZRIM ANGKONI' },
  { zone: 'LIVING ZONE', nip: '172644', name: 'SADAM AL FAYED' },
  { zone: 'COMMERCIAL ZONE', nip: '173609', name: 'TOMY PUTRA AGUSTIEN' },
  { zone: 'SLEEPING ZONE', nip: '173763', name: 'FERHANS IQBAL HERDIANSYAH' },
  { zone: 'LIVING ZONE', nip: '174457', name: 'FERA YUNIAR' },
  { zone: 'DINING ZONE', nip: '175001', name: 'FERDIAWAN' },
  { zone: 'DINING ZONE', nip: '175004', name: 'RAFLI ZUL AZHAR' },
  { zone: 'LIVING ZONE', nip: '175495', name: 'TONI HIDAYAT' },
  { zone: 'DINING ZONE', nip: '175496', name: 'FATHAN AZIS' },
  { zone: 'DINING ZONE', nip: '175694', name: 'TIFANI HERAWATI' },
  { zone: 'LIVING ZONE', nip: '175832', name: 'ASRIADI ASGAR' },
  { zone: 'LIVING ZONE', nip: '175833', name: 'AZIZ MIFTAHUL FAUZI' },
  { zone: 'SLEEPING ZONE', nip: '175981', name: 'FITRI RAMAYANTI' },
  { zone: 'DINING ZONE', nip: '176136', name: 'RIDHO GUSTIANTORO' },
  { zone: 'SLEEPING ZONE', nip: '176137', name: 'RAHMAT ADITYA' },
  { zone: 'LIVING ZONE', nip: '176138', name: 'AHMAD FADILA' },
  { zone: 'LIVING ZONE', nip: '176140', name: 'WAHYU PERMANA' },
  { zone: 'LIVING ZONE', nip: '176141', name: 'MUHAMAD YUSUF' },
  { zone: 'LIVING ZONE', nip: '176142', name: 'ISHAM MUSTAFID' },
  { zone: 'LIVING ZONE', nip: '176556', name: 'HERRY YUSWAN' },
  { zone: 'LIVING ZONE', nip: '176646', name: 'RIZKY FADHILLA' },
  { zone: 'COMMERCIAL ZONE', nip: '176649', name: 'PREDIANSYAH' },
  { zone: 'SLEEPING ZONE', nip: '176651', name: 'NIA AULINA' },
  { zone: 'COMMERCIAL ZONE', nip: '176728', name: 'NANDA SETIANA' },
  { zone: 'LIVING ZONE', nip: '176729', name: 'BADRU' },
  { zone: 'SLEEPING ZONE', nip: '176730', name: 'ABDUL AZIS' },
  { zone: 'COMMERCIAL ZONE', nip: '176927', name: 'ALDI' },
  { zone: 'SLEEPING ZONE', nip: '176928', name: 'REPAN' },
  { zone: 'LIVING ZONE', nip: '177063', name: 'NABILAH ADANI' },
  { zone: 'DINING ZONE', nip: '177065', name: 'VANNY ERIYANI' },
  { zone: 'DINING ZONE', nip: '177535', name: 'NUR LISTIANA' },
  { zone: 'LIVING ZONE', nip: '178197', name: 'RYAN YULIANTO' },
  { zone: 'LIVING ZONE', nip: '178232', name: 'ADE FAHRUL MAULANA' },
  { zone: 'DINING ZONE', nip: '179029', name: 'YUDA ADITYA NUGRAHA' },
  { zone: 'DINING ZONE', nip: '179039', name: 'RISSA NURSANTI' },
  { zone: 'SLEEPING ZONE', nip: '179583', name: 'RAMA DHANI' },
  { zone: 'LIVING ZONE', nip: '179589', name: 'ILLA HUMAIROH' },
  { zone: 'LIVING ZONE', nip: '179965', name: 'MUHAMAD AGUNG' },
  { zone: 'LIVING ZONE', nip: '180432', name: 'AGUSTIANSYAH' },
  { zone: 'LIVING ZONE', nip: '180436', name: 'FIKRI MAULANA' },
  { zone: 'DINING ZONE', nip: '181370', name: 'KAMILA INDAH PRATIWI' },
  { zone: 'LIVING ZONE', nip: '181680', name: 'MAHSYA IZDIHAR' },
  { zone: 'LIVING ZONE', nip: '182106', name: 'YOGA MATORIS' },
  { zone: 'SLEEPING ZONE', nip: '182109', name: 'BAGAS PRAYOGA' },
  { zone: 'DINING ZONE', nip: '182110', name: 'HAFIDZ ABDULLAH' },
  { zone: 'LIVING ZONE', nip: '182995', name: 'RICO ARI SAPUTRA' },
  { zone: 'DINING ZONE', nip: '183138', name: 'ALFIAN KRISNA BAYU GP' },
  { zone: 'SLEEPING ZONE', nip: '183303', name: 'ABIL DURAHMAN' },
  { zone: 'LIVING ZONE', nip: '183726', name: 'FAJRI SURYA RAMADHAN' },
  { zone: 'DINING ZONE', nip: '183728', name: 'MUHAMAD DAFFA ALDIAN SYAHPUTRA' },
  { zone: 'SLEEPING ZONE', nip: '183729', name: 'RAFI GENTA RAMADAN' },
  { zone: 'COMMERCIAL ZONE', nip: '183731', name: 'SAEKHONI YAHYA' },
  { zone: 'LIVING ZONE', nip: '184962', name: 'RAHMAT HIDAYAT' },
  { zone: 'LIVING ZONE', nip: '184963', name: 'ADIT KURNIAWAN' },
  { zone: 'DINING ZONE', nip: '185551', name: 'DICKY SETIAWAN' },
  { zone: 'LIVING ZONE', nip: '185701', name: 'DEDI ANGGARA' },
  { zone: 'DINING ZONE', nip: '186905', name: 'MUHAMMAD ZULKARNAIN' },
  { zone: 'LIVING ZONE', nip: '186986', name: 'HERDIANSYAH FARHAN TRI SAPUTRA' },
  { zone: 'LIVING ZONE', nip: '187081', name: 'RONALDO PRATAMA' },
  { zone: 'COMMERCIAL ZONE', nip: '188489', name: 'SUDIARTO AGUS NUR ROHMAN' },
  { zone: 'SLEEPING ZONE', nip: '189501', name: 'MUHAMAD RIPAL' },
  { zone: 'DINING ZONE', nip: '189824', name: 'SARI NOVATIANI' },
  { zone: 'COMMERCIAL ZONE', nip: '190017', name: 'DANIEL BUDI PRAKOSO' },
  { zone: 'LIVING ZONE', nip: '190020', name: 'WAHYU BUKHORI' },
  { zone: 'DINING ZONE', nip: '190793', name: 'ANDRI' },
  { zone: 'SLEEPING ZONE', nip: '191316', name: 'AGUNG PERMADI' },
  { zone: 'COMMERCIAL ZONE', nip: '192219', name: 'ATHALLA NAUFAL AL FARIDZ' },
  { zone: 'DINING ZONE', nip: '192303', name: 'AUDY ALIF PUTRA' },
  { zone: 'LIVING ZONE', nip: '192340', name: 'SALSA BILAHNURYUDA' },
  { zone: 'LIVING ZONE', nip: '192426', name: 'RYAN TRI PRASTYO' },
  { zone: 'SLEEPING ZONE', nip: '192427', name: 'PARHAN ANDRIAN' },
  { zone: 'COMMERCIAL ZONE', nip: '192992', name: 'ILYASA ALIFANSYACH' },
  { zone: 'SLEEPING ZONE', nip: '192993', name: 'FAHREZA NUGROHO' },
  { zone: 'LIVING ZONE', nip: '193309', name: 'WILFRIDA DWI APRIANA TURNIP' },
  { zone: 'LIVING ZONE', nip: '193310', name: 'RIFKI JULIAN' },
  { zone: 'SLEEPING ZONE', nip: '193312', name: 'NAZWA SAFIRA' },
  { zone: 'COMMERCIAL ZONE', nip: '193455', name: 'MAULANA MARIS' },
  { zone: 'SLEEPING ZONE', nip: '193686', name: 'SELVIA WULANDARI' },
  { zone: 'DINING ZONE', nip: '193688', name: 'RUDI TRESNA' },
  { zone: 'DINING ZONE', nip: '194067', name: 'LUFITA RAMADHANY ZULKIFLY' },
  { zone: 'DINING ZONE', nip: '194353', name: 'INTAN AYU LARASATI' },
  { zone: 'SLEEPING ZONE', nip: '194644', name: 'GILANG RAMADHAN' },
  { zone: 'DINING ZONE', nip: '194645', name: 'DEWI FEBRIANI' },
  { zone: 'SLEEPING ZONE', nip: '194646', name: 'ADITYA KUSUMA YUDISTIRA' },
  { zone: 'DINING ZONE', nip: '194849', name: 'AFGAN IBNU AZAIDAN' },
  { zone: 'COMMERCIAL ZONE', nip: '194974', name: 'DANIEL FEBRIAN' },
  { zone: 'LIVING ZONE', nip: '194975', name: 'DIVA NURFAUZIAH' },
  { zone: 'DINING ZONE', nip: '194976', name: 'SYAMSUL HIBATULLAH' },
  { zone: 'COMMERCIAL ZONE', nip: '195002', name: 'DESTA PUJA DINATA' },
  { zone: 'DINING ZONE', nip: '195142', name: 'GANIS MAHARDIKA' },
  { zone: 'LIVING ZONE', nip: '195587', name: 'NUR ASARO SYAMSAH' },
  { zone: 'COMMERCIAL ZONE', nip: '195739', name: 'DIKI WAHYUDI' },
  { zone: 'DINING ZONE', nip: '195855', name: 'BAGUS PRAKOSO' },
  { zone: 'DINING ZONE', nip: '197421', name: 'JESSICA MAHARANI' },
  { zone: 'COMMERCIAL ZONE', nip: '197422', name: 'ALYA TYA SAMANTA' }
];

// Helper to generate simulated SVG photo representing retail checkpoint with Informa watermark
export function createMockPhotoSvg(label: string, nip: string, name: string, zone: string, time: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ea580c" />
        <stop offset="100%" stop-color="#c2410c" />
      </linearGradient>
    </defs>
    <!-- Background representing store floor view -->
    <rect width="600" height="450" fill="url(#grad)" />
    <!-- Floor grid lines -->
    <path d="M0 340 L600 340 M100 340 L160 450 M300 340 L300 450 M500 340 L440 450" stroke="#334155" stroke-width="2" />
    <!-- Informa Display Silhouette -->
    <rect x="70" y="160" width="180" height="130" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <rect x="85" y="195" width="150" height="60" rx="4" fill="#334155" />
    <circle cx="160" cy="180" r="14" fill="#ea580c" opacity="0.8" />
    
    <rect x="340" y="140" width="190" height="150" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <rect x="360" y="210" width="150" height="60" rx="4" fill="#334155" />
    <path d="M 435 155 L 475 200 L 395 200 Z" fill="#64748b" />

    <!-- Center Badge Label -->
    <rect x="180" y="50" width="240" height="36" rx="18" fill="url(#badge)" />
    <text x="300" y="73" fill="#ffffff" font-family="sans-serif" font-weight="700" font-size="14" text-anchor="middle">
      ${label.toUpperCase()}
    </text>

    <!-- Watermark Stamp Overlay -->
    <rect x="20" y="325" width="560" height="105" rx="8" fill="rgba(0, 0, 0, 0.75)" stroke="#ea580c" stroke-width="1.5" />
    
    <text x="40" y="352" fill="#ea580c" font-family="sans-serif" font-weight="800" font-size="14">
      [INFORMA ALAM SUTERA - READY TO SELL]
    </text>
    <text x="40" y="375" fill="#f8fafc" font-family="sans-serif" font-weight="600" font-size="13">
      NIP: ${nip} - ${name}
    </text>
    <text x="40" y="396" fill="#94a3b8" font-family="sans-serif" font-weight="500" font-size="12">
      ZONA: ${zone} | VERIFIKASI: LIVE CAMERA ONLY
    </text>
    <text x="40" y="416" fill="#38bdf8" font-family="sans-serif" font-weight="600" font-size="12">
      TIMESTAMP: ${time} WIB
    </text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Prepopulate initial records based on the user's spreadsheet state
export function getInitialStaffData(): Record<string, StaffRecord> {
  const result: Record<string, StaffRecord> = {};
  const todayStr = '2026-10-21';

  RAW_STAFF_LIST.forEach((staff) => {
    const submissions: Record<string, PhotoSubmission[]> = {};
    let points = 0;

    // Check spreadsheet baseline for special staff
    if (staff.nip === '94840') {
      // LUKMANUL HAKIM (82% complete in spreadsheet)
      const itemsDone = [
        'tools_prep',
        'grooming',
        'dept_prep',
        'wa_blast',
        'gateway',
        'buddy',
        'mc_exhibition',
        'capsule_exhibition',
        'kells_exhibition'
      ];
      itemsDone.forEach((itemId, idx) => {
        const timeHour = 8 + Math.floor(idx / 2);
        const timeMin = 10 + (idx * 5) % 50;
        const timeStr = `${String(timeHour).padStart(2, '0')}:${String(timeMin).padStart(2, '0')}`;
        submissions[itemId] = [
          {
            id: `sub_${staff.nip}_${itemId}_0`,
            checklistId: itemId as any,
            nip: staff.nip,
            staffName: staff.name,
            zone: staff.zone,
            timestamp: `${todayStr}T${timeStr}:00+07:00`,
            timeString: `${timeStr} WIB`,
            dateString: '21 Okt 2026',
            photoUrl: createMockPhotoSvg(itemId.replace('_', ' '), staff.nip, staff.name, staff.zone, `${todayStr} ${timeStr}:00`),
            isFromGallery: itemId === 'wa_blast',
            watermarkText: `[READY TO SELL - INFORMA ALAM SUTERA] ${staff.nip} - ${timeStr} WIB`,
            notes: itemId === 'buddy' ? 'Customer bpk. Hendra tertarik sofa sectional Lorenzo' : undefined,
            customerName: itemId === 'buddy' ? 'Bpk. Hendra & Ibu Siska' : undefined,
            productInterest: itemId === 'buddy' ? 'Sectional Sofa Lorenzo Brown' : undefined
          }
        ];
        points += itemId === 'buddy' ? 25 : 15;
      });
      // Add extra buddy for Lukmanul Hakim
      submissions['buddy'].push({
        id: `sub_${staff.nip}_buddy_1`,
        checklistId: 'buddy',
        nip: staff.nip,
        staffName: staff.name,
        zone: staff.zone,
        timestamp: `${todayStr}T13:40:00+07:00`,
        timeString: '13:40 WIB',
        dateString: '21 Okt 2026',
        photoUrl: createMockPhotoSvg('Buddy Customer 2', staff.nip, staff.name, staff.zone, `${todayStr} 13:40:00`),
        isFromGallery: false,
        watermarkText: `[READY TO SELL - INFORMA ALAM SUTERA] ${staff.nip} - 13:40 WIB`,
        notes: 'Konsultasi meja makan marble 6 kursi dengan Ibu Ratna',
        customerName: 'Ibu Ratna',
        productInterest: 'Marble Dining Table 6-Seater'
      });
      points += 25;

      // Add a closing record
      submissions['closing'] = [
        {
          id: `sub_${staff.nip}_closing_0`,
          checklistId: 'closing',
          nip: staff.nip,
          staffName: staff.name,
          zone: staff.zone,
          timestamp: `${todayStr}T14:15:00+07:00`,
          timeString: '14:15 WIB',
          dateString: '21 Okt 2026',
          photoUrl: createMockPhotoSvg('Closing SPK', staff.nip, staff.name, staff.zone, `${todayStr} 14:15:00`),
          isFromGallery: false,
          watermarkText: `[READY TO SELL - INFORMA ALAM SUTERA] ${staff.nip} - 14:15 WIB`,
          spkNumber: 'SPK-ALSUT-2026-0891',
          nominal: 18500000,
          customerName: 'Bpk. Hendra',
          notes: 'Closing Sofa Sectional Lorenzo + Leather Care Kit'
        }
      ];
      points += 50;

    } else if (staff.nip === '110376') {
      // FEBIN EDWANSYAH (44% in spreadsheet)
      const itemsDone = ['buddy', 'mc_exhibition', 'capsule_exhibition', 'kells_exhibition'];
      itemsDone.forEach((itemId, idx) => {
        const timeStr = `09:${20 + idx * 10}`;
        submissions[itemId] = [
          {
            id: `sub_${staff.nip}_${itemId}_0`,
            checklistId: itemId as any,
            nip: staff.nip,
            staffName: staff.name,
            zone: staff.zone,
            timestamp: `${todayStr}T${timeStr}:00+07:00`,
            timeString: `${timeStr} WIB`,
            dateString: '21 Okt 2026',
            photoUrl: createMockPhotoSvg(itemId.replace('_', ' '), staff.nip, staff.name, staff.zone, `${todayStr} ${timeStr}:00`),
            isFromGallery: false,
            watermarkText: `[READY TO SELL - INFORMA ALAM SUTERA] ${staff.nip} - ${timeStr} WIB`,
            customerName: itemId === 'buddy' ? 'Ibu Maya (Kavling Serpong)' : undefined
          }
        ];
        points += itemId === 'buddy' ? 25 : 15;
      });
    } else if (staff.nip === '101853') {
      // RIKI SUBAGJA (44% in spreadsheet)
      const itemsDone = ['mc_exhibition', 'capsule_exhibition', 'kells_exhibition'];
      itemsDone.forEach((itemId, idx) => {
        const timeStr = `09:${15 + idx * 8}`;
        submissions[itemId] = [
          {
            id: `sub_${staff.nip}_${itemId}_0`,
            checklistId: itemId as any,
            nip: staff.nip,
            staffName: staff.name,
            zone: staff.zone,
            timestamp: `${todayStr}T${timeStr}:00+07:00`,
            timeString: `${timeStr} WIB`,
            dateString: '21 Okt 2026',
            photoUrl: createMockPhotoSvg(itemId.replace('_', ' '), staff.nip, staff.name, staff.zone, `${todayStr} ${timeStr}:00`),
            isFromGallery: false,
            watermarkText: `[READY TO SELL - INFORMA ALAM SUTERA] ${staff.nip} - ${timeStr} WIB`
          }
        ];
        points += 15;
      });
    } else if (staff.nip === '102885') {
      // SUKMA ANDIKA
      const itemsDone = ['kells_exhibition'];
      itemsDone.forEach((itemId, idx) => {
        const timeStr = `09:${30 + idx * 10}`;
        submissions[itemId] = [
          {
            id: `sub_${staff.nip}_${itemId}_0`,
            checklistId: itemId as any,
            nip: staff.nip,
            staffName: staff.name,
            zone: staff.zone,
            timestamp: `${todayStr}T${timeStr}:00+07:00`,
            timeString: `${timeStr} WIB`,
            dateString: '21 Okt 2026',
            photoUrl: createMockPhotoSvg(itemId.replace('_', ' '), staff.nip, staff.name, staff.zone, `${todayStr} ${timeStr}:00`),
            isFromGallery: false,
            watermarkText: `[READY TO SELL - INFORMA ALAM SUTERA] ${staff.nip} - ${timeStr} WIB`
          }
        ];
        points += 15;
      });
    } else if (staff.nip === '101172' || staff.nip === '105269') {
      const itemId = 'kells_exhibition';
      submissions[itemId] = [
        {
          id: `sub_${staff.nip}_${itemId}_0`,
          checklistId: itemId as any,
          nip: staff.nip,
          staffName: staff.name,
          zone: staff.zone,
          timestamp: `${todayStr}T08:50:00+07:00`,
          timeString: '08:50 WIB',
          dateString: '21 Okt 2026',
          photoUrl: createMockPhotoSvg(itemId.replace('_', ' '), staff.nip, staff.name, staff.zone, `${todayStr} 08:50:00`),
          isFromGallery: false,
          watermarkText: `[READY TO SELL - INFORMA ALAM SUTERA] ${staff.nip} - 08:50 WIB`
        }
      ];
      points += 15;
    }

    result[staff.nip] = {
      nip: staff.nip,
      name: staff.name,
      zone: staff.zone,
      submissions,
      points,
      streakDays: staff.nip === '94840' ? 8 : staff.nip === '110376' ? 4 : 1,
      streakActive: staff.nip === '94840',
      lastActive: Object.keys(submissions).length > 0 ? 'Hari ini' : 'Belum aktif',
      verifiedByManager: staff.nip === '94840'
    };
  });

  return result;
}
