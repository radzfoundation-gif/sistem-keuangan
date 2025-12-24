"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { TransactionTable } from "@/components/transaction-table"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"

export default function TransaksiPage() {
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
                                <BreadcrumbPage className="font-medium">Transaksi</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Daftar Transaksi</h2>
                            <p className="text-muted-foreground">Kelola semua pemasukan dan pengeluaran komunitas.</p>
                        </div>
                        <AddTransactionDialog />
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6">
                            <TransactionTable />
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
