"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/contexts/TransactionsContext"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts"
import { formatCurrency } from "@/lib/currency"

export default function LaporanPage() {
    const { transactions, getStats } = useTransactions()
    const stats = getStats()

    // Data untuk grafik pemusukan vs pengeluaran per bulan
    const monthlyData = transactions.reduce((acc, t) => {
        const date = new Date(t.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!acc[monthKey]) {
            acc[monthKey] = { name: monthKey, pemasukan: 0, pengeluaran: 0 }
        }

        if (t.type === "MASUK") {
            acc[monthKey].pemasukan += t.amount
        } else {
            acc[monthKey].pengeluaran += t.amount
        }

        return acc
    }, {} as Record<string, { name: string, pemasukan: number, pengeluaran: number }>)

    const chartData = Object.values(monthlyData).sort((a, b) => a.name.localeCompare(b.name))

    // Data untuk Pie Chart Kategori Pengeluaran
    const expenseByCategory = transactions
        .filter(t => t.type === "KELUAR")
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {} as Record<string, number>)

    const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']


    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium">Laporan</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h2>
                        <p className="text-muted-foreground">Analisis visual arus kas komunitas.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        {/* Bar Chart */}
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
                                <CardDescription>Perbandingan arus kas per bulan</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px] w-full">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis tickFormatter={(value) => `Rp${value / 1000}k`} />
                                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Bar dataKey="pemasukan" name="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            Belum ada data transaksi untuk ditampilkan
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pie Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Kategori Pengeluaran</CardTitle>
                                <CardDescription>Distribusi pengeluaran berdasarkan kategori</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    {pieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            Belum ada data pengeluaran
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Ringkasan Keuangan</CardTitle>
                                <CardDescription>Statistik keseluruhan</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-sm font-medium">Total Pemasukan (All Time)</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(transactions.filter(t => t.type === "MASUK").reduce((acc, t) => acc + t.amount, 0))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-sm font-medium">Total Pengeluaran (All Time)</span>
                                    <span className="font-bold text-red-600">
                                        {formatCurrency(transactions.filter(t => t.type === "KELUAR").reduce((acc, t) => acc + t.amount, 0))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm font-medium">Saldo Akhir</span>
                                    <span className="text-xl font-bold">
                                        {formatCurrency(stats.totalBalance)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
