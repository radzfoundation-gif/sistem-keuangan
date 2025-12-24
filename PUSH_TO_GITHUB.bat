@echo off
title PUSH KE GITHUB
color 0E

echo ===================================================
echo   UPLOAD KODE KE GITHUB
echo ===================================================
echo.
echo Target Repository: https://github.com/radzfoundation-gif/sistem-keuangan
echo.

echo [1/2] Menambahkan semua perubahan...
git add .
git commit -m "Final code upload for deployment"

echo.
echo [2/2] Mengupload ke GitHub...
echo ---------------------------------------------------
echo JENDELA LOGIN GITHUB MUNGKIN AKAN MUNCUL.
echo SILAKAN LOGIN JIKA DIMINTA.
echo ---------------------------------------------------
git branch -M main
git push -u origin main

echo.
echo ===================================================
echo   PROSES SELESAI
echo ===================================================
pause
