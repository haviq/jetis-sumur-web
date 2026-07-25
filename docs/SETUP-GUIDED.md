# Setup dipandu Hermes — Jetis Sumur + Google Sheets + Vercel

Kamu **tidak perlu API Key**. Yang dipakai: **Service Account JSON**.

## Langkah 1 — Google Cloud (5–8 menit)

1. Buka https://console.cloud.google.com  
2. Pilih / buat project (mis. `jetis-sumur`)  
3. **APIs & Services → Library** → cari **Google Sheets API** → **Enable**  
4. **IAM & Admin → Service Accounts → Create service account**  
   - Name: `jetis-sheets`  
   - Create and continue → Skip roles (boleh) → Done  
5. Klik service account → tab **Keys → Add key → Create new key → JSON**  
6. File JSON terdownload di laptop (jangan di-share ke chat)

## Langkah 2 — Spreadsheet

1. Buka https://sheets.google.com → **Blank spreadsheet**  
2. Rename: `Jetis Sumur — Pendataan`  
3. Copy **Spreadsheet ID** dari URL:

```
https://docs.google.com/spreadsheets/d/  SPREADSHEET_ID_DI_SINI  /edit
```

4. **Share** (tombol Share):
   - Paste **client_email** dari JSON (bentuk `xxx@yyy.iam.gserviceaccount.com`)
   - Role: **Editor**
   - Uncheck notify (opsional) → Share

## Langkah 3 — Kirim file ke Hermes (pilih 1 cara)

### Cara A (paling mudah di Telegram)
Kirim **file JSON** service account sebagai **dokumen** ke chat ini  
+ kirim teks:  
`SPREADSHEET_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Cara B (upload ke server)
Di VPS / machine Hermes, letakkan file di:

```
/opt/data/jetis-sumur-web/.secrets/sa.json
```

Lalu chat:
```
SA_PATH=/opt/data/jetis-sumur-web/.secrets/sa.json
SPREADSHEET_ID=xxxxxxxx
ADMIN_PIN=pin-rahasia-kamu
```

## Langkah 4 — Hermes eksekusi

Setelah file + spreadsheet ID ada, Hermes akan:

1. `node scripts/setup-sheets.mjs sa.json ID --bootstrap --write-env`  
2. Uji koneksi (token + buka sheet + buat tab)  
3. Kasih nilai siap-tempel Vercel **atau** set via token kalau ada  
4. Verifikasi live: `mode=sheets`

## Langkah 5 — Vercel (kamu klik)

Project **jetis-sumur-web** → Settings → Environment Variables → **Production**:

| Name | Value |
|------|--------|
| `ADMIN_PIN` | PIN kuat (bukan jetis2026) |
| `NEXT_PUBLIC_SITE_URL` | `https://jetis-sumur-web.vercel.app` |
| `SHEETS_SPREADSHEET_ID` | ID spreadsheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | dari JSON |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | dari JSON (`private_key`) |

Lalu **Deployments → Redeploy** (wajib).

---

## Checklist cepat

- [ ] Sheets API enabled  
- [ ] Service account JSON downloaded  
- [ ] Spreadsheet shared ke email SA (Editor)  
- [ ] File JSON + Spreadsheet ID dikirim ke Hermes  
- [ ] Env Vercel diisi + Redeploy  
- [ ] `/ops` login + tambah KK → muncul di sheet  

## Jangan

- Jangan pakai API Key `AIza...` untuk fitur ini  
- Jangan paste private key di chat (kirim **file** saja)  
- Jangan commit JSON ke GitHub  
