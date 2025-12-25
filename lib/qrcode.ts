import QRCode from "qrcode"

export async function generateQRCode(data: string): Promise<string> {
    try {
        const qrDataURL = await QRCode.toDataURL(data, {
            width: 200,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
        })
        return qrDataURL
    } catch (error) {
        console.error("Error generating QR code:", error)
        return ""
    }
}

export function generateTransactionQRData(transaction: {
    id: string
    type: string
    amount: number
    date: string
    description: string
}): string {
    // Generate URL to rekap page
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    return `${baseUrl}/rekap?id=${transaction.id}`
}
