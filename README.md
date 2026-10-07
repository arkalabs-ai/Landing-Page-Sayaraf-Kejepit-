# Landing page Herbavita Nusantara

Sumber halaman produksi https://herbavita.id/.

Revisi 7 Oktober 2026 mempertahankan tema LP sebelumnya, memperbarui informasi produk sesuai label dan arahan klien, serta memperjelas pemesanan WhatsApp dan COD.

## Preview lokal

Jalankan server statis dari folder ini, misalnya `python -m http.server 4173 --bind 127.0.0.1`, lalu buka http://127.0.0.1:4173/.

## Publikasi

Cloudflare Pages: `bsaji-syaraf-kejepit`, production branch `main`. Proyek menggunakan Direct Upload. Push GitHub menyimpan sumber; publikasi dilakukan terpisah dengan:

```
wrangler pages deploy . --project-name bsaji-syaraf-kejepit --branch main
```

Hanya file halaman dan aset yang digunakan berada dalam repository ini. Materi kerja internal tidak disertakan.
