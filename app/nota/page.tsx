"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DownloadIcon, FileTextIcon, QrCodeIcon, MoreVerticalIcon, SearchIcon, TrashIcon } from "lucide-react"
import { useNota } from "@/contexts/NotaContext"
import { formatCurrency } from "@/lib/currency"
import { generateNotaPDF } from "@/lib/nota-generator"
import { toast } from "sonner"

export default function NotaPage() {
    const { notaRecords, deleteNotaRecord } = useNota()
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [notaToDelete, setNotaToDelete] = useState<string | null>(null)

    const filteredRecords = notaRecords.filter(
        (nota) =>
            nota.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            nota.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            nota.treasurer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            nota.transactionId.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleDownloadNota = async (nota: (typeof notaRecords)[0]) => {
        try {
            await generateNotaPDF({
                id: nota.transactionId,
                date: nota.date,
                type: nota.transactionType,
                amount: nota.amount,
                category: nota.category,
                description: nota.description,
                treasurer: nota.treasurer,
            })
            toast.success("Nota berhasil didownload!")
        } catch (error) {
            toast.error("Gagal mendownload nota")
        }
    }

    const handleDownloadQR = (nota: (typeof notaRecords)[0]) => {
        try {
            const link = document.createElement("a")
            link.href = nota.qrCode
            link.download = `QR_${nota.transactionId}_${nota.date}.png`
            link.click()
            toast.success("QR Code berhasil didownload!")
        } catch (error) {
            toast.error("Gagal mendownload QR Code")
        }
    }

    const handleDeleteClick = (id: string) => {
        setNotaToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (notaToDelete) {
            deleteNotaRecord(notaToDelete)
            toast.success("Nota berhasil dihapus")
            setDeleteDialogOpen(false)
            setNotaToDelete(null)
        }
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
                                <BreadcrumbPage className="font-medium">Nota</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Riwayat Nota</h2>
                            <p className="text-muted-foreground">
                                Semua nota transaksi yang pernah dibuat ({notaRecords.length} total)
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nota..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Nota Grid */}
                    {filteredRecords.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <FileTextIcon className="size-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground text-center">
                                    {searchQuery ? "Tidak ada nota yang cocok dengan pencarian" : "Belum ada nota yang dibuat"}
                                </p>
                                <p className="text-sm text-muted-foreground text-center mt-1">
                                    Nota akan otomatis dibuat saat Anda menambah transaksi
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredRecords.map((nota) => (
                                <Card key={nota.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                <CardTitle className="text-base line-clamp-1">{nota.description}</CardTitle>
                                                <CardDescription className="text-xs">ID: {nota.transactionId}</CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm">
                                                        <MoreVerticalIcon className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleDownloadNota(nota)}>
                                                        <FileTextIcon className="size-4 mr-2" />
                                                        Download PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownloadQR(nota)}>
                                                        <QrCodeIcon className="size-4 mr-2" />
                                                        Download QR
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(nota.id)}>
                                                        <TrashIcon className="size-4 mr-2" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={nota.transactionType === "MASUK" ? "default" : "secondary"}
                                                className={
                                                    nota.transactionType === "MASUK"
                                                        ? "bg-foreground text-background hover:bg-foreground/90"
                                                        : ""
                                                }
                                            >
                                                {nota.transactionType}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{nota.category}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <p
                                                className={`text-lg font-bold ${nota.transactionType === "MASUK" ? "text-foreground" : "text-muted-foreground"}`}
                                            >
                                                {nota.transactionType === "MASUK" ? "+" : "-"} {formatCurrency(nota.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(nota.date).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t">
                                            <img src={nota.qrCode} alt="QR Code" className="size-12 border rounded" />
                                            <div className="text-xs text-muted-foreground flex-1">
                                                <p>Bendahara: {nota.treasurer}</p>
                                                <p className="text-[10px]">
                                                    Dibuat: {new Date(nota.generatedAt).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDownloadNota(nota)}>
                                                <DownloadIcon className="size-3 mr-1" />
                                                PDF
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDownloadQR(nota)}>
                                                <QrCodeIcon className="size-3 mr-1" />
                                                QR
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </SidebarInset>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Nota?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus nota dari riwayat. Anda masih bisa generate ulang dari menu transaksi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    )
}
