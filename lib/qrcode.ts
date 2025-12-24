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
    return JSON.stringify({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        desc: transaction.description,
        timestamp: new Date().toISOString(),
    })
}
