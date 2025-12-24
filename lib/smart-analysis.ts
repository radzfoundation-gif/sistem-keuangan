import { formatCurrency } from "./currency"

export interface AnalysisResult {
    summary: string
    trend: "UP" | "DOWN" | "STABLE"
    insight: string
    advice: string
    score: number // 1-100 financial health score
}

interface Transaction {
    amount: number
    type: "MASUK" | "KELUAR"
    category: string
    date: string
}

export function generateSmartAnalysis(transactions: Transaction[]): AnalysisResult {
    if (transactions.length === 0) {
        return {
            summary: "Belum ada data cukup untuk analisis.",
            trend: "STABLE",
            insight: "Mulai catat transaksi untuk mendapatkan insight kecerdasan buatan.",
            advice: "Catat setiap pengeluaran kecil untuk akurasi data.",
            score: 50
        }
    }

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Filter current month transactions
    const thisMonthTrans = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    // Filter last month transactions
    const lastMonthTrans = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) &&
            d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear)
    })

    const thisMonthIncome = thisMonthTrans.filter(t => t.type === "MASUK").reduce((a, b) => a + b.amount, 0)
    const thisMonthExpense = thisMonthTrans.filter(t => t.type === "KELUAR").reduce((a, b) => a + b.amount, 0)
    const lastMonthExpense = lastMonthTrans.filter(t => t.type === "KELUAR").reduce((a, b) => a + b.amount, 0)

    // Calculate Trend
    let trend: "UP" | "DOWN" | "STABLE" = "STABLE"
    let summary = "Pengeluaran Anda stabil."

    if (thisMonthExpense > lastMonthExpense && lastMonthExpense > 0) {
        const percent = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100
        trend = "UP"
        summary = `Pengeluaran bulan ini naik ${percent.toFixed(0)}% dibanding bulan lalu.`
    } else if (thisMonthExpense < lastMonthExpense) {
        const percent = ((lastMonthExpense - thisMonthExpense) / lastMonthExpense) * 100
        trend = "DOWN"
        summary = `Hebat! Pengeluaran turun ${percent.toFixed(0)}% bulan ini.`
    }

    // Find Top Expense Category
    const expenseByCategory: Record<string, number> = {}
    thisMonthTrans.filter(t => t.type === "KELUAR").forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
    })

    const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]

    let insight = "Pola pengeluaran Anda terlihat wajar."
    if (topCategory) {
        insight = `Fokus utama pengeluaran bulan ini ada pada ${topCategory[0]} (${formatCurrency(topCategory[1])}).`
    }

    // Generate Advice
    let advice = "Pertahankan kebiasaan mencatat transaksi."
    let score = 80

    const ratio = thisMonthIncome > 0 ? (thisMonthExpense / thisMonthIncome) * 100 : 100

    if (thisMonthIncome === 0 && thisMonthExpense > 0) {
        advice = "Peringatan: Ada pengeluaran namun belum ada pemasukan bulan ini."
        score = 40
    } else if (ratio > 90) {
        advice = "Hati-hati, pengeluaran Anda hampir melebihi pemasukan bulan ini!"
        score = 50
    } else if (ratio > 70) {
        advice = "Coba kurangi pengeluaran sekunder untuk menabung lebih banyak."
        score = 70
    } else if (ratio < 50) {
        advice = "Kondisi keuangan sangat sehat! Pertahankan rasio tabungan ini."
        score = 95
    }

    return { summary, trend, insight, advice, score }
}
