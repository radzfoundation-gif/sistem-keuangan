const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vqpqfedgkzdwviwxmdtk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcHFmZWRna3pkd3Zpd3htZHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NjI1MTAsImV4cCI6MjA4MjEzODUxMH0.4PZam4GFBnC1P5wu4bRriW-K0NCkcFz6KAwqj-O_M0M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
    const testEmail = `test_${Date.now()}@admin.com`
    console.log("Testing signup with:", testEmail)

    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'password123',
    })

    if (error) {
        console.error("TEST GAGAL:", error.message)
        // If error is "Error sending confirmation email", then Confirm Email is ON.
    } else {
        // Check if session is null (means confirmation required) or user is created active
        if (data.session) {
            console.log("TEST SUKSES: Auto Confirm is Working! Session created.")
        } else if (data.user && !data.session) {
            console.log("TEST GAGAL: User created but Session hidden -> Confirm Email IS ON.")
        }
    }
}

testSignup()
