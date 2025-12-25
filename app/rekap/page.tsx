"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTransactions, type Transaction } from "@/contexts/TransactionsContext"
import { formatCurrency } from "@/lib/currency"
import { WalletIcon, FileTextIcon, EyeIcon, Loader2, MessageCircleIcon, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { generateNotaPDF } from "@/lib/nota-generator"
import { NotaDialog } from "@/components/nota-dialog"
import { CommentDialog } from "@/components/comment-dialog"
import { ImageViewerDialog } from "@/components/image-viewer-dialog"
import { useState, useEffect } from "react"
import { useTreasurers } from "@/hooks/use-treasurers"

export default function RekapPage() {
    const { transactions, isLoading, addComment } = useTransactions()
    const { treasurers } = useTreasurers()
    const [notaDialogOpen, setNotaDialogOpen] = useState(false)
    const [commentDialogOpen, setCommentDialogOpen] = useState(false)
    const [imageDialogOpen, setImageDialogOpen] = useState(false)
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

    // Group Transactions by Category
    const groupedTransactions: Record<string, Transaction[]> = {}

    transactions.forEach(transaction => {
        const category = transaction.category

        if (!groupedTransactions[category]) {
            groupedTransactions[category] = []
        }
        groupedTransactions[category].push(transaction)
    })

    // Sort categories alphabetically
    const sortedCategories = Object.keys(groupedTransactions).sort((a, b) => a.localeCompare(b, 'id'))

    // Calculate total per category
    const getCategoryTotal = (category: string) => {
        const categoryTransactions = groupedTransactions[category]
        const income = categoryTransactions.filter(t => t.type === "MASUK").reduce((sum, t) => sum + t.amount, 0)
        const expense = categoryTransactions.filter(t => t.type === "KELUAR").reduce((sum, t) => sum + t.amount, 0)
        return { income, expense, total: income - expense }
    }

    const handleViewNota = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setNotaDialogOpen(true)
    }

    const handleViewComments = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setCommentDialogOpen(true)
    }

    const handleAddComment = async (name: string, text: string) => {
        if (selectedTransaction) {
            await addComment(selectedTransaction.id, { name, text })
        }
    }

    const handleViewImage = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setImageDialogOpen(true)
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

                {/* Grouped Transactions by Category */}
                <div className="space-y-8">
                    {sortedCategories.map(category => {
                        const categoryStats = getCategoryTotal(category)
                        const transactionCount = groupedTransactions[category].length

                        return (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold">{category}</h2>
                                        <Badge variant="secondary" className="font-normal">
                                            {transactionCount} transaksi
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-x-4">
                                        {categoryStats.income > 0 && (
                                            <span className="text-emerald-600 font-medium">
                                                +{formatCurrency(categoryStats.income)}
                                            </span>
                                        )}
                                        {categoryStats.expense > 0 && (
                                            <span className="text-rose-600 font-medium">
                                                -{formatCurrency(categoryStats.expense)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Card>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tanggal</TableHead>
                                                    <TableHead>Tipe</TableHead>
                                                    <TableHead>Keterangan</TableHead>
                                                    <TableHead className="text-right">Nominal</TableHead>
                                                    <TableHead>Bendahara</TableHead>
                                                    <TableHead className="text-center w-[100px]">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {groupedTransactions[category].map((transaction) => (
                                                    <TableRow key={transaction.id}>
                                                        <TableCell className="font-mono text-sm whitespace-nowrap">
                                                            {new Date(transaction.date).toLocaleDateString("id-ID", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
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
                                                        <TableCell className="max-w-[300px] truncate">{transaction.description}</TableCell>
                                                        <TableCell
                                                            className={`text-right font-semibold whitespace-nowrap ${transaction.type === "MASUK" ? "text-emerald-600" : "text-rose-600"
                                                                }`}
                                                        >
                                                            {transaction.type === "MASUK" ? "+" : "-"} {formatCurrency(transaction.amount)}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-sm">{transaction.treasurer}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    onClick={() => handleViewNota(transaction)}
                                                                    title="Lihat Nota"
                                                                >
                                                                    <FileTextIcon className="size-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    onClick={() => handleViewComments(transaction)}
                                                                    title="Komentar"
                                                                    className="relative"
                                                                >
                                                                    <MessageCircleIcon className="size-4" />
                                                                    {transaction.comments && transaction.comments.length > 0 && (
                                                                        <span className="absolute -top-1 -right-1 size-4 text-[10px] bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                                                                            {transaction.comments.length}
                                                                        </span>
                                                                    )}
                                                                </Button>
                                                                {transaction.imageUrl && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon-sm"
                                                                        onClick={() => handleViewImage(transaction)}
                                                                        title="Lihat Foto"
                                                                        className="text-blue-600 hover:text-blue-700"
                                                                    >
                                                                        <ImageIcon className="size-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    })}

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
                <CommentDialog
                    transaction={selectedTransaction}
                    open={commentDialogOpen}
                    onOpenChange={setCommentDialogOpen}
                    onAddComment={handleAddComment}
                />

                <ImageViewerDialog
                    imageUrl={selectedTransaction?.imageUrl || null}
                    open={imageDialogOpen}
                    onOpenChange={setImageDialogOpen}
                    description={selectedTransaction?.description}
                />

                <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Komunitas Seni Dhananjaya. All rights reserved.</p>
                    <p className="text-xs mt-1">Sistem Keuangan & Laporan Digital Dhananjaya</p>
                </footer>
            </div>
        </div>
    )
}
