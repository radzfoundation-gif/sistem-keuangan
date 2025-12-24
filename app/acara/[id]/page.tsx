"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEvents } from "@/contexts/EventsContext"
import { useTransactions } from "@/contexts/TransactionsContext"
import { formatCurrency } from "@/lib/currency"
import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrashIcon, ArrowLeftIcon, FileTextIcon, WalletIcon } from "lucide-react"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function DetailAcaraPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const unwrappedParams = use(params)
    const { id } = unwrappedParams

    const router = useRouter()
    const { getEventById, deleteEvent } = useEvents()
    const { transactions } = useTransactions()
    const [event, setEvent] = useState<any>(null)

    useEffect(() => {
        const e = getEventById(id)
        if (e) setEvent(e)
    }, [id, getEventById])

    if (!event) return <div className="p-8 text-center">Loading...</div>

    const eventTransactions = transactions.filter(t => t.eventId === id)
    const totalIncome = eventTransactions.filter(t => t.type === "MASUK").reduce((acc, t) => acc + t.amount, 0)
    const totalExpense = eventTransactions.filter(t => t.type === "KELUAR").reduce((acc, t) => acc + t.amount, 0)
    const remainingBudget = event.budget - totalExpense
    const actualProfit = totalIncome - totalExpense // Jika acara mencari profit

    const handleDelete = () => {
        deleteEvent(id)
        toast.success("Acara berhasil dihapus")
        router.push("/acara")
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
                                <BreadcrumbLink href="/acara">Acara</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium">{event.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold tracking-tight">{event.name}</h2>
                                <Badge variant="outline" className="text-base">{event.status}</Badge>
                            </div>
                            <p className="text-muted-foreground">{event.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <TrashIcon className="mr-2 size-4" />
                                        Hapus Acara
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus acara ini?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Data acara akan dihapus, tetapi transaksi yang terkait akan tetap tersimpan (namun kehilangan link ke acara ini).
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                            Hapus
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                                <WalletIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(event.budget)}</div>
                                <p className="text-xs text-muted-foreground">Alokasi dana awal</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Realisasi Pengeluaran</CardTitle>
                                <div className="h-4 w-4 text-red-500 font-bold">↓</div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
                                <p className="text-xs text-muted-foreground">{((totalExpense / event.budget) * 100).toFixed(1)}% dari budget terpakai</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sisa Budget</CardTitle>
                                <div className={`h-4 w-4 font-bold ${remainingBudget < 0 ? "text-red-500" : "text-green-500"}`}>=</div>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}>
                                    {formatCurrency(remainingBudget)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {remainingBudget < 0 ? "Over budget!" : "Masih aman"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Transaksi Acara</CardTitle>
                            <CardDescription>Daftar transaksi yang ditautkan ke acara ini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead className="text-right">Nominal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {eventTransactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                Belum ada transaksi untuk acara ini
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        eventTransactions.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{t.date}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{t.description}</div>
                                                    <div className="text-xs text-muted-foreground">{t.category} • oleh {t.treasurer}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={t.type === "MASUK" ? "outline" : "secondary"}>
                                                        {t.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={`text-right font-medium ${t.type === "MASUK" ? "text-green-600" : "text-red-600"}`}>
                                                    {t.type === "MASUK" ? "+" : "-"} {formatCurrency(t.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
