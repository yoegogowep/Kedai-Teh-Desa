// Fitur data keranjang dan menu yang sedang dibuka
let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let menuDibuka = null;

// Fitur ambil elemen berdasarkan id
function ambil(id) {
  return document.getElementById(id);
}

// Fitur ambil kartu menu berdasarkan id
function carikartu(id) {
  return document.querySelector('.kartu[data-id="' + id + '"]');
}

// Fitur format harga rupiah
function rupiah(angka) {
  return "Rp" + String(angka).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fitur cek status login
function sudahMasuk() {
  return localStorage.getItem("masuk") === "ya";
}

/* ===== MENU HEADER ===== */
// Fitur pencarian menu
ambil("input-cari").addEventListener("input", function () {
  tampilkanKatalog();
});

// Fitur tombol cari
ambil("form-cari").addEventListener("submit", function (e) {
  e.preventDefault();
  tampilkanKatalog();
});

// Fitur keluar (logout)
ambil("tombol-keluar").addEventListener("click", function () {
  localStorage.removeItem("masuk");
  aturHalaman();
});

/* ===== MENU KATALOG ===== */
// Fitur filter kategori dan pencarian menu
function tampilkanKatalog() {
  const kategori = document.querySelector(
    'input[name="kategori"]:checked',
  ).value;
  const kata = ambil("input-cari").value.trim().toLowerCase();
  let ada = false;

  document.querySelectorAll("#grid-produk .kartu").forEach(function (k) {
    const cocok =
      (kategori === "semua" || k.dataset.kategori === kategori) &&
      k.textContent.toLowerCase().includes(kata);
    k.hidden = !cocok;
    if (cocok) ada = true;
  });

  ambil("katalog-kosong").hidden = ada;
}

// Fitur filter kategori
ambil("halaman-katalog").addEventListener("change", tampilkanKatalog);

/* ===== MENU LOGIN =====*/
// Fitur akun login
const USERNAME = "user";
const PASSWORD = "1111";

// Fitur masuk (login), setelah berhasil kembali ke katalog
ambil("form-login").addEventListener("submit", function (e) {
  e.preventDefault();
  const benar =
    ambil("isian-username").value.trim().toLowerCase() === USERNAME &&
    ambil("isian-password").value === PASSWORD;
  ambil("login-salah").hidden = benar;
  if (benar) {
    localStorage.setItem("masuk", "ya");
    this.reset();
    location.hash = "#/";
  }
});

/* ===== MENU DETAIL MENU =====*/
// Fitur tampilan detail menu
function tampilkanDetail(id) {
  menuDibuka = carikartu(id);
  ambil("detail-tidak-ada").hidden = Boolean(menuDibuka);
  ambil("isi-detail").hidden = !menuDibuka;
  if (!menuDibuka) {
    return;
  }
  ambil("detail-gambar").src = menuDibuka.querySelector(".foto").src;
  ambil("detail-nama").textContent = menuDibuka.dataset.nama;
  ambil("detail-deskripsi").textContent = menuDibuka.dataset.deskripsi;
  ambil("isian-jumlah").value = 1;
  hitungKasir();
}

// Fitur kasir (harga x jumlah)
function hitungKasir() {
  const kolom = ambil("isian-jumlah");
  kolom.value = Math.max(1, Math.floor(Number(kolom.value)) || 1);
  ambil("tombol-kurang").disabled = kolom.value <= 1;
  ambil("kasir-nama").textContent = menuDibuka.dataset.nama;
  ambil("kasir-harga").textContent = rupiah(menuDibuka.dataset.harga);
  document.querySelectorAll(".total-teks").forEach(function (el) {
    el.textContent = rupiah(menuDibuka.dataset.harga * kolom.value);
  });
}

// Fitur tombol kurangi, tambah, dan isian jumlah
ambil("tombol-kurang").addEventListener("click", function () {
  ambil("isian-jumlah").stepDown();
  hitungKasir();
});
ambil("tombol-tambah").addEventListener("click", function () {
  ambil("isian-jumlah").stepUp();
  hitungKasir();
});
ambil("isian-jumlah").addEventListener("change", hitungKasir);

// Fitur masukkan menu ke keranjang (tambah = true untuk menambah jumlah lama)
function masukKeranjang(tambah) {
  const id = Number(menuDibuka.dataset.id);
  const jumlah = Number(ambil("isian-jumlah").value);
  const item = keranjang.find(function (i) {
    return i.id === id;
  });
  if (item) {
    item.jumlah = tambah ? item.jumlah + jumlah : jumlah;
  } else {
    keranjang.push({
      id: id,
      jumlah: jumlah,
      harga: Number(menuDibuka.dataset.harga),
    });
  }
  simpanKeranjang();
}

// Fitur tombol tambah ke keranjang
ambil("tombol-keranjang").addEventListener("click", function () {
  masukKeranjang(true);
});

// Fitur tombol pesan sekarang
ambil("tombol-pesan").addEventListener("click", function () {
  masukKeranjang(false);
  location.hash = "#/keranjang";
});

/* ===== MENU KERANJANG ===== */
// Fitur hitung jumlah barang dan total harga
function jumlahBarang() {
  return keranjang.reduce(function (t, i) {
    return t + i.jumlah;
  }, 0);
}

function totalHarga() {
  return keranjang.reduce(function (t, i) {
    return t + i.harga * i.jumlah;
  }, 0);
}

// Fitur simpan keranjang dan lencana jumlah di header
function simpanKeranjang() {
  localStorage.setItem("keranjang", JSON.stringify(keranjang));
  ambil("lencana-keranjang").textContent = jumlahBarang();
}

// Fitur daftar barang dari template baris
function isiBaris(wadah, daftar) {
  wadah.replaceChildren();
  daftar.forEach(function (item) {
    const menu = carikartu(item.id);
    const baris = ambil("templat-baris").content.cloneNode(true);
    baris.querySelector(".baris-keranjang").dataset.id = item.id;
    baris.querySelector(".foto").src = menu.querySelector(".foto").src;
    baris.querySelector(".baris-info a").textContent = menu.dataset.nama;
    baris.querySelector(".baris-info a").href = "#/detail/" + item.id;
    baris.querySelector(".baris-info p").textContent = rupiah(item.harga);
    baris.querySelector(".jumlah").textContent = item.jumlah;
    baris.querySelector('[data-aksi="kurang"]').disabled = item.jumlah <= 1;
    baris.querySelector(".baris-subtotal").textContent = rupiah(
      item.harga * item.jumlah,
    );
    wadah.append(baris);
  });
}

// Fitur tampilan keranjang
function tampilkanKeranjang() {
  isiBaris(ambil("daftar-keranjang"), keranjang);
  ambil("keranjang-jumlah").textContent = jumlahBarang();
  ambil("keranjang-subtotal").textContent = rupiah(totalHarga());
}

// Fitur kurangi, tambah, dan hapus barang
ambil("daftar-keranjang").addEventListener("click", function (e) {
  const aksi = e.target.dataset.aksi;
  if (!aksi) {
    return;
  }
  const id = Number(e.target.closest("[data-id]").dataset.id);
  const item = keranjang.find(function (i) {
    return i.id === id;
  });
  if (aksi === "kurang") {
    item.jumlah -= 1;
  }
  if (aksi === "tambah") {
    item.jumlah += 1;
  }
  if (aksi === "hapus") {
    keranjang = keranjang.filter(function (i) {
      return i !== item;
    });
  }
  simpanKeranjang();
  tampilkanKeranjang();
});

/* ===== MENU CHECKOUT ===== */
// Fitur ringkasan pesanan
function tampilkanCheckout() {
  isiBaris(ambil("ringkasan-checkout"), keranjang);
  ambil("checkout-total").textContent = rupiah(totalHarga());
}

// Fitur buat pesanan (form sudah divalidasi oleh HTML)
ambil("form-checkout").addEventListener("submit", function (e) {
  e.preventDefault();
  const pesanan = {
    nama: ambil("isian-nama").value.trim(),
    barang: keranjang,
    total: totalHarga(),
  };
  localStorage.setItem("pesananTerakhir", JSON.stringify(pesanan));
  keranjang = [];
  simpanKeranjang();
  this.reset();
  location.hash = "#/sukses";
});

/* ===== MENU SUKSES ===== */
// Fitur rincian pesanan yang baru dibuat
function tampilkanSukses() {
  const pesanan = JSON.parse(localStorage.getItem("pesananTerakhir"));
  ambil("isi-sukses").hidden = !pesanan;
  ambil("sukses-tidak-ada").hidden = Boolean(pesanan);
  if (!pesanan) {
    return;
  }
  ambil("sukses-pemesan").textContent =
    "Terima kasih, " + pesanan.nama + ". Pesananmu sedang diproses.";
  isiBaris(ambil("sukses-daftar"), pesanan.barang);
  ambil("sukses-total").textContent = rupiah(pesanan.total);
}

/* ===== FITUR PINDAH HALAMAN (berlaku di semua menu) ===== */
// Fitur pindah halaman berdasarkan hash URL, contoh: #/detail/3
function aturHalaman() {
  const bagian = location.hash.replace("#/", "").split("/");
  let halaman = bagian[0] || "katalog";

  if (
    !["katalog", "login", "detail", "keranjang", "checkout", "sukses"].includes(
      halaman,
    )
  ) {
    halaman = "katalog";
  }
  if (halaman === "login" && sudahMasuk()) {
    return location.replace("#/");
  }
  if (halaman === "checkout" && keranjang.length === 0) {
    return location.replace("#/keranjang");
  }
  // Fitur wajib login: semua menu selain katalog dan login
  if (halaman !== "katalog" && halaman !== "login" && !sudahMasuk()) {
    halaman = "login";
  }

  document.documentElement.classList.toggle("sudah-masuk", sudahMasuk());
  document.body.dataset.halaman = halaman;
  window.scrollTo(0, 0);

  if (halaman === "katalog") {
    tampilkanKatalog();
  }
  if (halaman === "login") {
    ambil("login-salah").hidden = true;
  }
  if (halaman === "detail") {
    tampilkanDetail(bagian[1]);
  }
  if (halaman === "keranjang") {
    tampilkanKeranjang();
  }
  if (halaman === "checkout") {
    tampilkanCheckout();
  }
  if (halaman === "sukses") {
    tampilkanSukses();
  }
}

/* ===== FITUR MULAI ===== */
window.addEventListener("hashchange", aturHalaman);
simpanKeranjang();
aturHalaman();
