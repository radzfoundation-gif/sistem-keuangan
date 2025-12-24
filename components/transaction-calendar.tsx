"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useTransactions } from "@/contexts/TransactionsContext"
import { formatCurrency } from "@/lib/currency"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from "lucide-react"

export function TransactionCalendar() {
    const { transactions } = useTransactions()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedTransactions, setSelectedTransactions] = useState<typeof transactions>([])

    // Create modifiers for dates with transactions
    const hasIncome = (date: Date) => {
        return transactions.some(t => {
            const tDate = new Date(t.date)
            return tDate.getDate() === date.getDate() &&
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear() &&
                t.type === "MASUK"
        })
    }

    const hasExpense = (date: Date) => {
        return transactions.some(t => {
            const tDate = new Date(t.date)
            return tDate.getDate() === date.getDate() &&
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear() &&
                t.type === "KELUAR"
        })
    }

    const handleSelect = (newDate: Date | undefined) => {
        setDate(newDate)
        if (newDate) {
            const dailyTransactions = transactions.filter(t => {
                const tDate = new Date(t.date)
                return tDate.getDate() === newDate.getDate() &&
                    tDate.getMonth() === newDate.getMonth() &&
                    tDate.getFullYear() === newDate.getFullYear()
            })

            if (dailyTransactions.length > 0) {
                setSelectedTransactions(dailyTransactions)
                setDialogOpen(true)
            }
        }
    }

    return (
        <>
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="size-5" />
                        Kalender Transaksi
                    </CardTitle>
                    <CardDescription>Klik tanggal bertanda untuk melihat detail</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-2 sm:p-6">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        className="rounded-md border shadow-sm"
                        modifiers={{
                            income: (date) => hasIncome(date),
                            expense: (date) => hasExpense(date)
                        }}
                        modifiersStyles={{
                            income: { borderBottom: '2px solid #22c55e' },
                            expense: { borderBottom: '2px solid #ef4444' }
                        }}
                    />
                </CardContent>
                <div className="pb-4 px-6 flex justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Pemasukan
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Pengeluaran
                    </div>
                </div>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            Transaksi {date?.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </DialogTitle>
                        <DialogDescription>
                            Daftar aktivitas keuangan pada tanggal ini.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Daily Summary */}
                    {(() => {
                        const dailyIncome = selectedTransactions.filter(t => t.type === "MASUK").reduce((acc, t) => acc + t.amount, 0)
                        const dailyExpense = selectedTransactions.filter(t => t.type === "KELUAR").reduce((acc, t) => acc + t.amount, 0)
                        const dailyNet = dailyIncome - dailyExpense

                        return (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-green-50 p-2.5 rounded-lg border border-green-100">
                                    <p className="text-[10px] text-green-700 font-medium uppercase tracking-wider">Pemasukan</p>
                                    <p className="text-sm font-bold text-green-700 truncate" title={formatCurrency(dailyIncome)}>
                                        {formatCurrency(dailyIncome)}
                                    </p>
                                </div>
                                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                                    <p className="text-[10px] text-red-700 font-medium uppercase tracking-wider">Pengeluaran</p>
                                    <p className="text-sm font-bold text-red-700 truncate" title={formatCurrency(dailyExpense)}>
                                        {formatCurrency(dailyExpense)}
                                    </p>
                                </div>
                                <div className={`p-2.5 rounded-lg border ${dailyNet >= 0 ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                                    <p className="text-[10px] font-medium uppercase tracking-wider">Selisih (Net)</p>
                                    <p className="text-sm font-bold truncate" title={formatCurrency(dailyNet)}>
                                        {dailyNet > 0 ? "+" : ""}{formatCurrency(dailyNet)}
                                    </p>
                                </div>
                            </div>
                        )
                    })()}

                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {selectedTransactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{t.description}</p>
                                    <p className="text-xs text-muted-foreground">{t.category} • {t.treasurer}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant={t.type === "MASUK" ? "outline" : "secondary"} className="text-[10px] h-5">
                                        {t.type}
                                    </Badge>
                                    <span className={`text-sm font-bold ${t.type === "MASUK" ? "text-green-600" : "text-red-600"}`}>
                                        {t.type === "MASUK" ? "+" : "-"} {formatCurrency(t.amount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
