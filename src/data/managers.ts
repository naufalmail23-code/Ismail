export interface ManagerProfile {
  nip: string;
  name: string;
  title: string;
}

export const REGISTERED_MANAGERS: ManagerProfile[] = [
  { nip: '111711', name: 'ABDUL HAKIM', title: 'DEPUTY STORE MANAGER' },
  { nip: '114802', name: 'ANGGA FARAMOUR PUTRA', title: 'DEPUTY STORE MANAGER' },
  { nip: '166874', name: 'AURELIO ADOLF KOMUNA', title: 'DEPUTY AREA MANAGER' },
  { nip: '193053', name: 'DENIS ANDRIA JAYA', title: 'DEPUTY STORE MANAGER' },
  { nip: '113128', name: 'DWI ARISANDI', title: 'DEPUTY STORE MANAGER' },
  { nip: '094756', name: 'FAHMI UTOMO WIDODO', title: 'DEPUTY STORE MANAGER' },
  { nip: '094628', name: 'IDRUS AL MASYHUR', title: 'DEPUTY STORE MANAGER' },
  { nip: '138977', name: 'MEYLINDA LELIANA BR SARAGIH', title: 'DEPUTY AREA MANAGER' },
  { nip: '096849', name: 'OKY OKTAVIANUS', title: 'DEPUTY AREA MANAGER' },
  { nip: '107797', name: 'ROFIYANDI', title: 'DEPUTY AREA MANAGER' },
  { nip: '137141', name: 'SEPTIAN DWI YOGA', title: 'DEPUTY STORE MANAGER' },
  { nip: '128038', name: 'VIVIN CHRISWARDANI', title: 'HRD' }
];

export function findManagerByNip(inputNip: string): ManagerProfile | undefined {
  const clean = inputNip.trim();
  const cleanWithoutLeadingZero = clean.replace(/^0+/, '');

  return REGISTERED_MANAGERS.find((m) => {
    const mClean = m.nip.trim();
    const mWithoutLeadingZero = mClean.replace(/^0+/, '');
    return mClean === clean || mWithoutLeadingZero === cleanWithoutLeadingZero;
  });
}
