export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            cajas_operativas: {
                Row: {
                    id: string
                    usuario_id: string
                    boveda_origen_id: string | null
                    numero_caja: number
                    estado: string
                    saldo_inicial: number | null
                    saldo_actual: number | null
                    saldo_final_cierre: number | null
                    diferencia_cierre: number | null
                    fecha_apertura: string | null
                    fecha_cierre: string | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    boveda_origen_id?: string | null
                    numero_caja: number
                    estado?: string
                    saldo_inicial?: number | null
                    saldo_actual?: number | null
                    saldo_final_cierre?: number | null
                    diferencia_cierre?: number | null
                    fecha_apertura?: string | null
                    fecha_cierre?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    boveda_origen_id?: string | null
                    numero_caja?: number
                    estado?: string
                    saldo_inicial?: number | null
                    saldo_actual?: number | null
                    saldo_final_cierre?: number | null
                    diferencia_cierre?: number | null
                    fecha_apertura?: string | null
                    fecha_cierre?: string | null
                }
            }
        }
        Functions: {
            crear_contrato_oficial: {
                Args: {
                    p_caja_id: string
                    p_cliente_doc_tipo: string
                    p_cliente_doc_num: string
                    p_cliente_nombre: string
                    p_garantia_data: Json
                    p_contrato_data: Json
                }
                Returns: string
            }
        }
    }
}
