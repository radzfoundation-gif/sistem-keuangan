"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { StatCard } from "@/components/stat-card"
import { TransactionTable } from "@/components/transaction-table"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react"
import { useTransactions } from "@/contexts/TransactionsContext"
import { formatCurrency } from "@/lib/currency"
import { AiInsightsDialog } from "@/components/ai-insights-dialog"
import { TransactionCalendar } from "@/components/transaction-calendar"

export default function Home() {
  const { getStats } = useTransactions()
  const stats = getStats()

  // Calculate trends
  const incomeTrend =
    stats.lastMonthIncome > 0
      ? Math.round(((stats.currentMonthIncome - stats.lastMonthIncome) / stats.lastMonthIncome) * 100)
      : 0

  const expenseTrend =
    stats.lastMonthExpense > 0
      ? Math.round(((stats.currentMonthExpense - stats.lastMonthExpense) / stats.lastMonthExpense) * 100)
      : 0

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
                <BreadcrumbPage className="font-medium">Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <AiInsightsDialog />
            <AddTransactionDialog />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 overflow-x-hidden">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Saldo"
              value={formatCurrency(stats.totalBalance)}
              icon={WalletIcon}
              trend="Saldo kas saat ini"
            />
            <StatCard
              title="Pemasukan Bulan Ini"
              value={formatCurrency(stats.currentMonthIncome)}
              icon={ArrowDownIcon}
              trend={
                incomeTrend !== 0
                  ? `${incomeTrend > 0 ? "+" : ""}${incomeTrend}% dari bulan lalu`
                  : "Data bulan lalu tidak tersedia"
              }
              trendUp={incomeTrend > 0}
            />
            <StatCard
              title="Pengeluaran Bulan Ini"
              value={formatCurrency(stats.currentMonthExpense)}
              icon={ArrowUpIcon}
              trend={
                expenseTrend !== 0
                  ? `${expenseTrend > 0 ? "+" : ""}${expenseTrend}% dari bulan lalu`
                  : "Data bulan lalu tidak tersedia"
              }
              trendUp={expenseTrend < 0}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
            <div className="col-span-full md:col-span-4 lg:col-span-5 space-y-6 min-w-0">
              {/* Transactions Table Area - Removed AiSummaryCard */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold leading-none text-balance">Riwayat Transaksi</h2>
                    <p className="text-sm text-muted-foreground mt-1">Daftar semua transaksi keuangan komunitas</p>
                  </div>
                </div>
                <TransactionTable />
              </div>
            </div>

            <div className="col-span-full md:col-span-3 lg:col-span-2 min-w-0">
              <TransactionCalendar />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
