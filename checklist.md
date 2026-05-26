# Smoke Test Checklist

## Note From Atalariq

Context/To Ask:

- Apakah bisa local dev tanpa intenernet? Bukannya tetep butuh akses ke localhost alias LAN ya?
  I guess testing offline-usage gk possible
- Gw gk punya Macbook yg punya akses ke XCode, jadi gk bisa smoke test buat versi iOS-nya. Skip.
- Karena udah pakai PUBLIC URL hasil deploy Cloud Run, gw gk bisa nge-debug log message backend.

Good but Not in Checklist:

- Multi-provider Sign In, previously use Email Sign-in, but with Google (same email) it's successfully load the same data.

Good but Not in Checklist:

- Show error when I logout from my Google Account:
  - Error: Failed to fetch energy history from backend
  - Error: Failed to today usage from backend

Need Follow Up:

- Don't Generate Recommendations on first run or if there's no data
- Onboarding/Welcome screen gk jalan waktu sign up pakai Google Account
- Hapus Data Dummy di User Profile, fetch pakai data asli
- Startup lama, splash screen gk tampil
- Insight masih kurang spesifik, dan tidak relevan untuk data awal yg masih sedikit.
  Harusnya lebih jujur, dibanding memberi saran yg general. Be niche!
- Toggle device button masih nge-bug, nggak bisa toggle off, dan tiap dipencet ngirim logke Firestore-nya.
  Efeknya jadi ngirim banyak writes ke Firestore-nya.
- Profile Screen butuh loading beberapa saat, harusnya bisa instant lho!

Maybe hide/temporary remove:

- Remove Signup/in pakai Apple, belum di-setup
- Chatbot feature
- Days/Month, I think udah gak relevan, ganti yg lain
- Update Target

## Preconditions

- [x] Backend terbaru sudah ter-deploy.
- [x] App sudah di-rebuild native setelah update Google Sign-In.
- [x] File `apps/mobile/google-services.json` sudah sesuai Firebase project aktif.
- [x] File `apps/mobile/GoogleService-Info.plist` sudah sesuai Firebase project aktif.
- [x] Env mobile sudah terisi:
  - [x] `EXPO_PUBLIC_API_BASE_URL`
  - [x] `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
  - [x] `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

## Android Smoke Test

- [x] Install fresh Android development build.
- [x] Buka app dan pastikan app launch tanpa crash.
- [x] Masuk lewat Google Sign-In.
- [x] Pastikan yang muncul native Google account chooser, bukan browser OAuth page.
- [x] Pastikan login sukses dan app masuk ke dashboard.
- [x] Pastikan dashboard load tanpa error auth.
- [x] Pastikan device list termuat.
- [x] Tambah atau ubah device, lalu cek perubahan muncul di screen terkait.
- [x] Tambah usage baru saat online.
- [x] Pastikan dashboard dan history ikut ter-refresh.
- [ ] Tutup dan buka ulang app.
- [x] Pastikan session masih tersimpan.
- [ ] Matikan koneksi internet.
- [ ] Tambah usage baru saat offline.
- [ ] Pastikan flow tidak crash dan draft tersimpan lokal.
- [ ] Nyalakan koneksi internet kembali.
- [ ] Pastikan draft tersinkron sekali saja.
- [ ] Pastikan tidak ada duplicate usage record setelah sync.

## iOS Smoke Test

- [ ] Install fresh iOS development build.
- [ ] Buka app dan pastikan app launch tanpa crash.
- [ ] Masuk lewat Google Sign-In.
- [ ] Pastikan yang muncul native Google chooser iOS, bukan browser OAuth page.
- [ ] Pastikan login sukses dan app masuk ke dashboard.
- [ ] Pastikan dashboard load tanpa error auth.
- [ ] Pastikan device list termuat.
- [ ] Tambah usage baru saat online.
- [ ] Pastikan dashboard dan history ikut ter-refresh.
- [ ] Tutup dan buka ulang app.
- [ ] Pastikan session masih tersimpan.
- [ ] Matikan koneksi internet.
- [ ] Tambah usage baru saat offline.
- [ ] Pastikan draft tersimpan lokal tanpa crash.
- [ ] Nyalakan koneksi internet kembali.
- [ ] Pastikan draft tersinkron sekali saja.

## Backend/Auth Validation

- [x] Dari flow app normal, trigger endpoint protected backend.
- [ ] Pastikan backend tidak mengembalikan `Authorization token is required.`
- [ ] Pastikan backend tidak mengembalikan `Authorization token is invalid.`
- [x] Pastikan user hasil Google Sign-In bisa mengakses route yang memang butuh full account.
- [x] Pastikan guest flow tetap bisa dipakai untuk route guest-capable.

## Google Sign-In Validation

- [x] Android package name yang aktif adalah `com.raharinda.carbontracker`.
- [x] iOS bundle identifier yang aktif adalah `com.raharinda.carbontracker`.
- [x] Akun tester sudah masuk OAuth consent screen jika project masih mode Testing.
- [x] Google provider di Firebase Authentication aktif.
- [x] SHA-1 Android debug/release sudah terdaftar di Firebase.

## Regression Checks

- [x] Login email/password masih berfungsi.
- [ ] Continue as Guest masih berfungsi.
- [x] Logout berhasil dan menghapus session.
- [x] Re-login setelah logout tetap berhasil.
- [ ] History screen tidak memunculkan data dobel.
- [x] Dashboard stats tetap konsisten setelah app restart.

## Debug Signals

- [x] Log menunjukkan `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID configured: true`.
- [x] Log menunjukkan `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID configured: true` pada iOS build.
- [x] Log menunjukkan `Google ID token exists: true`.
- [x] Log menunjukkan `Firebase ID token exists: true`.

## Exit Criteria

- [x] Google Sign-In sukses di Android.
- [ ] Google Sign-In sukses di iOS.
- [x] Protected backend requests berhasil setelah login.
- [ ] Offline draft queue sync berhasil tanpa duplicate submission.
- [ ] Tidak ada blocker crash, auth error, atau data inconsistency pada flow utama.
