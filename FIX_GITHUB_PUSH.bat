@echo off
title FIX UPLOAD GITHUB
color 0E

echo ===================================================
echo   PERBAIKAN UPLOAD KE GITHUB
echo ===================================================
echo.

echo [1/4] Mengatur Identitas Git (Local)...
git config user.email "auto@deploy.bot"
git config user.name "Auto Deploy Bot"

echo.
echo [2/4] Menyiapkan File...
git add .
git commit -m "Force Initial Commit for Deployment"

echo.
echo [3/4] Mengatur Cabang Utama...
git branch -M main

echo.
echo [4/4] Mengupload ke GitHub...
echo ---------------------------------------------------
echo SILAKAN LOGIN JIKA JENDELA GITHUB MUNCUL.
echo ---------------------------------------------------
git push -u origin main

echo.
echo ===================================================
echo   SELESAI. SILAKAN CEK GITHUB ANDA.
echo ===================================================
pause
