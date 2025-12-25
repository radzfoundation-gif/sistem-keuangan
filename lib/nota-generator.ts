import jsPDF from "jspdf"
import type { Transaction } from "@/contexts/TransactionsContext"
import { formatCurrency } from "./currency"
import { generateQRCode, generateTransactionQRData } from "./qrcode"

export async function generateNotaPDF(transaction: Transaction): Promise<void> {
    const doc = new jsPDF()

    // Generate QR Code
    const qrData = generateTransactionQRData(transaction)
    const qrCodeImage = await generateQRCode(qrData)

    // ===== PROFESSIONAL LETTERHEAD =====

    // Border dekoratif atas
    doc.setLineWidth(0.5)
    doc.setDrawColor(41, 128, 185) // Biru
    doc.line(10, 10, 200, 10)
    doc.setLineWidth(0.2)
    doc.line(10, 11, 200, 11)

    // Logo Dhananjaya (dari file)
    try {
        // Load logo dari public folder
        const logoImg = '/logo-dhananjaya-nota.jpg'
        doc.addImage(logoImg, 'JPEG', 15, 15, 20, 20) // x, y, width, height
    } catch (error) {
        // Fallback jika logo tidak ditemukan - gunakan circle
        doc.setFillColor(41, 128, 185)
        doc.circle(25, 25, 8, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text("D", 25, 27, { align: "center" })
    }

    // Nama Organisasi
    doc.setTextColor(41, 128, 185)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("KOMUNITAS DHANANJAYA", 45, 22)

    // Subtitle & Informasi
    doc.setTextColor(80, 80, 80)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("Sistem Manajemen Keuangan Terintegrasi", 45, 28)

    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("📧 info@dhananjaya.org  |  📞 +62 xxx-xxxx-xxxx  |  🌐 www.dhananjaya.org", 45, 33)

    // Border bawah header
    doc.setLineWidth(0.3)
    doc.setDrawColor(41, 128, 185)
    doc.line(10, 38, 200, 38)
    doc.setDrawColor(200, 200, 200)
    doc.line(10, 39, 200, 39)

    // ===== DOCUMENT TITLE =====
    doc.setFillColor(41, 128, 185)
    doc.rect(10, 45, 190, 12, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("NOTA TRANSAKSI KEUANGAN", 105, 53, { align: "center" })

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // ===== TRANSACTION INFO BOX =====
    // Transaction Type Badge & Nomor Nota
    const isIncome = transaction.type === "MASUK"

    // Type Badge
    doc.setFillColor(isIncome ? 34 : 220, isIncome ? 197 : 38, isIncome ? 94 : 38)
    doc.roundedRect(15, 64, 50, 10, 2, 2, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text(transaction.type, 40, 70, { align: "center" })

    // Nomor Nota
    doc.setTextColor(80, 80, 80)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("No. Nota:", 135, 68)
    doc.setFont("helvetica", "normal")
    doc.text(`NT-${transaction.id.substring(0, 8)}`, 135, 72)

    // Date
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const formattedDate = new Date(transaction.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
    doc.text(`Tanggal: ${formattedDate}`, 195, 70, { align: "right" })

    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(15, 78, 195, 78)

    // Transaction Details
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    let yPos = 85

    doc.text("DETAIL TRANSAKSI", 15, yPos)
    yPos += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    // ID Transaksi
    doc.setFont("helvetica", "bold")
    doc.text("ID Transaksi:", 15, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(transaction.id, 60, yPos)
    yPos += 8

    // Kategori
    doc.setFont("helvetica", "bold")
    doc.text("Kategori:", 15, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(transaction.category, 60, yPos)
    yPos += 8

    // Keterangan
    doc.setFont("helvetica", "bold")
    doc.text("Keterangan:", 15, yPos)
    doc.setFont("helvetica", "normal")
    const descLines = doc.splitTextToSize(transaction.description, 120)
    doc.text(descLines, 60, yPos)
    yPos += descLines.length * 6 + 2

    // Bendahara
    doc.setFont("helvetica", "bold")
    doc.text("Bendahara:", 15, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(transaction.treasurer, 60, yPos)
    yPos += 15

    // Amount Box
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(15, yPos, 180, 25, 3, 3, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    doc.text("NOMINAL", 25, yPos + 8)

    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    const amountText = `${isIncome ? "+" : "-"} ${formatCurrency(transaction.amount)}`
    doc.text(amountText, 185, yPos + 16, { align: "right" })

    yPos += 35

    // QR Code
    if (qrCodeImage) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)
        doc.text("SCAN QR CODE", 105, yPos, { align: "center" })
        doc.addImage(qrCodeImage, "PNG", 80, yPos + 5, 50, 50)
        yPos += 60

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 120)
        doc.text("Scan untuk melihat detail transaksi di halaman rekap", 105, yPos, { align: "center" })
    }

    // Footer
    doc.setDrawColor(200, 200, 200)
    doc.line(15, 270, 195, 270)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text("Dokumen ini dihasilkan secara otomatis oleh sistem", 105, 275, { align: "center" })
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 105, 280, { align: "center" })

    // Save PDF
    const fileName = `Nota_${transaction.type}_${transaction.id}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
}

export async function generateBulkNotaPDF(transactions: Transaction[]): Promise<void> {
    const doc = new jsPDF()
    let isFirstPage = true

    for (const transaction of transactions) {
        if (!isFirstPage) {
            doc.addPage()
        }
        isFirstPage = false

        // Generate QR Code
        const qrData = generateTransactionQRData(transaction)
        const qrCodeImage = await generateQRCode(qrData)

        // ===== PROFESSIONAL LETTERHEAD =====

        // Border dekoratif atas
        doc.setLineWidth(0.5)
        doc.setDrawColor(41, 128, 185)
        doc.line(10, 10, 200, 10)
        doc.setLineWidth(0.2)
        doc.line(10, 11, 200, 11)

        // Logo Dhananjaya (dari file)
        try {
            const logoImg = '/logo-dhananjaya-nota.jpg'
            doc.addImage(logoImg, 'JPEG', 15, 15, 20, 20)
        } catch (error) {
            doc.setFillColor(41, 128, 185)
            doc.circle(25, 25, 8, "F")
            doc.setTextColor(255, 255, 255)
            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.text("D", 25, 27, { align: "center" })
        }

        // Nama Organisasi
        doc.setTextColor(41, 128, 185)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(18)
        doc.text("KOMUNITAS DHANANJAYA", 45, 22)

        // Subtitle & Informasi
        doc.setTextColor(80, 80, 80)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.text("Sistem Manajemen Keuangan Terintegrasi", 45, 28)

        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text("📧 info@dhananjaya.org  |  📞 +62 xxx-xxxx-xxxx  |  🌐 www.dhananjaya.org", 45, 33)

        // Border bawah header
        doc.setLineWidth(0.3)
        doc.setDrawColor(41, 128, 185)
        doc.line(10, 38, 200, 38)
        doc.setDrawColor(200, 200, 200)
        doc.line(10, 39, 200, 39)

        // ===== DOCUMENT TITLE =====
        doc.setFillColor(41, 128, 185)
        doc.rect(10, 45, 190, 12, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.text("NOTA TRANSAKSI KEUANGAN", 105, 53, { align: "center" })

        doc.setTextColor(0, 0, 0)

        // Transaction Type Badge
        const isIncome = transaction.type === "MASUK"
        doc.setFillColor(isIncome ? 34 : 220, isIncome ? 197 : 38, isIncome ? 94 : 38)
        doc.roundedRect(15, 64, 50, 10, 2, 2, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.text(transaction.type, 40, 70, { align: "center" })

        // Nomor Nota
        doc.setTextColor(80, 80, 80)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("No. Nota:", 135, 68)
        doc.setFont("helvetica", "normal")
        doc.text(`NT-${transaction.id.substring(0, 8)}`, 135, 72)

        // Date
        doc.setTextColor(100, 100, 100)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        const formattedDate = new Date(transaction.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        doc.text(`Tanggal: ${formattedDate}`, 195, 70, { align: "right" })

        doc.setDrawColor(200, 200, 200)
        doc.line(15, 78, 195, 78)

        // Details
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        let yPos = 85

        doc.text("DETAIL TRANSAKSI", 15, yPos)
        yPos += 10

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)

        doc.setFont("helvetica", "bold")
        doc.text("ID Transaksi:", 15, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(transaction.id, 60, yPos)
        yPos += 8

        doc.setFont("helvetica", "bold")
        doc.text("Kategori:", 15, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(transaction.category, 60, yPos)
        yPos += 8

        doc.setFont("helvetica", "bold")
        doc.text("Keterangan:", 15, yPos)
        doc.setFont("helvetica", "normal")
        const descLines = doc.splitTextToSize(transaction.description, 120)
        doc.text(descLines, 60, yPos)
        yPos += descLines.length * 6 + 2

        doc.setFont("helvetica", "bold")
        doc.text("Bendahara:", 15, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(transaction.treasurer, 60, yPos)
        yPos += 15

        // Amount Box
        doc.setFillColor(245, 245, 245)
        doc.roundedRect(15, yPos, 180, 25, 3, 3, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setTextColor(80, 80, 80)
        doc.text("NOMINAL", 25, yPos + 8)

        doc.setFontSize(18)
        doc.setTextColor(0, 0, 0)
        const amountText = `${isIncome ? "+" : "-"} ${formatCurrency(transaction.amount)}`
        doc.text(amountText, 185, yPos + 16, { align: "right" })

        yPos += 35

        // QR Code
        if (qrCodeImage) {
            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.setTextColor(80, 80, 80)
            doc.text("SCAN QR CODE", 105, yPos, { align: "center" })
            doc.addImage(qrCodeImage, "PNG", 80, yPos + 5, 50, 50)
            yPos += 60

            doc.setFont("helvetica", "normal")
            doc.setFontSize(8)
            doc.setTextColor(120, 120, 120)
            doc.text("Scan untuk melihat detail transaksi di halaman rekap", 105, yPos, { align: "center" })
        }

        // Footer
        doc.setDrawColor(200, 200, 200)
        doc.line(15, 270, 195, 270)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 120)
        doc.text("Dokumen ini dihasilkan secara otomatis oleh sistem", 105, 275, { align: "center" })
        doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 105, 280, { align: "center" })
    }

    // Save PDF
    const fileName = `Nota_Bulk_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
}
