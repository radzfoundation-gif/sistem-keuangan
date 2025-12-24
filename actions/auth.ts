"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"

export async function login(formData: FormData) {
    const supabase = await createClient()

    // 1. Get raw input
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // 2. Sign in directly
    console.log("Attempting login for:", email)

    // 3. Sign in
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: "Login gagal: " + error.message }
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
}
