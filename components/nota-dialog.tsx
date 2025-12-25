"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type Transaction } from "@/contexts/TransactionsContext"
import { formatCurrency } from "@/lib/currency"
import { generateNotaPDF } from "@/lib/nota-generator"
import { generateQRCode, generateTransactionQRData } from "@/lib/qrcode"
import { DownloadIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Image from "next/image"

interface NotaDialogProps {
    transaction: Transaction | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NotaDialog({ transaction, open, onOpenChange }: NotaDialogProps) {
    const [qrCodeData, setQrCodeData] = useState<string>("")
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        if (transaction && open) {
            const generateQR = async () => {
                const data = generateTransactionQRData(transaction)
                const qrImage = await generateQRCode(data)
                setQrCodeData(qrImage)
            }
            generateQR()
        }
    }, [transaction, open])

    if (!transaction) return null

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            await generateNotaPDF(transaction)
            toast.success("Nota berhasil didownload")
        } catch (error) {
            toast.error("Gagal mendownload nota")
        } finally {
            setIsDownloading(false)
        }
    }

    const isIncome = transaction.type === "MASUK"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[400px] p-0 overflow-hidden gap-0">
                <DialogHeader className="bg-black text-white p-6 rounded-t-lg">
                    <DialogTitle className="text-center text-xl tracking-wider">NOTA TRANSAKSI</DialogTitle>
                    <DialogDescription className="text-center text-white/70 text-xs">
                        Sistem Keuangan Komunitas
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6 bg-white">
                    {/* Badge & Date */}
                    <div className="flex justify-between items-center">
                        <div className={`px-4 py-1.5 rounded text-white text-xs font-bold tracking-wide ${isIncome ? "bg-emerald-600" : "bg-rose-600"
                            }`}>
                            {transaction.type}
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Tanggal</div>
                            <div className="font-medium text-foreground">
                                {new Date(transaction.date).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border border-dashed" />

                    {/* Details */}
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold text-muted-foreground">ID Transaksi</span>
                            <span className="col-span-2 font-mono text-xs mt-0.5">{transaction.id}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold text-muted-foreground">Kategori</span>
                            <span className="col-span-2">{transaction.category}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold text-muted-foreground">Keterangan</span>
                            <span className="col-span-2">{transaction.description}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-semibold text-muted-foreground">Bendahara</span>
                            <span className="col-span-2">{transaction.treasurer}</span>
                        </div>
                    </div>

                    {/* Nominal Box */}
                    <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center gap-1 border">
                        <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Nominal</span>
                        <span className={`text-2xl font-bold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                            {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                        </span>
                    </div>

                    {/* QR Code */}
                    {qrCodeData && (
                        <div className="flex flex-col items-center gap-2 pt-2">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Kode Verifikasi</p>
                            <div className="bg-white p-2 rounded-lg border shadow-sm">
                                <Image src={qrCodeData} alt="QR Code" width={100} height={100} className="size-24" />
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center max-w-[200px]">
                                Scan QR code untuk verifikasi transaksi ini secara digital
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 bg-muted/20 border-t">
                    <Button onClick={handleDownload} disabled={isDownloading} className="w-full gap-2">
                        <DownloadIcon className="size-4" />
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
