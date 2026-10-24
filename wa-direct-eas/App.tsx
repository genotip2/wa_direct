import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

const WA_GREEN = '#25D366';
const WA_DARK = '#128C7E';
const BG_COLOR = '#f0f2f5';

function getRawNumber(value: string) {
  return value.replace(/\D/g, '');
}

function formatNumberForWA(rawNumber: string) {
  const num = getRawNumber(rawNumber);

  if (num.startsWith('62')) return num;
  if (num.startsWith('0')) return `62${num.substring(1)}`;
  if (num.startsWith('8')) return `62${num}`;

  return num;
}

function isPlausibleIndonesianWaNumber(number: string) {
  return /^628\d{7,12}$/.test(number);
}

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [pasteFeedback, setPasteFeedback] = useState('');

  const normalizedNumber = useMemo(
    () => formatNumberForWA(phoneNumber),
    [phoneNumber]
  );

  async function pasteFromClipboard() {
    try {
      const text = await Clipboard.getStringAsync();
      const cleanText = getRawNumber(text);

      if (!cleanText) {
        Alert.alert('Clipboard kosong', 'Clipboard tidak berisi nomor yang bisa digunakan.');
        return;
      }

      setPhoneNumber(cleanText);
      setPasteFeedback('Nomor berhasil ditempel');
      setTimeout(() => setPasteFeedback(''), 1200);
    } catch (error) {
      console.error('Gagal paste:', error);
      Alert.alert(
        'Tidak dapat mengakses clipboard',
        'Pastikan izin clipboard tersedia lalu coba lagi.'
      );
    }
  }

  async function openWhatsApp() {
    const rawNumber = getRawNumber(phoneNumber);

    if (!rawNumber) {
      Alert.alert('Nomor belum diisi', 'Mohon masukkan atau paste nomor WhatsApp.');
      return;
    }

    const finalNumber = formatNumberForWA(rawNumber);

    if (!isPlausibleIndonesianWaNumber(finalNumber)) {
      Alert.alert(
        'Nomor tidak valid',
        'Gunakan nomor Indonesia seperti 08xxxxxxxxxx, 8xxxxxxxxxx, atau 628xxxxxxxxxx.'
      );
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${finalNumber}${message ? `?text=${encodedMessage}` : ''}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Tidak dapat membuka WhatsApp', 'Perangkat tidak dapat membuka tautan WhatsApp.');
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error('Gagal membuka WhatsApp:', error);
      Alert.alert('Gagal membuka WhatsApp', 'Silakan pastikan browser atau WhatsApp tersedia.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>💬</Text>
            </View>

            <Text style={styles.title}>WA Direct</Text>
            <Text style={styles.subtitle}>Buka chat WhatsApp tanpa menyimpan kontak.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor WhatsApp</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(getRawNumber(text))}
                placeholder="Paste atau ketik nomor (08xx / 628xx)"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                selectionColor={WA_GREEN}
                returnKeyType="next"
              />
              {!!pasteFeedback && <Text style={styles.feedback}>{pasteFeedback}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pesan (Opsional)</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Halo, saya ingin bertanya..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.messageInput]}
                selectionColor={WA_GREEN}
              />
            </View>

            <View style={styles.btnGroup}>
              <Pressable
                style={({ pressed }) => [styles.button, styles.btnPaste, pressed && styles.pressed]}
                onPress={pasteFromClipboard}
              >
                <Text style={styles.btnPasteText}>Paste</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.button, styles.btnSend, pressed && styles.pressed]}
                onPress={openWhatsApp}
              >
                <Text style={styles.btnSendText}>Kirim WA</Text>
              </Pressable>
            </View>

            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Nomor tujuan</Text>
              <Text style={styles.previewNumber} numberOfLines={1}>
                {normalizedNumber || '—'}
              </Text>
            </View>

            <Text style={styles.footerText}>Format otomatis: 08xx → 628xx • 8xx → 628xx</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  iconCircle: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eafbf0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 38,
  },
  title: {
    color: '#333',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#777',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 7,
    fontWeight: '700',
  },
  input: {
    width: '100%',
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 9,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 110,
  },
  feedback: {
    marginTop: 6,
    color: WA_DARK,
    fontSize: 12,
    fontWeight: '600',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  button: {
    flex: 1,
    minHeight: 50,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSend: {
    backgroundColor: WA_GREEN,
  },
  btnPaste: {
    backgroundColor: '#e4e6eb',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  btnSendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  btnPasteText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '800',
  },
  previewBox: {
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 7,
  },
  previewLabel: {
    color: '#777',
    fontSize: 11,
    marginBottom: 3,
  },
  previewNumber: {
    color: '#444',
    fontSize: 13,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 12,
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
