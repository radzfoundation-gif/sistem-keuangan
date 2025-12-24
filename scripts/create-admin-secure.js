const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vqpqfedgkzdwviwxmdtk.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcHFmZWRna3pkd3Zpd3htZHRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU2MjUxMCwiZXhwIjoyMDgyMTM4NTEwfQ.1JsU4wLo_c1V24aXPkGgvXz22dvughX4MoGzoY72_mo'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdminSecure() {
    console.log("Menggunakan Service Role untuk membersihkan & membuat akun admin...")

    // 1. Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error("Gagal list users:", listError)
        return
    }

    const existingUser = users.find(u => u.email === 'dhananjaya@admin.com')

    if (existingUser) {
        console.log("User lama ditemukan (ID: " + existingUser.id + "). Menghapus...")
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id)
        if (deleteError) {
            console.error("Gagal hapus user lama:", deleteError.message)
            return
        }
        console.log("User lama dihapus.")
    }

    // 2. Create new confirmed user
    console.log("Membuat user baru 'dhananjaya@admin.com'...")
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'dhananjaya@admin.com',
        password: 'dhananjaya2019',
        email_confirm: true // Force confirm
    })

    if (error) {
        console.error("Gagal buat akun:", error.message)
    } else {
        console.log("✅ SUKSES! Akun admin dibuat & TERVERIFIKASI.")
        console.log("Email: dhananjaya@admin.com")
        console.log("Password: dhananjaya2019")
        console.log("Silakan login sekarang.")
    }
}

createAdminSecure()
