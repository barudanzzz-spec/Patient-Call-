#!/data/data/com.termux/files/usr/bin/bash
set -e

mkdir -p src/components src/lib supabase assets

cat > package.json <<'JSON'
{
  "name": "patient-call",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "build:preview": "eas build --platform android --profile preview"
  },
  "dependencies": {
    "expo": "~54.0.0",
    "expo-status-bar": "~3.0.9",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "expo-constants": "~18.0.10"
  },
  "devDependencies": {
    "@types/react": "~19.1.10",
    "typescript": "~5.9.2"
  }
}
JSON

cat > app.json <<'JSON'
{
  "expo": {
    "name": "Patient Call",
    "slug": "patient-call",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "android": {
      "package": "com.danz.patientcall",
      "versionCode": 1,
      "permissions": [
        "VIBRATE",
        "WAKE_LOCK",
        "POST_NOTIFICATIONS"
      ]
    },
    "ios": {
      "bundleIdentifier": "com.danz.patientcall"
    }
  }
}
JSON

cat > eas.json <<'JSON'
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
JSON

cat > tsconfig.json <<'JSON'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
JSON

cat > index.js <<'JS'
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
JS

cat > src/lib/calls.ts <<'TS'
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
TS

cat > src/lib/pairing.ts <<'TS'
export function createPairingCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
TS

cat > src/components/CallButton.tsx <<'TSX'
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function CallButton({
  title,
  subtitle,
  onPress,
  disabled
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0D5D8',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  title: { color: '#B51F32', fontSize: 17, fontWeight: '800' },
  subtitle: { color: '#777777', fontSize: 13, marginTop: 5 }
});
TSX

cat > App.tsx <<'TSX'
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  StyleSheet
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CallButton from './src/components/CallButton';
import { CALL_OPTIONS, CallType, PatientCall } from './src/lib/calls';
import { createPairingCode } from './src/lib/pairing';

type Role = 'Pasien' | 'Penjaga';

