-- 1. Membuat Database Baru
CREATE DATABASE IF NOT EXISTS db_kampus;
USE db_kampus;

-- 2. Membuat Tabel Mahasiswa
CREATE TABLE IF NOT EXISTS mahasiswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nim VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    jurusan VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- 3. Memasukkan Data Awal Sederhana
INSERT INTO mahasiswa (nim, nama, jurusan, email) VALUES
('240101001', 'Ahmad Pratama', 'Teknik Informatika', 'ahmad@kampus.ac.id'),
('240101002', 'Siti Nurhaliza', 'Sistem Informasi', 'siti@kampus.ac.id')
ON DUPLICATE KEY UPDATE nim=nim;
