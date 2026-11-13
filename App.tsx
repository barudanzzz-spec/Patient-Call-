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
