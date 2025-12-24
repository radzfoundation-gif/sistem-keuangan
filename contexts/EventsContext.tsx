"use client"

import type React from "react"
// ... imports
import { createContext, useContext, useState, useEffect } from "react"
import {
    fetchEventsFromSupabase,
    saveEventToSupabase,
    deleteEventFromSupabase,
    updateEventInSupabase
} from "@/lib/api"
import { toast } from "sonner"

export interface Event {
    id: string
    name: string
    description: string
    date: string
    budget: number
    status: "PLANNED" | "ACTIVE" | "COMPLETED"
}

interface EventsContextType {
    events: Event[]
    addEvent: (event: Omit<Event, "id">) => void
    updateEvent: (id: string, event: Partial<Event>) => void
    deleteEvent: (id: string) => void
    getEventById: (id: string) => Event | undefined
    isLoading: boolean
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load from Supabase on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchEventsFromSupabase()
                if (data) setEvents(data)
            } catch (error) {
                console.error("Failed to load events:", error)
                toast.error("Gagal memuat acara dari server")
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const addEvent = async (event: Omit<Event, "id">) => {
        const newEvent: Event = {
            ...event,
            id: Date.now().toString(),
        }
        setEvents((prev) => [newEvent, ...prev])

        try {
            await saveEventToSupabase(newEvent)
        } catch (error) {
            console.error(error)
            toast.error("Gagal menyimpan acara")
        }
    }

    const updateEvent = async (id: string, updatedData: Partial<Event>) => {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedData } : e)))
        try {
            await updateEventInSupabase(id, updatedData)
        } catch (error) {
            console.error(error)
            toast.error("Gagal update acara")
        }
    }

    const deleteEvent = async (id: string) => {
        setEvents((prev) => prev.filter((e) => e.id !== id))
        try {
            await deleteEventFromSupabase(id)
        } catch (error) {
            console.error(error)
            toast.error("Gagal menghapus acara")
        }
    }

    const getEventById = (id: string) => {
        return events.find((e) => e.id === id)
    }

    return (
        <EventsContext.Provider
            value={{
                events,
                addEvent,
                updateEvent,
                deleteEvent,
                getEventById,
                isLoading
            }}
        >
            {children}
        </EventsContext.Provider>
    )
}

export function useEvents() {
    const context = useContext(EventsContext)
    if (context === undefined) {
        throw new Error("useEvents must be used within a EventsProvider")
    }
    return context
}
