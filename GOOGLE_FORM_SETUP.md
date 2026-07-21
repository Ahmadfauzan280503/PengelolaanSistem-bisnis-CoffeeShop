# Panduan Menghubungkan Google Form ke Dashboard

Ikuti langkah-langkah di bawah ini agar data yang diisi oleh karyawan di Google Form secara otomatis masuk ke dashboard Anda.

### 1. Buka Editor Script di Google Form Anda
1. Buka Google Form Anda: [https://forms.gle/yvE3v37yUDe5BUFEA](https://forms.gle/yvE3v37yUDe5BUFEA).
2. Klik ikon titik tiga (More) di pojok kanan atas.
3. Pilih **Script editor**.

### 2. Tempel Kode Script Berikut
Hapus semua kode yang ada di editor dan tempelkan kode di bawah ini:

```javascript
function onFormSubmit(e) {
  var url = "http://localhost:3000/api/webhook/google-form"; 
  
  var itemResponses = e.response.getItemResponses();
  var payload = {
    "secret": "sv_f7a2b9c8d1e3f4g5h6i7j8k9l0m1n2o3p",
    "tanggal": "",
    "cabang": "",
    "karyawan": "",
    "tipe_laporan": "",
    "susu_diamond": 0,
    "susu_greenfield": 0,
    "bubuk_coklat": 0,
    "bubuk_matcha": 0,
    "bubuk_redvelvet": 0,
    "bubuk_taro": 0,
    "nama_bahan": "",
    "kategori": "",
    "jumlah": "",
    "alasan": "",
    "status": "Dilaporkan"
  };

  // Mencari jawaban berdasarkan Judul Pertanyaan (Sangat disarankan!)
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var title = itemResponse.getItem().getTitle();
    var response = itemResponse.getResponse();

    if (title.includes("Hari Ini") || title.includes("Tanggal")) payload.tanggal = response;
    if (title.includes("Cabang") || title.includes("Store")) payload.cabang = response;
    if (title.includes("KARYAWAN") || title.includes("Nama")) payload.karyawan = response;
    if (title.includes("Jenis Laporan") || title.includes("Tipe")) payload.tipe_laporan = response;
    
    // Stok
    if (title.includes("Susu Diamond")) payload.susu_diamond = response;
    if (title.includes("Susu Greenfield")) payload.susu_greenfield = response;
    if (title.includes("Bubuk Coklat")) payload.bubuk_coklat = response;
    if (title.includes("Bubuk Matcha")) payload.bubuk_matcha = response;
    if (title.includes("Bubuk Redvelvet")) payload.bubuk_redvelvet = response;
    if (title.includes("Bubuk Taro")) payload.bubuk_taro = response;

    // Bahan Rusak
    if (title.includes("Nama Bahan")) payload.nama_bahan = response;
    if (title.includes("Kategori")) payload.kategori = response;
    if (title.includes("Jumlah")) payload.jumlah = response;
    if (title.includes("Alasan")) payload.alasan = response;
  }

  // Jika tipe_laporan kosong, berikan default agar tidak error di dashboard
  if (!payload.tipe_laporan) payload.tipe_laporan = "Laporan Sisa Stok Bahan";

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("Status: " + response.getResponseCode());
    Logger.log("Body: " + response.getContentText());
  } catch (err) {
    Logger.log("Error: " + err.toString());
  }
}

// Tambahkan trigger di editor script (ikon jam di sebelah kiri):
// 1. Klik 'Add Trigger'
// 2. Choose which function to run: 'onFormSubmit'
// 3. Select event source: 'From form'
// 4. Select event type: 'On form submit'
```

### 3. Setup Trigger (Sangat Penting)
1. Di panel sebelah kiri editor script, klik ikon jam (**Triggers**).
2. Klik tombol **+ Add Trigger** di pojok kanan bawah.
3. Konfigurasi trigger sebagai berikut:
   - Choose which function to run: **onFormSubmit**
   - Select event source: **From form**
   - Select event type: **On form submit**
4. Klik **Save**. Anda mungkin perlu memberikan izin (Authorize) ke akun Google Anda.

### 4. Setup Database
Pastikan Anda sudah menjalankan script SQL yang saya buat di `lib/sql/update_laporan_stok_v2.sql` ke dalam **Supabase SQL Editor** Anda agar tabel datanya tersedia.

---

**Catatan**: Jika dashboard Anda dijalankan secara lokal (localhost), Google Form tidak akan bisa mengirim data ke sana secara langsung. Anda perlu menggunakan tool seperti **ngrok** untuk mengekspos localhost ke publik, atau men-deploy dashboard Anda ke Vercel/Netlify.
