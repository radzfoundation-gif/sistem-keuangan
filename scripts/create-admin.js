const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vqpqfedgkzdwviwxmdtk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcHFmZWRna3pkd3Zpd3htZHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NjI1MTAsImV4cCI6MjA4MjEzODUxMH0.4PZam4GFBnC1P5wu4bRriW-K0NCkcFz6KAwqj-O_M0M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
    console.log("Mencoba mendaftarkan admin...")
    const { data, error } = await supabase.auth.signUp({
        email: 'dhananjaya@admin.com',
        password: 'dhananjaya2019',
    })

    if (error) {
        console.error("Gagal buat akun:", error.message)
    } else {
        console.log("✅ Sukses! Akun admin dibuat:")
        console.log("Email: dhananjaya@admin.com")
        console.log("ID:", data.user?.id)
        console.log("\nNOTE: Jika diminta konfirmasi email, cek inbox atau set 'Auto Confirm' di dashboard Supabase.")
    }
}

createAdmin()
