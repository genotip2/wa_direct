import { useState } from 'react';
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

  // Fungsi untuk mengosongkan nomor telepon dan pesan sekaligus
  function clearAllFields() {
    setPhoneNumber('');
    setMessage('');
  }

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
    const query = message ? `&text=${encodedMessage}` : '';
    const appUrl = `whatsapp://send?phone=${finalNumber}${query}`;
    const webUrl = `https://wa.me/${finalNumber}${message ? `?text=${encodedMessage}` : ''}`;

    try {
      await Linking.openURL(appUrl);
    } catch (appError) {
      try {
        await Linking.openURL(webUrl);
      } catch (webError) {
        console.error('Gagal membuka WhatsApp:', appError, webError);
        Alert.alert(
          'Tidak dapat membuka WhatsApp',
          'Pastikan WhatsApp sudah terpasang dan koneksi internet tersedia.'
        );
      }
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
          {/* Ikon dan Judul Utama */}
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>💬</Text>
          </View>

          <Text style={styles.title}>WA Direct</Text>
          <Text style={styles.subtitle}>Kirim chat WhatsApp tanpa menyimpan kontak.</Text>

          {/* Form Input Nomor WhatsApp */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor WhatsApp</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(getRawNumber(text))}
                placeholder="Paste atau ketik nomor (08xx / 628xx)"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, styles.inputWithClear]}
                selectionColor={WA_GREEN}
                returnKeyType="next"
              />
              
              {/* Tombol Clear muncul jika nomor ATAU pesan terisi */}
              {(!!phoneNumber || !!message) && (
                <Pressable
                  style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
                  onPress={clearAllFields}
                  hitSlop={8}
                >
                  <Text style={styles.clearText}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* Ruang Tetap untuk Feedback Paste */}
            <View style={styles.feedbackContainer}>
              {!!pasteFeedback && <Text style={styles.feedback}>{pasteFeedback}</Text>}
            </View>
          </View>

          {/* Form Input Pesan */}
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

          {/* Tombol Aksi */}
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

          <Text style={styles.footerText}>Format otomatis: 08xx → 628xx • 8xx → 628xx</Text>
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
    justify: 'flex-start',
    paddingTop: '20%',
    paddingHorizontal: 24,
    paddingBottom: 24,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
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
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 7,
    fontWeight: '700',
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
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
  inputWithClear: {
    paddingRight: 42,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e4e6eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonPressed: {
    opacity: 0.6,
  },
  clearText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  feedbackContainer: {
    height: 20,
    justifyContent: 'center',
    marginTop: 4,
  },
  feedback: {
    color: WA_DARK,
    fontSize: 12,
    fontWeight: '600',
  },
  messageInput: {
    height: 110,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 32,
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
  footerText: {
    marginTop: 16,
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});