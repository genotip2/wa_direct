# WA Direct – Expo + EAS

Aplikasi React Native/Expo dari versi HTML "WA Direct".

## Fitur

- Input nomor WhatsApp Indonesia: `08xx`, `8xx`, atau `628xx`.
- Semua karakter non-angka dibersihkan otomatis.
- Tombol **Paste** membaca clipboard perangkat dengan `expo-clipboard`.
- Tombol **Kirim WA** membuka URL `https://wa.me/<nomor>`.
- Pesan opsional otomatis di-encode ke query parameter `text`.
- Tampilan responsif untuk Android/iOS dan dapat dijalankan di Expo Go.

## Menjalankan lokal

Pastikan Node.js sesuai kebutuhan Expo SDK 57 (minimal Node 22.13.x), lalu:

```bash
npm install
npx expo start
```

Untuk Android:

```bash
npm run android
```

Untuk iOS:

```bash
npm run ios
```

Untuk web:

```bash
npm run web
```

## Build EAS

Login terlebih dahulu:

```bash
eas login
```

Build APK yang bisa langsung dipasang di Android:

```bash
eas build --platform android --profile preview
```

Build production Android AAB:

```bash
eas build --platform android --profile production
```

Build production iOS:

```bash
eas build --platform ios --profile production
```

Build keduanya:

```bash
eas build --platform all --profile production
```

`eas.json` sudah berisi profile `development`, `preview`, dan `production`. EAS akan menangani kredensial signing sesuai akun/proyek EAS.

## Catatan nomor

Normalisasi yang dipakai:

- `081234567890` → `6281234567890`
- `81234567890` → `6281234567890`
- `6281234567890` → tetap `6281234567890`

Validasi UI mensyaratkan nomor akhir berupa pola nomor Indonesia `628...`.
