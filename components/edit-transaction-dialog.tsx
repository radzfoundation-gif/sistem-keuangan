"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useTransactions, type Transaction } from "@/contexts/TransactionsContext"
import { useTreasurers } from "@/hooks/use-treasurers"
import { transactionSchema, type TransactionFormData } from "@/lib/validation"

interface EditTransactionDialogProps {
    transaction: Transaction
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
    const { updateTransaction } = useTransactions()
    const { treasurers, loading: loadingTreasurers } = useTreasurers()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            treasurer: transaction.treasurer,
            date: transaction.date || new Date().toISOString().split("T")[0],
        },
    })

    const onSubmit = async (data: TransactionFormData) => {
        try {
            updateTransaction(transaction.id, {
                type: data.type,
                amount: data.amount,
                category: data.category,
                description: data.description,
                treasurer: data.treasurer,
                date: data.date,
            })

            toast.success("Transaksi berhasil diupdate!", {
                description: `Data transaksi telah diperbarui`,
            })

            onOpenChange(false)
        } catch (error) {
            toast.error("Gagal mengupdate transaksi", {
                description: "Terjadi kesalahan. Silakan coba lagi.",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Transaksi</DialogTitle>
                        <DialogDescription>Ubah detail transaksi keuangan komunitas</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">Tipe Transaksi</Label>
                            <Select
                                defaultValue={transaction.type}
                                onValueChange={(value) => setValue("type", value as "MASUK" | "KELUAR")}
                            >
                                <SelectTrigger id="edit-type">
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MASUK">Pemasukan</SelectItem>
                                    <SelectItem value="KELUAR">Pengeluaran</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-date">Tanggal</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                {...register("date")}
                            />
                            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-amount">Nominal</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                placeholder="150000"
                                className="font-mono"
                                {...register("amount", { valueAsNumber: true })}
                            />
                            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Kategori</Label>
                            <Select defaultValue={transaction.category} onValueChange={(value) => setValue("category", value)}>
                                <SelectTrigger id="edit-category">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Iuran Anggota">Iuran Anggota</SelectItem>
                                    <SelectItem value="Donasi">Donasi</SelectItem>
                                    <SelectItem value="Operasional">Operasional</SelectItem>
                                    <SelectItem value="Konsumsi">Konsumsi</SelectItem>
                                    <SelectItem value="Perlengkapan">Perlengkapan</SelectItem>
                                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Keterangan</Label>
                            <Input
                                id="edit-description"
                                placeholder="Contoh: Bayar listrik bulan Desember"
                                {...register("description")}
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-treasurer">Nama Bendahara</Label>
                            <Select
                                defaultValue={transaction.treasurer}
                                onValueChange={(value) => setValue("treasurer", value)}
                            >
                                <SelectTrigger id="edit-treasurer">
                                    <SelectValue placeholder={loadingTreasurers ? "Memuat..." : "Pilih bendahara"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {treasurers.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.treasurer && <p className="text-sm text-destructive">{errors.treasurer.message}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Update Transaksi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
