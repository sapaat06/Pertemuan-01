// =====================================================================
// DATA (state): semua proyek disimpan di satu array.
// Setiap kali array berubah, panggil render() supaya tampilan ikut berubah.
// =====================================================================
let proyek = [
    { id: 1, judul: 'Aplikasi Kalkulator',       kategori: 'Desktop App', anggaran: 500000,  selesai: true },
    { id: 2, judul: 'Web Portofolio Mahasiswa',  kategori: 'Web App',     anggaran: 1000000, selesai: false },
];
let kataKunci = '';   // isi kotak pencarian saat ini
let idEdit = null;    // id proyek yang sedang diedit. null = mode tambah proyek baru

// ---------- Alat bantu kecil ----------
const $ = (id) => document.getElementById(id);

// Ubah angka jadi format rupiah: 1000000 -> "Rp 1.000.000"
const rupiah = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// Buat elemen HTML. Teks dipasang lewat textContent (aman dari injeksi HTML
// kalau pengguna mengetik tag seperti <script> di judul).
function buatEl(tag, kelas = '', teks = '') {
    const el = document.createElement(tag);
    if (kelas) el.className = kelas;
    el.textContent = teks;
    return el;
}

// =====================================================================
// RENDER
// =====================================================================

// Kartu statistik selalu menghitung SEMUA proyek, bukan hasil pencarian.
function renderStatistik() {
    const selesai = proyek.filter((p) => p.selesai).length;
    $('stat-total').textContent = proyek.length;
    $('stat-selesai').textContent = selesai;
    $('stat-proses').textContent = proyek.length - selesai;
    $('stat-anggaran').textContent = rupiah(proyek.reduce((jumlah, p) => jumlah + p.anggaran, 0));
}

// Buat tombol dengan data-aksi dan data-id (dibaca saat tombol diklik, lihat event klik di bawah)
function buatTombol(teks, aksi, id, kelas = '') {
    const t = buatEl('button', kelas, teks);
    t.dataset.aksi = aksi;
    t.dataset.id = id;
    return t;
}

// Satu kartu proyek lengkap dengan 3 tombol aksi: Edit, Ubah Status, Hapus
function buatKartu(p) {
    const item = buatEl('div', 'proyek-item');

    const info = buatEl('div');
    info.append(
        buatEl('h3', '', p.judul),
        buatEl('p', 'meta', `${p.kategori} - ${rupiah(p.anggaran)}`),
        buatEl('span', p.selesai ? 'badge selesai' : 'badge', p.selesai ? 'Selesai' : 'Dalam Pengerjaan')
    );

    const aksi = buatEl('div', 'aksi');
    aksi.append(
        buatTombol('Edit', 'edit', p.id),
        buatTombol('Ubah Status', 'ubah', p.id),
        buatTombol('Hapus Proyek', 'hapus', p.id, 'hapus')
    );

    item.append(info, aksi);
    return item;
}

// FITUR 2: saring proyek memakai .filter() + .toLowerCase().includes()
function renderDaftar() {
    const hasil = proyek.filter((p) =>
        p.judul.toLowerCase().includes(kataKunci.toLowerCase())
    );

    $('daftar').replaceChildren(
        ...(hasil.length
            ? hasil.map(buatKartu)
            : [buatEl('p', 'kosong', 'Tidak ada proyek yang cocok.')])
    );
}

function render() {
    renderStatistik();
    renderDaftar();
}

// =====================================================================
// UPDATE: mode edit
// Klik "Edit" -> isi formulir dengan data proyek -> "Simpan perubahan"
// =====================================================================
function mulaiEdit(p) {
    idEdit = p.id;
    $('judul').value = p.judul;
    $('kategori').value = p.kategori;
    $('anggaran').value = p.anggaran;
    $('selesai').checked = p.selesai;

    $('judul-form').textContent = 'Ubah Proyek';
    $('tombol-simpan').textContent = 'Simpan perubahan';
    $('batal').hidden = false;                       // tampilkan tombol Batal edit

    $('form-proyek').scrollIntoView({ behavior: 'smooth' });
    $('judul').focus();
}

// Kembali ke mode tambah: kosongkan form, kembalikan teks judul dan tombol
function akhiriEdit() {
    idEdit = null;
    $('form-proyek').reset();
    $('err-judul').textContent = '';
    $('err-anggaran').textContent = '';
    $('judul-form').textContent = 'Tambah Proyek';
    $('tombol-simpan').textContent = 'Tambah proyek';
    $('batal').hidden = true;
}

$('batal').addEventListener('click', akhiriEdit);

// =====================================================================
// FITUR 1 (create) + UPDATE: submit formulir
// =====================================================================
$('form-proyek').addEventListener('submit', (e) => {
    e.preventDefault();                       // cegah halaman reload

    const judul = $('judul').value.trim();
    const anggaran = Number($('anggaran').value);

    // Validasi: judul tidak boleh kosong, anggaran harus > 0
    $('err-judul').textContent = judul === '' ? 'Judul proyek tidak boleh kosong.' : '';
    $('err-anggaran').textContent = anggaran > 0 ? '' : 'Anggaran harus lebih besar dari 0.';
    if (judul === '' || !(anggaran > 0)) return;

    const data = { judul, kategori: $('kategori').value, anggaran, selesai: $('selesai').checked };

    if (idEdit === null) {
        // CREATE: proyek baru dengan id unik dari Date.now(), masuk array lewat spread
        proyek = [...proyek, { id: Date.now(), ...data }];
    } else {
        // UPDATE: ganti isi proyek dengan id itu, proyek lain dibiarkan
        proyek = proyek.map((p) => (p.id === idEdit ? { ...p, ...data } : p));
    }

    akhiriEdit();                             // kosongkan form + kembali ke mode tambah
    render();
});

// =====================================================================
// FITUR 2: pencarian real-time (event 'input' aktif setiap karakter diketik)
// =====================================================================
$('cari').addEventListener('input', (e) => {
    kataKunci = e.target.value;
    renderDaftar();
});

// =====================================================================
// FITUR 3: tombol Edit, Ubah Status, dan Hapus Proyek
// Satu pendengar klik di #daftar menangani semua tombol (event delegation),
// jadi tombol di kartu baru otomatis ikut bekerja.
// =====================================================================
$('daftar').addEventListener('click', (e) => {
    const tombol = e.target.closest('button[data-aksi]');
    if (!tombol) return;

    const id = Number(tombol.dataset.id);
    const aksi = tombol.dataset.aksi;

    if (aksi === 'edit') {
        mulaiEdit(proyek.find((p) => p.id === id));
        return;                                // edit belum mengubah data, tidak perlu render
    }

    if (aksi === 'ubah') {
        // .map(): salin semua proyek, balik status hanya pada proyek dengan id itu
        proyek = proyek.map((p) => (p.id === id ? { ...p, selesai: !p.selesai } : p));
    } else if (aksi === 'hapus') {
        // .filter(): simpan semua proyek kecuali yang id-nya cocok
        proyek = proyek.filter((p) => p.id !== id);
        if (id === idEdit) akhiriEdit();       // proyek yang sedang diedit dihapus: batalkan mode edit
    }

    render();                                  // perbarui kartu proyek dan statistik
});

// Tampilkan data awal saat halaman dibuka
render();