// Client-safe wrapper for pagos RPC actions
// This file does NOT have 'use server' so it can be imported in client components

import { registrarPagoRPCAction, type PagoRPCInput } from './pagos-rpc-actions'

// Re-export the type
export type { PagoRPCInput }

// Re-export the function (it still runs on the server, but can be imported from client)
export { registrarPagoRPCAction }
