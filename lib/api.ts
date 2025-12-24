import { createClient } from "@/lib/supabase"
import type { Transaction } from "@/contexts/TransactionsContext"

export async function fetchTransactionsFromSupabase() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

    if (error) throw error
    return data as Transaction[]
}

export async function saveTransactionToSupabase(transaction: Transaction) {
    const supabase = createClient()
    const { error } = await supabase
        .from('transactions')
        .insert(transaction)

    if (error) throw error
}

export async function deleteTransactionFromSupabase(id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function updateTransactionInSupabase(id: string, updates: Partial<Transaction>) {
    const supabase = createClient()
    const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)

    if (error) throw error
}

// Events API
import type { Event } from "@/contexts/EventsContext"

export async function fetchEventsFromSupabase() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })

    if (error) throw error
    return data as Event[]
}

export async function saveEventToSupabase(event: Event) {
    const supabase = createClient()
    const { error } = await supabase
        .from('events')
        .insert(event)

    if (error) throw error
}

export async function deleteEventFromSupabase(id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function updateEventInSupabase(id: string, updates: Partial<Event>) {
    const supabase = createClient()
    const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)

    if (error) throw error
}
