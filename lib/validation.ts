import { z } from "zod"

export const transactionSchema = z.object({
    type: z.enum(["MASUK", "KELUAR"], {
        required_error: "Tipe transaksi harus dipilih",
    }),
    amount: z
        .number({
            required_error: "Nominal harus diisi",
            invalid_type_error: "Nominal harus berupa angka",
        })
        .positive("Nominal harus lebih dari 0"),
    category: z.string().min(1, "Kategori harus dipilih"),
    description: z.string().min(3, "Keterangan minimal 3 karakter"),
    treasurer: z.string().min(2, "Nama bendahara minimal 2 karakter"),
    eventId: z.string().optional(),
    date: z.string({
        required_error: "Tanggal harus diisi",
    }),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
