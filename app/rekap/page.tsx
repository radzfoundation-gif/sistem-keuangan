"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTransactions, type Transaction } from "@/contexts/TransactionsContext"
import { formatCurrency } from "@/lib/currency"
import { WalletIcon, FileTextIcon, EyeIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { generateNotaPDF } from "@/lib/nota-generator"
import { NotaDialog } from "@/components/nota-dialog"
import { useState, useEffect } from "react"
import { useTreasurers } from "@/hooks/use-treasurers"

export default function RekapPage() {
    const { transactions, isLoading } = useTransactions()
    const { treasurers } = useTreasurers()
    const [notaDialogOpen, setNotaDialogOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [currentDate, setCurrentDate] = useState("")

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }))
    }, [])

    // Calulate All Time Totals
    const totalIncome = transactions
        .filter(t => t.type === "MASUK")
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
        .filter(t => t.type === "KELUAR")
        .reduce((sum, t) => sum + t.amount, 0)

    const totalSaldo = totalIncome - totalExpense

    // Group Transactions by Month
    const groupedTransactions: Record<string, Transaction[]> = {}

    transactions.forEach(transaction => {
        const date = new Date(transaction.date)
        const monthYear = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })

        if (!groupedTransactions[monthYear]) {
            groupedTransactions[monthYear] = []
        }
        groupedTransactions[monthYear].push(transaction)
    })

    // Sort months (newest first)
    // We can't rely just on string sort. We need to grab one transaction from each group to check date, or parse the key.
    // Easier approach: Get keys, map to object with date, sort by date desc.
    const sortedGroups = Object.keys(groupedTransactions).sort((a, b) => {
        // Compare by the date of the first transaction in the group (since they are all in same month)
        // Transactions context typically returns sorted by date desc already, but let's be safe.
        // If the context isn't sorted, we might need robust parsing.
        // Assuming context is sorted desc:
        const dateA = new Date(groupedTransactions[a][0].date)
        const dateB = new Date(groupedTransactions[b][0].date)
        return dateB.getTime() - dateA.getTime()
    })

    const handleViewNota = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setNotaDialogOpen(true)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p>Memuat data transaksi...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header & Navigation */}
                <div className="flex items-center gap-4">
                    <div className="relative size-12 overflow-hidden rounded-md border">
                        <Image src="/logo-dhananjaya-new.jpg" alt="Logo" fill className="object-contain p-0.5 bg-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Rekapitulasi Keuangan</h1>
                        <p className="text-muted-foreground">Komunitas Seni Dhananjaya</p>
                    </div>
                </div>

                {/* Total Saldo Card */}
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium opacity-90">
                            Total Saldo Saat Ini
                            {currentDate && (
                                <span className="ml-2 text-sm font-normal opacity-75">
                                    (Per {currentDate})
                                </span>
                            )}
                        </CardTitle>
                        <WalletIcon className="size-5 opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{formatCurrency(totalSaldo)}</div>
                        <div className="mt-2 text-sm opacity-80 flex gap-4">
                            <span>Total Masuk: {formatCurrency(totalIncome)}</span>
                            <span>•</span>
                            <span>Total Keluar: {formatCurrency(totalExpense)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Grouped Transactions */}
                <div className="space-y-8">
                    {sortedGroups.map(monthYear => (
                        <div key={monthYear} className="space-y-4">
                            <h2 className="text-xl font-semibold border-b pb-2">{monthYear}</h2>
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Tipe</TableHead>
                                                <TableHead>Kategori</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                                <TableHead className="text-right">Nominal</TableHead>
                                                <TableHead>Bendahara</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedTransactions[monthYear].map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-mono text-sm whitespace-nowrap">
                                                        {new Date(transaction.date).toLocaleDateString("id-ID", {
                                                            day: "2-digit",
                                                            month: "short",
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={transaction.type === "MASUK" ? "default" : "secondary"}
                                                            className={
                                                                transaction.type === "MASUK"
                                                                    ? "bg-emerald-600 hover:bg-emerald-700 border-transparent text-white"
                                                                    : "bg-rose-600 hover:bg-rose-700 border-transparent text-white"
                                                            }
                                                        >
                                                            {transaction.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium whitespace-nowrap">{transaction.category}</TableCell>
                                                    <TableCell className="max-w-[300px] truncate">{transaction.description}</TableCell>
                                                    <TableCell
                                                        className={`text-right font-semibold whitespace-nowrap ${transaction.type === "MASUK" ? "text-emerald-600" : "text-rose-600"
                                                            }`}
                                                    >
                                                        {transaction.type === "MASUK" ? "+" : "-"} {formatCurrency(transaction.amount)}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">{transaction.treasurer}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => handleViewNota(transaction)}
                                                            title="Lihat Nota"
                                                        >
                                                            <FileTextIcon className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

                    {transactions.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            Belum ada transaksi yang tercatat
                        </div>
                    )}
                </div>
                <NotaDialog
                    transaction={selectedTransaction}
                    open={notaDialogOpen}
                    onOpenChange={setNotaDialogOpen}
                />

                <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Komunitas Seni Dhananjaya. All rights reserved.</p>
                    <p className="text-xs mt-1">Sistem Keuangan & Laporan Digital Dhananjaya</p>
                </footer>
            </div>
        </div>
    )
}
