"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useTransactions } from "@/contexts/TransactionsContext"
import { useNota } from "@/contexts/NotaContext"
import { useState } from "react"
import { AlertCircle, Trash2Icon, DownloadIcon } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PengaturanPage() {
    const { transactions } = useTransactions()
    const { notaRecords } = useNota()
    const [isDeleting, setIsDeleting] = useState(false)

    // Fungsi reset data manual karena context mungkin tidak expose clearAll
    // Tapi kita bisa gunakan localStorage.clear() dan reload page
    const handleResetData = () => {
        setIsDeleting(true)
        setTimeout(() => {
            localStorage.removeItem("keuangan-transactions")
            localStorage.removeItem("keuangan-nota-records")
            toast.success("Semua data berhasil dihapus", {
                description: "Halaman akan dimuat ulang dalam 2 detik..."
            })
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        }, 1000)
    }

    const handleBackupData = () => {
        const data = {
            transactions,
            notaRecords,
            timestamp: new Date().toISOString(),
            version: "1.0"
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `backup_keuangan_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("Backup berhasil didownload")
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium">Pengaturan</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
                        <p className="text-muted-foreground">Kelola preferensi dan data aplikasi.</p>
                    </div>

                    <Tabs defaultValue="data" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="data">Data & Penyimpanan</TabsTrigger>
                            <TabsTrigger value="profile">Profil Bendahara</TabsTrigger>
                            <TabsTrigger value="app">Aplikasi</TabsTrigger>
                        </TabsList>

                        <TabsContent value="data" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manajemen Data</CardTitle>
                                    <CardDescription>
                                        Backup dan restore data keuangan Anda.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <div className="font-medium">Backup Data</div>
                                            <div className="text-sm text-muted-foreground">
                                                Download semua data transaksi dan nota sebagai file JSON.
                                            </div>
                                        </div>
                                        <Button variant="outline" onClick={handleBackupData}>
                                            <DownloadIcon className="mr-2 size-4" />
                                            Download Backup
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4 bg-destructive/5">
                                        <div className="space-y-0.5">
                                            <div className="font-medium text-destructive">Reset Aplikasi</div>
                                            <div className="text-sm text-destructive/80">
                                                Hapus SEMUA data transaksi dan nota secara permanen.
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive">
                                                    <Trash2Icon className="mr-2 size-4" />
                                                    Reset Data
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus permanen data transaksi dan history nota dari browser ini.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
                                                        {isDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profil Bendahara</CardTitle>
                                    <CardDescription>
                                        Informasi yang akan muncul di nota transaksi.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama Komunitas</Label>
                                        <Input id="name" defaultValue="Komunitas Maju Bersama" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="treasurer">Nama Bendahara Default</Label>
                                        <Input id="treasurer" defaultValue="Admin" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Kontak</Label>
                                        <Input id="email" defaultValue="admin@komunitas.com" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={() => toast.success("Profil berhasil disimpan")}>Simpan Perubahan</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="app">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tentang Aplikasi</CardTitle>
                                    <CardDescription>Informasi versi dan pengembang.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Versi</span>
                                        <span className="font-mono">v1.0.0</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Framework</span>
                                        <span>Next.js 15 + React 19</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">UI Library</span>
                                        <span>shadcn/ui + TailwindCSS</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Storage</span>
                                        <span>Local Browser Storage</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
