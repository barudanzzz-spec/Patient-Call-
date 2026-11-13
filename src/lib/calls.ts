export type CallType =
  | 'Bangunkan penjaga'
  | 'Minta air minum'
  | 'Minta bantuan ke toilet'
  | 'Bantu duduk'
  | 'Panggilan lainnya';

export type PatientCall = {
  id: string;
  type: CallType;
  createdAt: string;
  status: 'Menunggu' | 'Dilihat' | 'Selesai';
};

export const CALL_OPTIONS: CallType[] = [
  'Bangunkan penjaga',
  'Minta air minum',
  'Minta bantuan ke toilet',
  'Bantu duduk',
  'Panggilan lainnya'
];
