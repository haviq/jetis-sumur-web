# Deploy Vercel + Google Sheets — Jetis Sumur

## A. Yang perlu kamu siapkan (kirim ke Hermes)

### 1) Vercel token
1. Buka https://vercel.com/account/tokens  
2. Create → name `hermes-jetis` → scope full account  
3. Copy token (sekali tampil)

Kirim di chat (boleh spoiler):
```
VERCEL_TOKEN=xxxx
ADMIN_PIN=kode-akses-ops-mu
```

### 2) Google Sheets service account
1. https://console.cloud.google.com → project baru `jetis-sumur`  
2. Enable **Google Sheets API**  
3. IAM → Service Accounts → Create → Keys → JSON  
4. Buat spreadsheet kosong di https://sheets.google.com  
5. **Share** spreadsheet ke email service account (Editor)  
6. Kirim:

```
SHEETS_SPREADSHEET_ID=...id dari URL...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...@....iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Atau upload file JSON service account ke server (path), bilang Hermes path-nya.

---

## B. Setelah token masuk — yang Hermes lakukan

```bash
cd /opt/data/jetis-sumur-web
npx vercel link --yes --token $VERCEL_TOKEN
npx vercel env add ADMIN_PIN production
npx vercel env add NEXT_PUBLIC_SITE_URL production
npx vercel env add SHEETS_SPREADSHEET_ID production
npx vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
npx vercel env add GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY production
npx vercel --prod --token $VERCEL_TOKEN
```

Tab Sheets (`kk`, `warga`, `pengajuan`, `meta`) dibuat otomatis saat app pertama kali jalan mode sheets.

---

## C. Manual (tanpa token Hermes)

1. https://vercel.com/new → Import `haviq/jetis-sumur-web`
2. Framework Next.js (auto)
3. Env:
   - `ADMIN_PIN`
   - `NEXT_PUBLIC_SITE_URL` = URL Vercel
   - `SHEETS_*` + `GOOGLE_SERVICE_ACCOUNT_*`
4. Deploy
5. Redeploy setelah set env

Template header CSV ada di `docs/sheets-templates/`.
