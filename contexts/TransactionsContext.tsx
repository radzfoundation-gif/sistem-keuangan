"use client"

import type React from "react"
// ... imports
import { createContext, useContext, useState, useEffect } from "react"
import {
    fetchTransactionsFromSupabase,
    saveTransactionToSupabase,
    deleteTransactionFromSupabase,
    updateTransactionInSupabase
} from "@/lib/api"
import { toast } from "sonner"

export interface Transaction {
    id: string
    date: string
    type: "MASUK" | "KELUAR"
    amount: number
    category: string
    description: string
    treasurer: string
    eventId?: string // Optional link to an event
}

interface TransactionStats {
    totalBalance: number
    currentMonthIncome: number
    currentMonthExpense: number
    lastMonthIncome: number
    lastMonthExpense: number
}

interface TransactionsContextType {
    transactions: Transaction[]
    addTransaction: (transaction: Omit<Transaction, "id">) => void
    updateTransaction: (id: string, transaction: Partial<Transaction>) => void
    deleteTransaction: (id: string) => void
    getStats: () => TransactionStats
    isLoading: boolean
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined)

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load from Supabase on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchTransactionsFromSupabase()
                if (data) setTransactions(data)
            } catch (error) {
                console.error("Failed to load transactions:", error)
                toast.error("Gagal memuat data dari server")
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const addTransaction = async (transaction: Omit<Transaction, "id">) => {
        // Optimistic update
        const tempId = Date.now().toString()
        const newTransaction: Transaction = {
            ...transaction,
            id: tempId,
            date: transaction.date || new Date().toISOString().split("T")[0],
        }
        setTransactions((prev) => [newTransaction, ...prev])

        try {
            await saveTransactionToSupabase(newTransaction)
        } catch (error) {
            console.error(error)
            toast.error("Gagal menyimpan ke server (Offline?)")
            // Rollback if needed, but for now we keep local state
        }
    }

    const updateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
        setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t)))
        try {
            await updateTransactionInSupabase(id, updatedData)
        } catch (error) {
            console.error(error)
            toast.error("Gagal update data server")
        }
    }

    const deleteTransaction = async (id: string) => {
        const backup = transactions
        setTransactions((prev) => prev.filter((t) => t.id !== id))
        try {
            await deleteTransactionFromSupabase(id)
        } catch (error) {
            console.error(error)
            toast.error("Gagal menghapus data server")
            setTransactions(backup) // Rollback
        }
    }

    const getStats = (): TransactionStats => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

        let totalBalance = 0
        let currentMonthIncome = 0
        let currentMonthExpense = 0
        let lastMonthIncome = 0
        let lastMonthExpense = 0

        transactions.forEach((t) => {
            const transactionDate = new Date(t.date)
            const transMonth = transactionDate.getMonth()
            const transYear = transactionDate.getFullYear()

            // Total balance (all time)
            if (t.type === "MASUK") {
                totalBalance += t.amount
            } else {
                totalBalance -= t.amount
            }

            // Current month stats
            if (transMonth === currentMonth && transYear === currentYear) {
                if (t.type === "MASUK") {
                    currentMonthIncome += t.amount
                } else {
                    currentMonthExpense += t.amount
                }
            }

            // Last month stats
            if (transMonth === lastMonth && transYear === lastMonthYear) {
                if (t.type === "MASUK") {
                    lastMonthIncome += t.amount
                } else {
                    lastMonthExpense += t.amount
                }
            }
        })

        return {
            totalBalance,
            currentMonthIncome,
            currentMonthExpense,
            lastMonthIncome,
            lastMonthExpense,
        }
    }

    return (
        <TransactionsContext.Provider
            value={{
                transactions,
                addTransaction,
                updateTransaction,
                deleteTransaction,
                getStats,
                isLoading
            }}
        >
            {children}
        </TransactionsContext.Provider>
    )
}

export function useTransactions() {
    const context = useContext(TransactionsContext)
    if (context === undefined) {
        throw new Error("useTransactions must be used within a TransactionsProvider")
    }
    return context
}
