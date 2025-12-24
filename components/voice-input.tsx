"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MicIcon, MicOffIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

interface VoiceInputProps {
    onTransactionDetected: (data: {
        amount?: number
        category?: string
        description?: string
        type?: "MASUK" | "KELUAR"
    }) => void
}

export function VoiceInput({ onTransactionDetected }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore - SpeechRecognition is not standard yet
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = false
                recognition.lang = "id-ID"
                recognition.interimResults = true

                recognition.onstart = () => {
                    setIsListening(true)
                    setTranscript("")
                }

                recognition.onend = () => {
                    setIsListening(false)
                }

                recognition.onresult = (event: any) => {
                    let currentTranscript = ""
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript
                    }
                    setTranscript(currentTranscript)

                    if (event.results[0].isFinal) {
                        processVoiceCommand(currentTranscript)
                    }
                }

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error)
                    setIsListening(false)
                    toast.error("Gagal menangkap suara: " + event.error)
                }

                recognitionRef.current = recognition
            } else {
                console.warn("Browser does not support Speech Recognition")
                toast.error("Browser ini tidak mendukung input suara.")
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
        } else {
            recognitionRef.current?.start()
        }
    }

    const processVoiceCommand = (text: string) => {
        const lowerText = text.toLowerCase()

        // 1. Detect Amount (e.g. "50 ribu", "2 juta", "10 k", "150000")
        let amount = 0
        let processedText = lowerText

        // Handle "setengah juta", "satu juta" if needed, but keeping it simple first
        processedText = processedText.replace(/\bribu\b/g, "000")
        processedText = processedText.replace(/\bjuta\b/g, "000000")
        processedText = processedText.replace(/\bk\b/g, "000") // 50k -> 50000
        // Remove dots/commas for number parsing if user says "10.000" (speech api usually returns "10000" or "10 000")
        processedText = processedText.replace(/[.,]/g, "")

        const numberMatch = processedText.match(/(\d+)/)
        if (numberMatch) {
            amount = parseInt(numberMatch[0])
        }

        // 2. Detect Type
        let type: "MASUK" | "KELUAR" = "KELUAR" // Default
        if (lowerText.match(/(terima|dapat|masuk|gajian|profit|untung|iuran|donasi)/)) {
            // Double check context: "bayar iuran" -> KELUAR, "terima iuran" -> MASUK
            // Simple logic first:
            if (!lowerText.includes("bayar")) {
                type = "MASUK"
            }
        }

        // 3. Detect Category
        let category = "Lainnya"
        if (lowerText.match(/(makan|minum|snack|kopi|nasi|konsumsi|jajan|warteg|restoran)/)) category = "Konsumsi"
        else if (lowerText.match(/(iuran|kas|sumbangan|tagihan)/)) category = "Iuran Anggota"
        else if (lowerText.match(/(donasi|sedekah|infaq|zakat)/)) category = "Donasi"
        else if (lowerText.match(/(listrik|air|wifi|internet|pulsa|bensin|transport|ojek|parkir)/)) category = "Operasional"
        else if (lowerText.match(/(kertas|spidol|buku|kursi|meja|alat)/)) category = "Perlengkapan"

        // 4. Description = Original text capitalized
        const description = text.charAt(0).toUpperCase() + text.slice(1)

        // Notify parent
        onTransactionDetected({
            amount: amount > 0 ? amount : undefined,
            category: category !== "Lainnya" ? category : undefined,
            type,
            description
        })

        toast.success("Suara diproses!", {
            description: `Mendeteksi: ${type} Rp ${amount.toLocaleString()}`
        })
    }

    return (
        <div className="flex flex-col gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg mb-4 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 flex gap-1 items-center">
                    <SparklesIcon className="size-3 text-indigo-500" />
                    Voice Magic Input
                </span>
                {isListening && <span className="text-xs animate-pulse text-red-500 font-bold">Mendengarkan...</span>}
            </div>

            <div className="flex gap-2 items-center">
                <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    className="shrink-0 transition-all rounded-full h-10 w-10"
                    onClick={toggleListening}
                >
                    {isListening ? <MicOffIcon className="size-5" /> : <MicIcon className="size-5" />}
                </Button>
                <div className="text-sm text-slate-600 italic grow truncate border-b border-slate-200 pb-1">
                    {transcript || "Klik mic & bicara: 'Beli kopi 20 ribu...'"}
                </div>
            </div>
        </div>
    )
}
