"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/contexts/TransactionsContext"
import { useEvents } from "@/contexts/EventsContext"
import { formatCurrency } from "@/lib/currency"
import { BotIcon, TrendingUpIcon, WalletIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react"
import { useState, useMemo } from "react"

export function AiInsightsDialog() {
    const { transactions } = useTransactions()
    const { events } = useEvents()
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)) // YYYY-MM
    const [selectedEventId, setSelectedEventId] = useState<string>("all")

    // --- Monthly Analysis Logic ---
    const monthlyStats = useMemo(() => {
        const [year, month] = selectedMonth.split("-").map(Number)
        const monthTrans = transactions.filter(t => {
            const d = new Date(t.date)
            return d.getFullYear() === year && d.getMonth() === month - 1
        })

        const income = monthTrans.filter(t => t.type === "MASUK").reduce((a, b) => a + b.amount, 0)
        const expense = monthTrans.filter(t => t.type === "KELUAR").reduce((a, b) => a + b.amount, 0)

        // Find top expense category
        const catMap: Record<string, number> = {}
        monthTrans.filter(t => t.type === "KELUAR").forEach(t => {
            catMap[t.category] = (catMap[t.category] || 0) + t.amount
        })
        const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]

        // AI Summary Text
        let summary = "Data bulan ini belum cukup untuk analisis."
        if (monthTrans.length > 0) {
            if (expense > income && income > 0) {
                summary = "⚠️ Peringatan: Pengeluaran Anda melebihi pemasukan bulan ini. Disarankan untuk meninjau kembali kategori " + (topCat?.[0] || "") + "."
            } else if (expense > income * 0.8) {
                summary = "⚠️ Hati-hati, pengeluaran Anda sudah mencapai 80% dari pemasukan. Hemat di kategori " + (topCat?.[0] || "") + "."
            } else {
                summary = "✅ Kondisi keuangan bulan ini sehat. Anda memiliki surplus yang baik untuk ditabung."
            }
        }

        return { income, expense, topCat, summary, count: monthTrans.length }
    }, [transactions, selectedMonth])

    // --- Event Analysis Logic ---
    const eventStats = useMemo(() => {
        if (selectedEventId === "all") return null
        const event = events.find(e => e.id === selectedEventId)
        if (!event) return null

        const eventTrans = transactions.filter(t => t.eventId === selectedEventId)
        const expense = eventTrans.filter(t => t.type === "KELUAR").reduce((a, b) => a + b.amount, 0)
        const income = eventTrans.filter(t => t.type === "MASUK").reduce((a, b) => a + b.amount, 0)
        const remaining = event.budget - expense

        let summary = ""
        if (expense > event.budget) {
            summary = `⚠️ Over Budget! Pengeluaran telah melampaui anggaran sebesar ${formatCurrency(Math.abs(remaining))}.`
        } else if (expense > event.budget * 0.9) {
            summary = "⚠️ Kritis: Sisa budget tinggal sedikit (<10%). Hindari pengeluaran yang tidak perlu."
        } else {
            summary = "✅ Budget aman. Pengeluaran masih dalam batas rencana."
        }

        return { event, income, expense, remaining, summary, txCount: eventTrans.length }
    }, [transactions, events, selectedEventId])


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                    <BotIcon className="size-4" />
                    Analisis AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BotIcon className="size-5 text-indigo-600" />
                        AI Financial Analyst
                    </DialogTitle>
                    <DialogDescription>
                        Ringkasan otomatis performa keuangan Anda.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="monthly" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">Analisis Bulanan</TabsTrigger>
                        <TabsTrigger value="event">Analisis Acara</TabsTrigger>
                    </TabsList>

                    {/* === MONTHLY TAB === */}
                    <TabsContent value="monthly" className="space-y-4">
                        <div className="flex items-center gap-2 py-2">
                            <span className="text-sm font-medium">Pilih Periode:</span>
                            <input
                                type="month"
                                className="border rounded p-1 text-sm"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                        </div>

                        <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-100 text-indigo-900">
                            <h4 className="font-semibold flex items-center gap-2 mb-1">
                                <BotIcon className="size-4" />
                                Kesimpulan AI:
                            </h4>
                            <p className="text-sm">{monthlyStats.summary}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemasukan</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-lg font-bold text-green-600">{formatCurrency(monthlyStats.income)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-lg font-bold text-red-600">{formatCurrency(monthlyStats.expense)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {monthlyStats.topCat && (
                            <div className="flex items-center justify-between text-sm border-t pt-4">
                                <span className="text-muted-foreground">Pengeluaran Terbesar:</span>
                                <span className="font-medium">{monthlyStats.topCat[0]} ({formatCurrency(monthlyStats.topCat[1])})</span>
                            </div>
                        )}
                    </TabsContent>

                    {/* === EVENT TAB === */}
                    <TabsContent value="event" className="space-y-4">
                        <div className="py-2">
                            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Acara..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">-- Pilih Acara --</SelectItem>
                                    {events.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name} ({e.status})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {eventStats ? (
                            <>
                                <div className={`rounded-lg p-4 border ${eventStats.remaining < 0 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'}`}>
                                    <h4 className="font-semibold flex items-center gap-2 mb-1">
                                        {eventStats.remaining < 0 ? <AlertTriangleIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
                                        Analisis Budget:
                                    </h4>
                                    <p className="text-sm">{eventStats.summary}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Anggaran (Budget)</span>
                                        <span className="font-medium">{formatCurrency(eventStats.event.budget)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Aktual Pengeluaran</span>
                                        <span className="font-medium text-red-600">{formatCurrency(eventStats.expense)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-2 mt-2">
                                        <span className="font-medium">Sisa Budget</span>
                                        <span className={`font-bold ${eventStats.remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            {formatCurrency(eventStats.remaining)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <BotIcon className="size-8 mx-auto mb-2 opacity-20" />
                                <p>Pilih acara untuk melihat analisis AI</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