export default function App() {
  const [role, setRole] = useState<Role>('Pasien');
  const [quickCall, setQuickCall] = useState(false);
  const [pairCode] = useState(createPairingCode);
  const [connected, setConnected] = useState(false);
  const [calls, setCalls] = useState<PatientCall[]>([]);

  function sendCall(type: CallType) {
    const newCall: PatientCall = {
      id: String(Date.now()),
      type,
      createdAt: new Date().toLocaleTimeString('id-ID'),
      status: 'Menunggu'
    };

    setCalls(current => [newCall, ...current]);
    Alert.alert('Panggilan dibuat', `${type}\n\nIni masih mode demo pada satu perangkat.`);
  }

  function markSeen(id: string) {
    setCalls(current =>
      current.map(call =>
        call.id === id ? { ...call, status: 'Dilihat' } : call
      )
    );
  }

  function finishCall(id: string) {
    setCalls(current =>
      current.map(call =>
        call.id === id ? { ...call, status: 'Selesai' } : call
      )
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>PATIENT CALL</Text>
          <Text style={styles.tagline}>Teman komunikasi pasien dan penjaga</Text>
        </View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>PC</Text>
        </View>
      </View>

      <View style={styles.roleBar}>
        {(['Pasien', 'Penjaga'] as Role[]).map(item => (
          <Pressable
            key={item}
            onPress={() => setRole(item)}
            style={[styles.roleButton, role === item && styles.roleActive]}
          >
            <Text style={[styles.roleText, role === item && styles.roleTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.connectionCard}>
          <Text style={styles.sectionTitle}>Hubungkan perangkat</Text>
          <Text style={styles.muted}>
            Kode demo perangkat ini. Sistem pasangan lintas HP memerlukan backend.
          </Text>
          <Text style={styles.code}>{pairCode}</Text>
          <Pressable
            style={styles.outlineButton}
            onPress={() => {
              setConnected(!connected);
              Alert.alert(
                'Mode demo',
                'Status ini hanya simulasi lokal, belum menghubungkan HP lain.'
              );
            }}
          >
            <Text style={styles.outlineText}>
              {connected ? 'Simulasi terhubung' : 'Simulasikan koneksi'}
            </Text>
          </Pressable>
        </View>

        {role === 'Pasien' ? (
          <>
            <Text style={styles.heading}>Butuh bantuan?</Text>
            <Text style={styles.muted}>Pilih tombol untuk memberi tahu penjaga.</Text>
            {CALL_OPTIONS.map((option, index) => (
              <CallButton
                key={option}
                title={option}
                subtitle={
                  [
                    'Bunyikan panggilan untuk membangunkan penjaga',
                    'Beri tahu penjaga bahwa kamu membutuhkan air',
                    'Minta penjaga datang membantu',
                    'Minta bantuan untuk mengubah posisi duduk',
                    'Sampaikan kebutuhan lainnya'
                  ][index]
                }
                onPress={() => sendCall(option)}
              />
            ))}
          </>
        ) : (
          <>
            <Text style={styles.heading}>Panel penjaga</Text>
            <Text style={styles.muted}>
              Permintaan pasien akan tampil di bagian ini setelah sistem online diaktifkan.
            </Text>
            <View style={styles.settingCard}>
              <Text style={styles.settingTitle}>Quick Call Volume</Text>
              <Text style={styles.muted}>
                Pengaturan pintasan tombol volume bawah (perlu modul native Android).
              </Text>
              <Switch
                value={quickCall}
                onValueChange={setQuickCall}
                trackColor={{ false: '#BBBBBB', true: '#D52B40' }}
              />
              <Text style={styles.statusText}>
                {quickCall ? 'Pengaturan ON' : 'Pengaturan OFF'}
              </Text>
            </View>
          </>
        )}

        <Text style={styles.heading}>Riwayat panggilan</Text>
        {calls.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>Belum ada panggilan pada perangkat ini.</Text>
          </View>
        ) : (
          calls.map(call => (
            <View style={styles.historyCard} key={call.id}>
              <Text style={styles.historyTitle}>{call.type}</Text>
              <Text style={styles.muted}>{call.createdAt} · {call.status}</Text>
              {role === 'Penjaga' && call.status === 'Menunggu' && (
                <Pressable onPress={() => markSeen(call.id)} style={styles.actionButton}>
                  <Text style={styles.actionText}>Sudah melihat</Text>
                </Pressable>
              )}
              {role === 'Penjaga' && call.status !== 'Selesai' && (
                <Pressable onPress={() => finishCall(call.id)} style={styles.outlineButton}>
                  <Text style={styles.outlineText}>Selesaikan</Text>
                </Pressable>
              )}
            </View>
          ))
        )}
        <Text style={styles.footer}>
          Patient Call • Versi prototipe
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F8' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: { fontSize: 21, fontWeight: '900', color: '#B51F32', letterSpacing: 1 },
  tagline: { color: '#777', fontSize: 12, marginTop: 4 },
  logo: {
    width: 46, height: 46, borderRadius: 15,
    backgroundColor: '#C6283D', alignItems: 'center', justifyContent: 'center'
  },
  logoText: { color: '#FFF', fontWeight: '900', fontSize: 17 },
  roleBar: {
    flexDirection: 'row', marginHorizontal: 20, padding: 5,
    backgroundColor: '#F3E5E7', borderRadius: 14
  },
  roleButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  roleActive: { backgroundColor: '#C6283D' },
  roleText: { color: '#8A3542', fontWeight: '700' },
  roleTextActive: { color: '#FFF' },
  content: { padding: 20, paddingBottom: 40 },
  connectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#F0D5D8', marginBottom: 24
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  muted: { color: '#777', fontSize: 13, lineHeight: 19, marginTop: 5 },
  code: {
    fontSize: 32, fontWeight: '900', letterSpacing: 8,
    color: '#C6283D', textAlign: 'center', marginVertical: 18
  },
  outlineButton: {
    borderWidth: 1, borderColor: '#C6283D', borderRadius: 12,
    padding: 12, alignItems: 'center', marginTop: 10
  },
  outlineText: { color: '#B51F32', fontWeight: '800' },
  heading: { fontSize: 20, color: '#292929', fontWeight: '900', marginTop: 12 },
  settingCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 18,
    marginTop: 15, borderWidth: 1, borderColor: '#F0D5D8'
  },
  settingTitle: { color: '#333', fontSize: 17, fontWeight: '800' },
  statusText: { color: '#B51F32', fontWeight: '700', marginTop: 8 },
  empty: { padding: 18, backgroundColor: '#FFF', borderRadius: 16, marginTop: 12 },
  historyCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    marginTop: 12, borderWidth: 1, borderColor: '#F0D5D8'
  },
  historyTitle: { color: '#333', fontWeight: '800', fontSize: 16 },
  actionButton: {
    backgroundColor: '#C6283D', padding: 12, borderRadius: 12,
    alignItems: 'center', marginTop: 12
  },
  actionText: { color: '#FFF', fontWeight: '800' },
  footer: { textAlign: 'center', color: '#999', fontSize: 11, marginTop: 30 }
});
TSX

cat > supabase/schema.sql <<'SQL'
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
SQL

cat > .gitignore <<'TXT'
node_modules/
.expo/
dist/
web-build/
.env
.env.*
*.jks
*.keystore
TXT

cat > README.md <<'MD'
# Patient Call

Aplikasi komunikasi sederhana antara pasien dan orang yang menjaganya.

## Fitur prototipe
- Mode Pasien dan Penjaga.
- Tombol kategori kebutuhan.
- Kode pairing demo.
- Riwayat panggilan lokal.
- Pengaturan Quick Call Volume.

## Status penting
Versi ini adalah prototipe antarmuka lokal. Tombol panggilan belum mengirim
notifikasi ke perangkat lain. Kode pairing masih berupa demo lokal.

Agar dua HP benar-benar terhubung, perlu integrasi backend Supabase,
autentikasi/pairing aman, realtime, serta notifikasi push.

Quick Call Volume belum menangkap tombol volume fisik. Fitur itu memerlukan
modul native Android khusus dan pengujian pada perangkat nyata. iOS tidak
menyediakan pintasan volume global yang setara.

Jangan gunakan prototipe ini sebagai pengganti bel rumah sakit atau layanan
darurat. Untuk kebutuhan medis mendesak, panggil petugas rumah sakit secara
langsung.

## Persiapan
1. Instal Node.js dan npm.
2. Jalankan `npm install`.
3. Jalankan `npx expo start`.

## Build Android
Setelah konfigurasi EAS dan akun Expo siap:
`eas build --platform android --profile preview`
MD

echo "=================================="
echo "Patient Call: file proyek dibuat!"
echo "=================================="
find . -maxdepth 3 -type f | sort
