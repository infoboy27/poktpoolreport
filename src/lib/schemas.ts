import { z } from 'zod';

// Input validation schema
export const reportInputSchema = z.object({
  wallet_address: z.string().min(1).transform(val => val.trim().toLowerCase()),
  network_txn_hash: z.string().min(1).transform(val => val.trim().toLowerCase()),
});

// Poktpooldb response schema
export const poktpoolResponseSchema = z.object({
  wallet_address: z.string(),
  req_timestamp: z.string(),
  verf_amount: z.number(),
});

// Waxtrax response schema
export const waxtraxResponseSchema = z.object({
  network_id: z.number(),
  network_txn_hash: z.string(),
  from_wallet_address: z.string(),
  to_wallet_address: z.string(),
  amount: z.number(),
});

// Combined report response schema
export const reportResponseSchema = z.object({
  success: z.boolean(),
  poktpool: z.object({
    data: poktpoolResponseSchema.nullable(),
    error: z.string().nullable(),
    latency: z.number(),
  }),
  waxtrax: z.object({
    data: waxtraxResponseSchema.nullable(),
    error: z.string().nullable(),
    latency: z.number(),
  }),
  summary: z.object({
    difference: z.number(),
    status: z.enum(['success', 'insufficient', 'error']),
  }),
});

export type ReportInput = z.infer<typeof reportInputSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;
