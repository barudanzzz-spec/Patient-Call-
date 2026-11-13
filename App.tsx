import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';

type Role = 'Pasien' | 'Penjaga';

type Profile = {
  id: string;
  display_name: string;
  role: Role;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Pasien');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, role')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data as Profile);
      return;
    }

    if (error) {
      console.log('Profile error:', error.message);
      return;
    }

    const user = await supabase.auth.getUser();
    const fallbackName =
      user.data.user?.email?.split('@')[0] || 'Pengguna';

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        display_name: fallbackName,
        role: 'Pasien',
      })
      .select('id, display_name, role')
      .single();

    if (created) setProfile(created as Profile);
    if (insertError) console.log('Create profile:', insertError.message);
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) return;
        setSession(nextSession);

        if (!nextSession) {
          setProfile(null);
        } else {
          setTimeout(() => {
            if (active) loadProfile(nextSession.user.id);
          }, 0);
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Belum lengkap', 'Isi email dan password terlebih dahulu.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password terlalu pendek', 'Gunakan minimal 6 karakter.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      Alert.alert('Nama belum diisi', 'Masukkan nama kamu.');
      return;
    }

    setBusy(true);

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              display_name: name.trim(),
              role,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          await loadProfile(data.session.user.id);
          Alert.alert('Berhasil', 'Akun Patient Call berhasil dibuat.');
        } else {
          Alert.alert(
            'Pendaftaran berhasil',
            'Silakan cek email untuk konfirmasi akun, lalu login.'
          );
          setMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;

        await loadProfile(data.user.id);
        Alert.alert('Berhasil', 'Kamu berhasil login.');
      }
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Gagal keluar', error.message);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#C6283D" />
        <Text style={styles.muted}>Memeriksa akun...</Text>
      </SafeAreaView>
    );
  }

  if (session) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>PATIENT CALL</Text>
            <Text style={styles.tagline}>Teman pasien dan penjaga</Text>
          </View>
          <View style={styles.logo}>
            <Text style={styles.logoText}>PC</Text>
          </View>
        </View>

        <View style={styles.dashboard}>
          <Text style={styles.hello}>Akun berhasil terhubung!</Text>
          <Text style={styles.name}>
            {profile?.display_name || session.user.email}
          </Text>

          <View style={styles.profileCard}>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{session.user.email}</Text>

            <Text style={styles.label}>PERAN</Text>
            <Text style={styles.roleValue}>
              {profile?.role || 'Memuat profil...'}
            </Text>
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Tahap berikutnya</Text>
            <Text style={styles.muted}>
              Sistem pasangan Pasien-Penjaga dan panggilan antarperangkat
              sedang kita siapkan.
            </Text>
          </View>

          <Pressable style={styles.logout} onPress={handleLogout}>
            <Text style={styles.logoutText}>Keluar akun</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.logoLarge}>
            <Text style={styles.logoLargeText}>PC</Text>
          </View>

          <Text style={styles.brandCenter}>PATIENT CALL</Text>
          <Text style={styles.subtitle}>
            Saling terhubung saat menjaga orang tersayang.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {mode === 'login' ? 'Selamat datang' : 'Buat akun baru'}
            </Text>
            <Text style={styles.muted}>
              {mode === 'login'
                ? 'Login untuk melanjutkan.'
                : 'Daftarkan akun Pasien atau Penjaga.'}
            </Text>

            {mode === 'register' && (
              <>
                <Text style={styles.label}>NAMA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nama kamu"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.label}>PILIH PERAN</Text>
                <View style={styles.roleRow}>
                  {(['Pasien', 'Penjaga'] as Role[]).map(item => (
                    <Pressable
                      key={item}
                      onPress={() => setRole(item)}
                      style={[
                        styles.roleButton,
                        role === item && styles.roleSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          role === item && styles.roleSelectedText,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimal 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Pressable
              style={[styles.submit, busy && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'login' ? 'MASUK' : 'DAFTAR SEKARANG'}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.switchMode}
              onPress={() =>
                setMode(mode === 'login' ? 'register' : 'login')
              }
            >
              <Text style={styles.switchText}>
                {mode === 'login'
                  ? 'Belum punya akun? Daftar'
                  : 'Sudah punya akun? Login'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>PATIENT CALL • 1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F8' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F8',
  },
  header: {
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { fontSize: 21, fontWeight: '900', color: '#B51F32' },
  tagline: { color: '#777', fontSize: 12, marginTop: 4 },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#C6283D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFF', fontWeight: '900', fontSize: 17 },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  logoLarge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#C6283D',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoLargeText: { color: '#FFF', fontSize: 27, fontWeight: '900' },
  brandCenter: {
    textAlign: 'center',
    color: '#B51F32',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#777',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 7,
    marginBottom: 25,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 21,
    borderWidth: 1,
    borderColor: '#F0D5D8',
  },
  formTitle: { fontSize: 23, fontWeight: '900', color: '#292929' },
  muted: { color: '#777', fontSize: 13, lineHeight: 20, marginTop: 5 },
  label: {
    color: '#8A3542',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 19,
    marginBottom: 7,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#FFF8F8',
    borderWidth: 1,
    borderColor: '#EBD5D8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#222',
    fontSize: 15,
  },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleButton: {
    flex: 1,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBD5D8',
    alignItems: 'center',
  },
  roleSelected: { backgroundColor: '#C6283D', borderColor: '#C6283D' },
  roleButtonText: { color: '#8A3542', fontWeight: '700' },
  roleSelectedText: { color: '#FFF' },
  submit: {
    backgroundColor: '#C6283D',
    padding: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
  switchMode: { alignItems: 'center', padding: 17 },
  switchText: { color: '#B51F32', fontWeight: '700' },
  footer: {
    color: '#AAA',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 25,
  },
  dashboard: { padding: 22 },
  hello: { fontSize: 23, fontWeight: '900', color: '#292929' },
  name: { fontSize: 17, color: '#B51F32', fontWeight: '800', marginTop: 8 },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#F0D5D8',
  },
  value: { color: '#333', fontSize: 15, fontWeight: '700' },
  roleValue: { color: '#C6283D', fontSize: 17, fontWeight: '900' },
  notice: {
    backgroundColor: '#F8EDEF',
    borderRadius: 16,
    padding: 17,
    marginTop: 18,
  },
  noticeTitle: { fontWeight: '900', color: '#8A3542', fontSize: 15 },
  logout: {
    borderWidth: 1,
    borderColor: '#C6283D',
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
    marginTop: 25,
  },
  logoutText: { color: '#B51F32', fontWeight: '900' },
});
