"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface NotaRecord {
    id: string
    transactionId: string
    transactionType: "MASUK" | "KELUAR"
    amount: number
    date: string
    category: string
    description: string
    treasurer: string
    generatedAt: string // timestamp when nota was generated
    qrCode: string // QR code data URL
}

interface NotaContextType {
    notaRecords: NotaRecord[]
    addNotaRecord: (record: Omit<NotaRecord, "id" | "generatedAt">) => void
    deleteNotaRecord: (id: string) => void
    getNotaByTransactionId: (transactionId: string) => NotaRecord | undefined
}

const NotaContext = createContext<NotaContextType | undefined>(undefined)

export function NotaProvider({ children }: { children: React.ReactNode }) {
    const [notaRecords, setNotaRecords] = useState<NotaRecord[]>([])

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("keuangan-nota-records")
            if (saved) {
                try {
                    setNotaRecords(JSON.parse(saved))
                } catch (e) {
                    console.error("Failed to load nota records:", e)
                    setNotaRecords([])
                }
            }
        }
    }, [])

    // Save to localStorage whenever records change
    useEffect(() => {
        if (typeof window !== "undefined" && notaRecords.length >= 0) {
            localStorage.setItem("keuangan-nota-records", JSON.stringify(notaRecords))
        }
    }, [notaRecords])

    const addNotaRecord = (record: Omit<NotaRecord, "id" | "generatedAt">) => {
        const newRecord: NotaRecord = {
            ...record,
            id: Date.now().toString(),
            generatedAt: new Date().toISOString(),
        }
        setNotaRecords((prev) => [newRecord, ...prev])
    }

    const deleteNotaRecord = (id: string) => {
        setNotaRecords((prev) => prev.filter((r) => r.id !== id))
    }

    const getNotaByTransactionId = (transactionId: string) => {
        return notaRecords.find((r) => r.transactionId === transactionId)
    }

    return (
        <NotaContext.Provider
            value={{
                notaRecords,
                addNotaRecord,
                deleteNotaRecord,
                getNotaByTransactionId,
            }}
        >
            {children}
        </NotaContext.Provider>
    )
}

export function useNota() {
    const context = useContext(NotaContext)
    if (context === undefined) {
        throw new Error("useNota must be used within a NotaProvider")
    }
    return context
}
