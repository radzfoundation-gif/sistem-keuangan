"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { DownloadIcon, FileTextIcon, FilterIcon, MoreVerticalIcon, QrCodeIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"
import { useTransactions, type Transaction } from "@/contexts/TransactionsContext"
import { formatCurrency } from "@/lib/currency"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { generateNotaPDF, generateBulkNotaPDF } from "@/lib/nota-generator"
import { generateQRCode, generateTransactionQRData } from "@/lib/qrcode"

export function TransactionTable() {
  const { transactions, deleteTransaction } = useTransactions()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.treasurer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const exportToCSV = () => {
    const headers = ["Tanggal", "Tipe", "Nominal", "Kategori", "Keterangan", "Bendahara"]
    const rows = filteredTransactions.map((t) => [t.date, t.type, t.amount, t.category, t.description, t.treasurer])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `transaksi_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    toast.success("CSV berhasil diexport!")
  }

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete)
      toast.success("Transaksi berhasil dihapus")
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
  }

  const handleEditClick = (transaction: Transaction) => {
    setTransactionToEdit(transaction)
    setEditDialogOpen(true)
  }

  const handleDownloadNota = async (transaction: Transaction) => {
    try {
      await generateNotaPDF(transaction)
      toast.success("Nota berhasil didownload!", {
        description: `Nota transaksi ${transaction.id} telah diunduh dalam format PDF`,
      })
    } catch (error) {
      toast.error("Gagal mendownload nota", {
        description: "Terjadi kesalahan saat membuat PDF",
      })
    }
  }

  const handleDownloadQR = async (transaction: Transaction) => {
    try {
      const qrData = generateTransactionQRData(transaction)
      const qrCodeImage = await generateQRCode(qrData)

      // Download QR code as image
      const link = document.createElement("a")
      link.href = qrCodeImage
      link.download = `QR_${transaction.id}_${new Date().toISOString().split("T")[0]}.png`
      link.click()

      toast.success("QR Code berhasil didownload!")
    } catch (error) {
      toast.error("Gagal mendownload QR Code")
    }
  }

  const exportAllFormats = async () => {
    try {
      // 1. Export CSV
      const headers = ["Tanggal", "Tipe", "Nominal", "Kategori", "Keterangan", "Bendahara"]
      const rows = filteredTransactions.map((t) => [t.date, t.type, t.amount, t.category, t.description, t.treasurer])
      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `transaksi_${new Date().toISOString().split("T")[0]}.csv`
      link.click()

      // 2. Generate bulk nota PDF
      if (filteredTransactions.length > 0) {
        await generateBulkNotaPDF(filteredTransactions)
      }

      toast.success("Export berhasil!", {
        description: `CSV dan Nota PDF (${filteredTransactions.length} transaksi) telah didownload`,
      })
    } catch (error) {
      toast.error("Gagal export data")
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="default" className="flex-1 sm:flex-initial bg-transparent">
              <FilterIcon className="size-4" />
              Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="flex-1 sm:flex-initial bg-transparent">
                  <DownloadIcon className="size-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <DownloadIcon className="size-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAllFormats}>
                  <FileTextIcon className="size-4 mr-2" />
                  Export CSV + Nota PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="border rounded-lg w-full overflow-x-auto">
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
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "Tidak ada transaksi yang cocok dengan pencarian" : "Belum ada transaksi"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
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
                          transaction.type === "MASUK" ? "bg-foreground text-background hover:bg-foreground/90" : ""
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                    <TableCell
                      className={`text-right font-semibold ${transaction.type === "MASUK" ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      {transaction.type === "MASUK" ? "+" : "-"} {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{transaction.treasurer}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownloadNota(transaction)}>
                            <FileTextIcon className="size-4 mr-2" />
                            Download Nota
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadQR(transaction)}>
                            <QrCodeIcon className="size-4 mr-2" />
                            Download QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(transaction)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(transaction.id)}>
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus secara permanen dari data keuangan.
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

      {/* Edit Dialog */}
      {transactionToEdit && (
        <EditTransactionDialog
          transaction={transactionToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  )
}
