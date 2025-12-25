"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

export function useTreasurers() {
    const [treasurers, setTreasurers] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTreasurers = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Get treasurers from metadata, or default to ["Admin"]
                const storedTreasurers = user.user_metadata?.stored_treasurers
                if (Array.isArray(storedTreasurers) && storedTreasurers.length > 0) {
                    setTreasurers(storedTreasurers)
                } else {
                    setTreasurers(["Admin"])
                }
            } else {
                setTreasurers(["Admin"])
            }
            setLoading(false)
        }

        fetchTreasurers()
    }, [])

    return { treasurers, loading }
}
