-- Skema awal untuk pairing dan panggilan Patient Call.
-- Terapkan RLS dan kebijakan akses sebelum dipakai dengan data pasien sungguhan.

create table if not exists public.pairs (
  id uuid primary key default gen_random_uuid(),
  pairing_code text unique not null,
  patient_device text,
  caregiver_device text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '12 hours')
);

create table if not exists public.patient_calls (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  call_type text not null,
  status text not null default 'Menunggu',
  created_at timestamptz default now(),
  seen_at timestamptz,
  completed_at timestamptz
);

alter table public.pairs enable row level security;
alter table public.patient_calls enable row level security;

-- Jangan aktifkan akses publik sebelum kebijakan autentikasi dan pairing
-- yang aman dirancang dan diuji.
