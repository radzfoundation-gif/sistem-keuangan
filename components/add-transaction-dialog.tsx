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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { useTransactions } from "@/contexts/TransactionsContext"
import { useEvents } from "@/contexts/EventsContext"
import { useTreasurers } from "@/hooks/use-treasurers"
import { transactionSchema, type TransactionFormData } from "@/lib/validation"
import { generateNotaPDF } from "@/lib/nota-generator"
import { generateQRCode, generateTransactionQRData } from "@/lib/qrcode"
import { VoiceInput } from "@/components/voice-input"

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false)
  const { addTransaction } = useTransactions()
  const { events } = useEvents()
  const { treasurers, loading: loadingTreasurers } = useTreasurers()

  // Filter only planned or active events
  const activeEvents = events.filter(e => e.status !== "COMPLETED")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "KELUAR",
      amount: undefined as unknown as number, // Hack to show placeholder instead of 0
      category: "",
      description: "",
      treasurer: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  // Add eventId to validation schema might be needed in validation.ts, 
  // but for now we handle it as optional field that matches form data

  const handleVoiceData = (data: any) => {
    if (data.amount) setValue("amount", data.amount)
    if (data.category && data.category !== "Lainnya") setValue("category", data.category)
    if (data.type) setValue("type", data.type)
    if (data.description) setValue("description", data.description)
  }

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const transactionId = Date.now().toString()
      const newTransaction = {
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description,
        treasurer: data.treasurer,
        eventId: data.eventId, // Pass eventId specifically
        date: data.date,
      }

      addTransaction(newTransaction)

      // Generate QR code (for validation/testing only if needed)
      // const qrData = generateTransactionQRData({ ... })
      // const qrCodeDataURL = await generateQRCode(qrData)

      toast.success("Transaksi berhasil ditambahkan!", {
        description: `${data.type === "MASUK" ? "Pemasukan" : "Pengeluaran"} sebesar Rp ${data.amount.toLocaleString("id-ID")}`,
      })

      // Auto-generate nota PDF if checkbox is checked
      toast.success("Nota tersimpan di menu Nota", {
        description: "Anda bisa download nota kapan saja",
      })

      reset()
      setOpen(false)
    } catch (error) {
      toast.error("Gagal menambahkan transaksi", {
        description: "Terjadi kesalahan. Silakan coba lagi.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="size-4" />
          <span className="hidden sm:inline">Tambah Transaksi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {/* Place Voice Input ABOVE the form tag or inside it at the top */}
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
          <DialogDescription>Masukkan detail transaksi keuangan komunitas</DialogDescription>
        </DialogHeader>

        <div className="pt-4 px-1">
          <VoiceInput onTransactionDetected={handleVoiceData} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* ... inputs ... */}
            <div className="grid gap-2">
              <Label htmlFor="type">Tipe Transaksi</Label>
              <Select defaultValue="KELUAR" onValueChange={(value) => setValue("type", value as "MASUK" | "KELUAR")}>
                <SelectTrigger id="type">
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
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Nominal</Label>
              <Input
                id="amount"
                type="number"
                placeholder="150000"
                className="font-mono"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger id="category">
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
              <Label htmlFor="description">Keterangan</Label>
              <Input id="description" placeholder="Contoh: Bayar listrik bulan Desember" {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="treasurer">Nama Bendahara</Label>
              <Select onValueChange={(value) => setValue("treasurer", value)}>
                <SelectTrigger id="treasurer">
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

            <div className="grid gap-2">
              <Label htmlFor="event">Acara (Opsional)</Label>
              <Select onValueChange={(value) => setValue("eventId", value === "none" ? undefined : value)}>
                <SelectTrigger id="event">
                  <SelectValue placeholder="Pilih acara..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Tidak ada acara --</SelectItem>
                  {activeEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Removed auto-download checkbox */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
