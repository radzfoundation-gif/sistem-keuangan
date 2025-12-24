@echo off
title FIX ENV VARS & REDEPLOY
color 0D

echo ===================================================
echo   PERBAIKAN KONFIGURASI VERCEL (OTOMATIS)
echo ===================================================
echo.
echo Masalah terdeteksi: Supabase URL & Key belum ada di Vercel.
echo Saya akan menambahkannya sekarang.
echo.

echo [1/3] Menambahkan NEXT_PUBLIC_SUPABASE_URL...
echo https://vqpqfedgkzdwviwxmdtk.supabase.co| npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo.

echo [2/3] Menambahkan NEXT_PUBLIC_SUPABASE_ANON_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcHFmZWRna3pkd3Zpd3htZHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NjI1MTAsImV4cCI6MjA4MjEzODUxMH0.4PZam4GFBnC1P5wu4bRriW-K0NCkcFz6KAwqj-O_M0M| npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo.

echo [3/3] Menerapkan Perubahan (Redeploy)...
echo Mohon tunggu sebentar...
call npx vercel --prod

echo.
echo ===================================================
echo   SELESAI! REFRESH WEBSITE ANDA SEKARANG.
echo ===================================================
pause
