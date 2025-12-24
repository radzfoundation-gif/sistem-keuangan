"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvents } from "@/contexts/EventsContext"
import { useTransactions } from "@/contexts/TransactionsContext"
import { CalendarIcon, PlusIcon, MegaphoneIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AcaraPage() {
    const { events, addEvent } = useEvents()
    const { transactions } = useTransactions()
    const [open, setOpen] = useState(false)
    const [eventName, setEventName] = useState("")
    const [eventDesc, setEventDesc] = useState("")
    const [eventBudget, setEventBudget] = useState("")
    const [eventStatus, setEventStatus] = useState("PLANNED")

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault()
        addEvent({
            name: eventName,
            description: eventDesc,
            date: new Date().toISOString().split("T")[0],
            budget: Number(eventBudget),
            status: eventStatus as any
        })
        toast.success("Acara berhasil dibuat")
        setOpen(false)
        setEventName("")
        setEventDesc("")
        setEventBudget("")
    }

    const getEventStats = (eventId: string) => {
        const eventTrans = transactions.filter(t => t.eventId === eventId)
        const income = eventTrans.filter(t => t.type === "MASUK").reduce((acc, t) => acc + t.amount, 0)
        const expense = eventTrans.filter(t => t.type === "KELUAR").reduce((acc, t) => acc + t.amount, 0)
        return { income, expense }
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
                                <BreadcrumbPage className="font-medium">Acara & Kegiatan</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Manajemen Acara</h2>
                            <p className="text-muted-foreground">Kelola budget dan pengeluaran per kegiatan.</p>
                        </div>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusIcon className="mr-2 size-4" />
                                    Buat Acara Baru
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleAddEvent}>
                                    <DialogHeader>
                                        <DialogTitle>Buat Acara Baru</DialogTitle>
                                        <DialogDescription>Tambahkan acara baru untuk ditracking keuangannya.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nama Acara</Label>
                                            <Input id="name" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Contoh: Bukber Alumni" required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="desc">Deskripsi</Label>
                                            <Input id="desc" value={eventDesc} onChange={e => setEventDesc(e.target.value)} placeholder="Keterangan singkat acara" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="budget">Estimasi Budget</Label>
                                            <Input id="budget" type="number" value={eventBudget} onChange={e => setEventBudget(e.target.value)} placeholder="0" required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select value={eventStatus} onValueChange={setEventStatus}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PLANNED">Direncanakan</SelectItem>
                                                    <SelectItem value="ACTIVE">Sedang Berjalan</SelectItem>
                                                    <SelectItem value="COMPLETED">Selesai</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Buat Acara</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {events.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <MegaphoneIcon className="size-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold">Belum ada acara</h3>
                            <p className="mb-4">Buat acara pertama Anda untuk mulai tracking budget.</p>
                            <Button onClick={() => setOpen(true)}>Buat Acara</Button>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => {
                                const stats = getEventStats(event.id)
                                const remainingBudget = event.budget - stats.expense

                                return (
                                    <Link href={`/acara/${event.id}`} key={event.id}>
                                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-lg">{event.name}</CardTitle>
                                                    <Badge variant={event.status === "ACTIVE" ? "default" : "secondary"}>
                                                        {event.status === "PLANNED" ? "Rencana" : event.status === "ACTIVE" ? "Aktif" : "Selesai"}
                                                    </Badge>
                                                </div>
                                                <CardDescription>{event.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Budget</span>
                                                        <span className="font-semibold">{formatCurrency(event.budget)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Terpakai</span>
                                                        <span className="font-semibold text-red-600">{formatCurrency(stats.expense)}</span>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">Sisa Budget</span>
                                                        <span className={`font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                            {formatCurrency(remainingBudget)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
