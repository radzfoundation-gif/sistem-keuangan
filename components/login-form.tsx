"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LockIcon, UserIcon } from "lucide-react"
import Image from "next/image"
import { login } from "@/actions/auth"
import { toast } from "sonner"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await login(formData)
      if (result?.error) {
        toast.error(result.error)
        setIsLoading(false)
      }
      // If success, redirect happens on server
    } catch (e) {
      toast.error("Terjadi kesalahan sistem")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-t-4 border-t-indigo-500">
      <CardHeader className="space-y-4 flex flex-col items-center text-center pb-8">
        <div className="relative w-24 h-24 mb-2">
          {/* Ensure this image exists, or fallback to placeholder */}
          <div className="absolute inset-0 bg-indigo-50 rounded-full flex items-center justify-center">
            <Image src="/logo-dhananjaya-new.jpg" alt="Logo" fill className="object-contain p-2" priority unoptimized />
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-balance text-indigo-900">Keuangan Dhananjaya</CardTitle>
          <CardDescription className="mt-2">Masuk sebagai Bendahara</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="dhananjaya@admin.com"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Masuk Sistem"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
