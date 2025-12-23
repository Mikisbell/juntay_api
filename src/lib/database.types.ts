export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          accion: string
          created_at: string | null
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          id: string
          metadata: Json | null
          registro_id: string
          tabla: string
          usuario_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: string
          metadata?: Json | null
          registro_id: string
          tabla: string
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: string
          metadata?: Json | null
          registro_id?: string
          tabla?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      auditoria_transacciones: {
        Row: {
          accion: string
          datos_antes: Json | null
          datos_despues: Json | null
          empleado_id: string | null
          id: string
          ip_address: unknown
          registro_id: string
          tabla_afectada: string
          timestamp: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          accion: string
          datos_antes?: Json | null
          datos_despues?: Json | null
          empleado_id?: string | null
          id?: string
          ip_address?: unknown
          registro_id: string
          tabla_afectada: string
          timestamp?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          datos_antes?: Json | null
          datos_despues?: Json | null
          empleado_id?: string | null
          id?: string
          ip_address?: unknown
          registro_id?: string
          tabla_afectada?: string
          timestamp?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_transacciones_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_transacciones_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      cajas_operativas: {
        Row: {
          _deleted: boolean
          _modified: string
          boveda_origen_id: string | null
          cuenta_origen_id: string | null
          diferencia_cierre: number | null
          empresa_id: string | null
          estado: string
          fecha_apertura: string | null
          fecha_cierre: string | null
          id: string
          numero_caja: number
          observaciones_cierre: string | null
          saldo_actual: number | null
          saldo_final_cierre: number | null
          saldo_inicial: number | null
          sucursal_id: string | null
          usuario_id: string
        }
        Insert: {
          _deleted?: boolean
          _modified?: string
          boveda_origen_id?: string | null
          cuenta_origen_id?: string | null
          diferencia_cierre?: number | null
          empresa_id?: string | null
          estado?: string
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          id?: string
          numero_caja: number
          observaciones_cierre?: string | null
          saldo_actual?: number | null
          saldo_final_cierre?: number | null
          saldo_inicial?: number | null
          sucursal_id?: string | null
          usuario_id: string
        }
        Update: {
          _deleted?: boolean
          _modified?: string
          boveda_origen_id?: string | null
          cuenta_origen_id?: string | null
          diferencia_cierre?: number | null
          empresa_id?: string | null
          estado?: string
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          id?: string
          numero_caja?: number
          observaciones_cierre?: string | null
          saldo_actual?: number | null
          saldo_final_cierre?: number | null
          saldo_inicial?: number | null
          sucursal_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cajas_operativas_cuenta_origen_id_fkey"
            columns: ["cuenta_origen_id"]
            isOneToOne: false
            referencedRelation: "cuentas_financieras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cajas_operativas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cajas_operativas_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cajas_operativas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      categoria_sugerida: {
        Row: {
          created_at: string | null
          id: number
          promovido_a: string | null
          promovido_en: string | null
          texto_ingresado: string
          texto_normalizado: string
          tipo: string
          ultimo_uso: string | null
          veces_usado: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          promovido_a?: string | null
          promovido_en?: string | null
          texto_ingresado: string
          texto_normalizado: string
          tipo: string
          ultimo_uso?: string | null
          veces_usado?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          promovido_a?: string | null
          promovido_en?: string | null
          texto_ingresado?: string
          texto_normalizado?: string
          tipo?: string
          ultimo_uso?: string | null
          veces_usado?: number | null
        }
        Relationships: []
      }
      categorias_garantia: {
        Row: {
          id: string
          nombre: string
          porcentaje_prestamo_maximo: number | null
        }
        Insert: {
          id?: string
          nombre: string
          porcentaje_prestamo_maximo?: number | null
        }
        Update: {
          id?: string
          nombre?: string
          porcentaje_prestamo_maximo?: number | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          _deleted: boolean
          _modified: string
          activo: boolean | null
          apellido_materno: string | null
          apellido_paterno: string | null
          created_at: string | null
          departamento: string | null
          direccion: string | null
          distrito: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nombres: string | null
          numero_documento: string
          parentesco_otro: string | null
          parentesco_referencia: string | null
          party_id: string | null
          persona_id: string | null
          provincia: string | null
          score_crediticio: number | null
          telefono_principal: string | null
          telefono_secundario: string | null
          tipo_documento: string
          tipo_parentesco_id: number | null
          ubigeo_cod: string | null
        }
        Insert: {
          _deleted?: boolean
          _modified?: string
          activo?: boolean | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          created_at?: string | null
          departamento?: string | null
          direccion?: string | null
          distrito?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nombres?: string | null
          numero_documento: string
          parentesco_otro?: string | null
          parentesco_referencia?: string | null
          party_id?: string | null
          persona_id?: string | null
          provincia?: string | null
          score_crediticio?: number | null
          telefono_principal?: string | null
          telefono_secundario?: string | null
          tipo_documento: string
          tipo_parentesco_id?: number | null
          ubigeo_cod?: string | null
        }
        Update: {
          _deleted?: boolean
          _modified?: string
          activo?: boolean | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          created_at?: string | null
          departamento?: string | null
          direccion?: string | null
          distrito?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nombres?: string | null
          numero_documento?: string
          parentesco_otro?: string | null
          parentesco_referencia?: string | null
          party_id?: string | null
          persona_id?: string | null
          provincia?: string | null
          score_crediticio?: number | null
          telefono_principal?: string | null
          telefono_secundario?: string | null
          tipo_documento?: string
          tipo_parentesco_id?: number | null
          ubigeo_cod?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_fondeo: {
        Row: {
          created_at: string | null
          created_by: string | null
          empresa_id: string | null
          estado: Database["public"]["Enums"]["estado_contrato_fondeo"] | null
          fecha_inicio: string
          fecha_vencimiento: string | null
          frecuencia_pago:
          | Database["public"]["Enums"]["frecuencia_pago_fondeo"]
          | null
          id: string
          inversionista_id: string
          metadata: Json | null
          monto_capital_devuelto: number | null
          monto_pactado: number
          monto_rendimientos_pagados: number | null
          tasa_retorno: number
          tipo: Database["public"]["Enums"]["tipo_contrato_fondeo"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string | null
          estado?: Database["public"]["Enums"]["estado_contrato_fondeo"] | null
          fecha_inicio?: string
          fecha_vencimiento?: string | null
          frecuencia_pago?:
          | Database["public"]["Enums"]["frecuencia_pago_fondeo"]
          | null
          id?: string
          inversionista_id: string
          metadata?: Json | null
          monto_capital_devuelto?: number | null
          monto_pactado: number
          monto_rendimientos_pagados?: number | null
          tasa_retorno: number
          tipo: Database["public"]["Enums"]["tipo_contrato_fondeo"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string | null
          estado?: Database["public"]["Enums"]["estado_contrato_fondeo"] | null
          fecha_inicio?: string
          fecha_vencimiento?: string | null
          frecuencia_pago?:
          | Database["public"]["Enums"]["frecuencia_pago_fondeo"]
          | null
          id?: string
          inversionista_id?: string
          metadata?: Json | null
          monto_capital_devuelto?: number | null
          monto_pactado?: number
          monto_rendimientos_pagados?: number | null
          tasa_retorno?: number
          tipo?: Database["public"]["Enums"]["tipo_contrato_fondeo"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_fondeo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_fondeo_inversionista_id_fkey"
            columns: ["inversionista_id"]
            isOneToOne: false
            referencedRelation: "inversionistas"
            referencedColumns: ["id"]
          },
        ]
      }
      creditos: {
        Row: {
          _deleted: boolean
          _modified: string
          caja_origen_id: string | null
          cliente_id: string
          codigo: string | null
          codigo_credito: string | null
          created_at: string | null
          created_by: string | null
          dias_transcurridos: number | null
          empresa_id: string | null
          estado: string | null
          estado_detallado: string
          fecha_cancelacion: string | null
          fecha_desembolso: string | null
          fecha_inicio: string | null
          fecha_vencimiento: string
          id: string
          interes_acumulado: number | null
          interes_devengado_actual: number | null
          monto_prestado: number
          observaciones: string | null
          periodo_dias: number
          saldo_pendiente: number
          sucursal_id: string | null
          tasa_interes: number
          updated_at: string | null
        }
        Insert: {
          _deleted?: boolean
          _modified?: string
          caja_origen_id?: string | null
          cliente_id: string
          codigo?: string | null
          codigo_credito?: string | null
          created_at?: string | null
          created_by?: string | null
          dias_transcurridos?: number | null
          empresa_id?: string | null
          estado?: string | null
          estado_detallado: string
          fecha_cancelacion?: string | null
          fecha_desembolso?: string | null
          fecha_inicio?: string | null
          fecha_vencimiento: string
          id?: string
          interes_acumulado?: number | null
          interes_devengado_actual?: number | null
          monto_prestado: number
          observaciones?: string | null
          periodo_dias: number
          saldo_pendiente: number
          sucursal_id?: string | null
          tasa_interes: number
          updated_at?: string | null
        }
        Update: {
          _deleted?: boolean
          _modified?: string
          caja_origen_id?: string | null
          cliente_id?: string
          codigo?: string | null
          codigo_credito?: string | null
          created_at?: string | null
          created_by?: string | null
          dias_transcurridos?: number | null
          empresa_id?: string | null
          estado?: string | null
          estado_detallado?: string
          fecha_cancelacion?: string | null
          fecha_desembolso?: string | null
          fecha_inicio?: string | null
          fecha_vencimiento?: string
          id?: string
          interes_acumulado?: number | null
          interes_devengado_actual?: number | null
          monto_prestado?: number
          observaciones?: string | null
          periodo_dias?: number
          saldo_pendiente?: number
          sucursal_id?: string | null
          tasa_interes?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creditos_caja_origen_id_fkey"
            columns: ["caja_origen_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creditos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creditos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creditos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creditos_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas_financieras: {
        Row: {
          activo: boolean | null
          banco_asociado: Database["public"]["Enums"]["banco_peru"] | null
          created_at: string | null
          empresa_id: string | null
          es_principal: boolean | null
          id: string
          moneda: string
          nombre: string
          numero_cuenta: string | null
          saldo: number
          tipo: Database["public"]["Enums"]["tipo_cuenta_financiera"]
          titular_cuenta: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          banco_asociado?: Database["public"]["Enums"]["banco_peru"] | null
          created_at?: string | null
          empresa_id?: string | null
          es_principal?: boolean | null
          id?: string
          moneda?: string
          nombre: string
          numero_cuenta?: string | null
          saldo?: number
          tipo: Database["public"]["Enums"]["tipo_cuenta_financiera"]
          titular_cuenta?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          banco_asociado?: Database["public"]["Enums"]["banco_peru"] | null
          created_at?: string | null
          empresa_id?: string | null
          es_principal?: boolean | null
          id?: string
          moneda?: string
          nombre?: string
          numero_cuenta?: string | null
          saldo?: number
          tipo?: Database["public"]["Enums"]["tipo_cuenta_financiera"]
          titular_cuenta?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuentas_financieras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      departamentos: {
        Row: {
          activo: boolean
          codigo: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          nombre: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          nombre?: string
        }
        Relationships: []
      }
      distritos: {
        Row: {
          activo: boolean
          nombre: string
          provincia_codigo: string
          ubigeo_inei: string
        }
        Insert: {
          activo?: boolean
          nombre: string
          provincia_codigo: string
          ubigeo_inei: string
        }
        Update: {
          activo?: boolean
          nombre?: string
          provincia_codigo?: string
          ubigeo_inei?: string
        }
        Relationships: [
          {
            foreignKeyName: "distritos_provincia_codigo_fkey"
            columns: ["provincia_codigo"]
            isOneToOne: false
            referencedRelation: "provincias"
            referencedColumns: ["codigo"]
          },
        ]
      }
      empleados: {
        Row: {
          activo: boolean | null
          cargo: string
          created_at: string | null
          estado: string | null
          fecha_ingreso: string | null
          fecha_salida: string | null
          id: string
          motivo_estado: string | null
          nombre_contacto_emergencia: string | null
          parentesco_emergencia: string | null
          party_id: string | null
          persona_id: string
          sucursal_id: string | null
          telefono_emergencia: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activo?: boolean | null
          cargo: string
          created_at?: string | null
          estado?: string | null
          fecha_ingreso?: string | null
          fecha_salida?: string | null
          id?: string
          motivo_estado?: string | null
          nombre_contacto_emergencia?: string | null
          parentesco_emergencia?: string | null
          party_id?: string | null
          persona_id: string
          sucursal_id?: string | null
          telefono_emergencia?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activo?: boolean | null
          cargo?: string
          created_at?: string | null
          estado?: string | null
          fecha_ingreso?: string | null
          fecha_salida?: string | null
          id?: string
          motivo_estado?: string | null
          nombre_contacto_emergencia?: string | null
          parentesco_emergencia?: string | null
          party_id?: string | null
          persona_id?: string
          sucursal_id?: string | null
          telefono_emergencia?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empleados_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empleados_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empleados_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          activo: boolean | null
          created_at: string | null
          direccion: string | null
          email: string | null
          id: string
          logo_url: string | null
          nombre_comercial: string | null
          razon_social: string
          ruc: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nombre_comercial?: string | null
          razon_social: string
          ruc: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nombre_comercial?: string | null
          razon_social?: string
          ruc?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      eventos_sistema: {
        Row: {
          agregado_id: string
          agregado_tipo: string
          created_at: string
          evento_tipo: string
          id: number
          payload: Json
          usuario_id: string | null
          version: number
        }
        Insert: {
          agregado_id: string
          agregado_tipo: string
          created_at?: string
          evento_tipo: string
          id?: number
          payload?: Json
          usuario_id?: string | null
          version?: number
        }
        Update: {
          agregado_id?: string
          agregado_tipo?: string
          created_at?: string
          evento_tipo?: string
          id?: number
          payload?: Json
          usuario_id?: string | null
          version?: number
        }
        Relationships: []
      }
      fotos_garantia: {
        Row: {
          created_at: string | null
          descripcion: string | null
          es_principal: boolean | null
          garantia_id: string
          id: string
          tipo: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          es_principal?: boolean | null
          garantia_id: string
          id?: string
          tipo?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          es_principal?: boolean | null
          garantia_id?: string
          id?: string
          tipo?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_garantia_garantia_id_fkey"
            columns: ["garantia_id"]
            isOneToOne: false
            referencedRelation: "garantias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_garantia_garantia_id_fkey"
            columns: ["garantia_id"]
            isOneToOne: false
            referencedRelation: "inventario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotos_garantia_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      garantias: {
        Row: {
          _deleted: boolean
          _modified: string
          anio: number | null
          area: number | null
          capacidad: string | null
          categoria_id: string | null
          cliente_id: string | null
          created_at: string | null
          credito_id: string | null
          descripcion: string
          empresa_id: string | null
          estado: string | null
          estado_bien: string | null
          fecha_venta: string | null
          fotos: string[] | null
          fotos_urls: string[] | null
          id: string
          kilometraje: number | null
          marca: string | null
          modelo: string | null
          para_remate: boolean | null
          partida_registral: string | null
          peso: number | null
          placa: string | null
          precio_venta: number | null
          quilataje: string | null
          serie: string | null
          subcategoria: string | null
          ubicacion: string | null
          updated_at: string | null
          valor_prestamo_sugerido: number | null
          valor_tasacion: number
          valor_tasado: number | null
        }
        Insert: {
          _deleted?: boolean
          _modified?: string
          anio?: number | null
          area?: number | null
          capacidad?: string | null
          categoria_id?: string | null
          cliente_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          descripcion: string
          empresa_id?: string | null
          estado?: string | null
          estado_bien?: string | null
          fecha_venta?: string | null
          fotos?: string[] | null
          fotos_urls?: string[] | null
          id?: string
          kilometraje?: number | null
          marca?: string | null
          modelo?: string | null
          para_remate?: boolean | null
          partida_registral?: string | null
          peso?: number | null
          placa?: string | null
          precio_venta?: number | null
          quilataje?: string | null
          serie?: string | null
          subcategoria?: string | null
          ubicacion?: string | null
          updated_at?: string | null
          valor_prestamo_sugerido?: number | null
          valor_tasacion: number
          valor_tasado?: number | null
        }
        Update: {
          _deleted?: boolean
          _modified?: string
          anio?: number | null
          area?: number | null
          capacidad?: string | null
          categoria_id?: string | null
          cliente_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          descripcion?: string
          empresa_id?: string | null
          estado?: string | null
          estado_bien?: string | null
          fecha_venta?: string | null
          fotos?: string[] | null
          fotos_urls?: string[] | null
          id?: string
          kilometraje?: number | null
          marca?: string | null
          modelo?: string | null
          para_remate?: boolean | null
          partida_registral?: string | null
          peso?: number | null
          placa?: string | null
          precio_venta?: number | null
          quilataje?: string | null
          serie?: string | null
          subcategoria?: string | null
          ubicacion?: string | null
          updated_at?: string | null
          valor_prestamo_sugerido?: number | null
          valor_tasacion?: number
          valor_tasado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "garantias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_garantia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "creditos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "vista_creditos_intereses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      inversionistas: {
        Row: {
          activo: boolean | null
          created_at: string | null
          empresa_id: string | null
          fecha_ingreso: string | null
          id: string
          metadata: Json | null
          participacion_porcentaje: number | null
          party_id: string | null
          persona_id: string
          tipo_relacion: Database["public"]["Enums"]["tipo_inversionista"]
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          fecha_ingreso?: string | null
          id?: string
          metadata?: Json | null
          participacion_porcentaje?: number | null
          party_id?: string | null
          persona_id: string
          tipo_relacion: Database["public"]["Enums"]["tipo_inversionista"]
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          fecha_ingreso?: string | null
          id?: string
          metadata?: Json | null
          participacion_porcentaje?: number | null
          party_id?: string | null
          persona_id?: string
          tipo_relacion?: Database["public"]["Enums"]["tipo_inversionista"]
        }
        Relationships: [
          {
            foreignKeyName: "inversionistas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inversionistas_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inversionistas_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inversionistas_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_caja_operativa: {
        Row: {
          _deleted: boolean
          _modified: string
          anulado: boolean | null
          anulado_at: string | null
          anulado_por: string | null
          caja_id: string | null
          caja_operativa_id: string
          descripcion: string | null
          empresa_id: string | null
          es_reversion: boolean | null
          fecha: string | null
          id: string
          metadata: Json | null
          monto: number
          motivo: string
          motivo_anulacion: string | null
          movimiento_original_id: string | null
          movimiento_reversion_id: string | null
          referencia_id: string | null
          saldo_anterior: number
          saldo_nuevo: number
          tipo: string
          usuario_id: string
        }
        Insert: {
          _deleted?: boolean
          _modified?: string
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_id?: string | null
          caja_operativa_id: string
          descripcion?: string | null
          empresa_id?: string | null
          es_reversion?: boolean | null
          fecha?: string | null
          id?: string
          metadata?: Json | null
          monto: number
          motivo: string
          motivo_anulacion?: string | null
          movimiento_original_id?: string | null
          movimiento_reversion_id?: string | null
          referencia_id?: string | null
          saldo_anterior: number
          saldo_nuevo: number
          tipo: string
          usuario_id: string
        }
        Update: {
          _deleted?: boolean
          _modified?: string
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_id?: string | null
          caja_operativa_id?: string
          descripcion?: string | null
          empresa_id?: string | null
          es_reversion?: boolean | null
          fecha?: string | null
          id?: string
          metadata?: Json | null
          monto?: number
          motivo?: string
          motivo_anulacion?: string | null
          movimiento_original_id?: string | null
          movimiento_reversion_id?: string | null
          referencia_id?: string | null
          saldo_anterior?: number
          saldo_nuevo?: number
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_caja_operativa_caja_id_fkey"
            columns: ["caja_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_caja_operativa_id_fkey"
            columns: ["caja_operativa_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_movimiento_original_id_fkey"
            columns: ["movimiento_original_id"]
            isOneToOne: false
            referencedRelation: "movimientos_caja_operativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_movimiento_original_id_fkey"
            columns: ["movimiento_original_id"]
            isOneToOne: false
            referencedRelation: "movimientos_efectivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_movimiento_reversion_id_fkey"
            columns: ["movimiento_reversion_id"]
            isOneToOne: false
            referencedRelation: "movimientos_caja_operativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_movimiento_reversion_id_fkey"
            columns: ["movimiento_reversion_id"]
            isOneToOne: false
            referencedRelation: "movimientos_efectivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones_enviadas: {
        Row: {
          cliente_id: string
          created_at: string | null
          credito_id: string
          enviado_por: string | null
          estado: string | null
          fecha_envio: string | null
          id: string
          medio: string | null
          mensaje_enviado: string
          telefono_destino: string
          tipo_notificacion: string
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          credito_id: string
          enviado_por?: string | null
          estado?: string | null
          fecha_envio?: string | null
          id?: string
          medio?: string | null
          mensaje_enviado: string
          telefono_destino: string
          tipo_notificacion: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          credito_id?: string
          enviado_por?: string | null
          estado?: string | null
          fecha_envio?: string | null
          id?: string
          medio?: string | null
          mensaje_enviado?: string
          telefono_destino?: string
          tipo_notificacion?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_enviadas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_enviadas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_enviadas_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "creditos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_enviadas_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "vista_creditos_intereses"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones_pendientes: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          credito_id: string | null
          email: string | null
          estado: string | null
          fecha_envio: string | null
          fecha_procesado: string | null
          id: string
          mensaje: string
          metadata: Json | null
          monto: number | null
          telefono: string | null
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          email?: string | null
          estado?: string | null
          fecha_envio?: string | null
          fecha_procesado?: string | null
          id?: string
          mensaje: string
          metadata?: Json | null
          monto?: number | null
          telefono?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          email?: string | null
          estado?: string | null
          fecha_envio?: string | null
          fecha_procesado?: string | null
          id?: string
          mensaje?: string
          metadata?: Json | null
          monto?: number | null
          telefono?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_pendientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_pendientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_pendientes_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "creditos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_pendientes_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "vista_creditos_intereses"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          _deleted: boolean
          _modified: string
          anulado: boolean | null
          anulado_at: string | null
          anulado_por: string | null
          caja_operativa_id: string | null
          created_at: string | null
          credito_id: string | null
          desglose_capital: number | null
          desglose_interes: number | null
          desglose_mora: number | null
          empresa_id: string | null
          fecha_pago: string | null
          id: string
          medio_pago: string | null
          metadata: Json | null
          metodo_pago: string | null
          monto_total: number
          motivo_anulacion: string | null
          observaciones: string | null
          sucursal_id: string | null
          tipo: string | null
          transaccion_bancaria_id: string | null
          usuario_id: string | null
        }
        Insert: {
          _deleted?: boolean
          _modified?: string
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_operativa_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          desglose_capital?: number | null
          desglose_interes?: number | null
          desglose_mora?: number | null
          empresa_id?: string | null
          fecha_pago?: string | null
          id?: string
          medio_pago?: string | null
          metadata?: Json | null
          metodo_pago?: string | null
          monto_total: number
          motivo_anulacion?: string | null
          observaciones?: string | null
          sucursal_id?: string | null
          tipo?: string | null
          transaccion_bancaria_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          _deleted?: boolean
          _modified?: string
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_operativa_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          desglose_capital?: number | null
          desglose_interes?: number | null
          desglose_mora?: number | null
          empresa_id?: string | null
          fecha_pago?: string | null
          id?: string
          medio_pago?: string | null
          metadata?: Json | null
          metodo_pago?: string | null
          monto_total?: number
          motivo_anulacion?: string | null
          observaciones?: string | null
          sucursal_id?: string | null
          tipo?: string | null
          transaccion_bancaria_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_caja_operativa_id_fkey"
            columns: ["caja_operativa_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "creditos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "vista_creditos_intereses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_transaccion_bancaria_id_fkey"
            columns: ["transaccion_bancaria_id"]
            isOneToOne: false
            referencedRelation: "transacciones_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          _deleted: boolean | null
          _modified: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          id: string
          party_type: string
          tax_id: string
          tax_id_type: string
          telefono_principal: string | null
          telefono_secundario: string | null
          updated_at: string | null
        }
        Insert: {
          _deleted?: boolean | null
          _modified?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          party_type: string
          tax_id: string
          tax_id_type: string
          telefono_principal?: string | null
          telefono_secundario?: string | null
          updated_at?: string | null
        }
        Update: {
          _deleted?: boolean | null
          _modified?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          party_type?: string
          tax_id?: string
          tax_id_type?: string
          telefono_principal?: string | null
          telefono_secundario?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      personas: {
        Row: {
          apellido_materno: string
          apellido_paterno: string
          created_at: string | null
          direccion: string | null
          email: string | null
          id: string
          nombres: string
          numero_documento: string
          parentesco_referencia: string | null
          telefono_principal: string | null
          telefono_secundario: string | null
          tipo_documento: string
          updated_at: string | null
        }
        Insert: {
          apellido_materno: string
          apellido_paterno: string
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombres: string
          numero_documento: string
          parentesco_referencia?: string | null
          telefono_principal?: string | null
          telefono_secundario?: string | null
          tipo_documento?: string
          updated_at?: string | null
        }
        Update: {
          apellido_materno?: string
          apellido_paterno?: string
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombres?: string
          numero_documento?: string
          parentesco_referencia?: string | null
          telefono_principal?: string | null
          telefono_secundario?: string | null
          tipo_documento?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      personas_juridicas: {
        Row: {
          fecha_constitucion: string | null
          nombre_comercial: string | null
          party_id: string
          razon_social: string
          representante_legal_id: string | null
          tipo_sociedad: string | null
        }
        Insert: {
          fecha_constitucion?: string | null
          nombre_comercial?: string | null
          party_id: string
          razon_social: string
          representante_legal_id?: string | null
          tipo_sociedad?: string | null
        }
        Update: {
          fecha_constitucion?: string | null
          nombre_comercial?: string | null
          party_id?: string
          razon_social?: string
          representante_legal_id?: string | null
          tipo_sociedad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_juridicas_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: true
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personas_juridicas_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: true
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personas_juridicas_representante_legal_id_fkey"
            columns: ["representante_legal_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personas_juridicas_representante_legal_id_fkey"
            columns: ["representante_legal_id"]
            isOneToOne: false
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      personas_naturales: {
        Row: {
          apellido_materno: string | null
          apellido_paterno: string
          fecha_nacimiento: string | null
          nombres: string
          party_id: string
          sexo: string | null
        }
        Insert: {
          apellido_materno?: string | null
          apellido_paterno: string
          fecha_nacimiento?: string | null
          nombres: string
          party_id: string
          sexo?: string | null
        }
        Update: {
          apellido_materno?: string | null
          apellido_paterno?: string
          fecha_nacimiento?: string | null
          nombres?: string
          party_id?: string
          sexo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_naturales_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: true
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personas_naturales_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: true
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      provincias: {
        Row: {
          activo: boolean
          codigo: string
          departamento_codigo: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          departamento_codigo: string
          nombre: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          departamento_codigo?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "provincias_departamento_codigo_fkey"
            columns: ["departamento_codigo"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["codigo"]
          },
        ]
      }
      roles: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          nivel_acceso: number | null
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nivel_acceso?: number | null
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nivel_acceso?: number | null
          nombre?: string
        }
        Relationships: []
      }
      sucursales: {
        Row: {
          activa: boolean | null
          codigo: string
          created_at: string | null
          direccion: string | null
          empresa_id: string | null
          es_principal: boolean | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          codigo: string
          created_at?: string | null
          direccion?: string | null
          empresa_id?: string | null
          es_principal?: boolean | null
          id?: string
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          codigo?: string
          created_at?: string | null
          direccion?: string | null
          empresa_id?: string | null
          es_principal?: boolean | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sucursales_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      sugerencias_catalogos: {
        Row: {
          categoria_padre: string | null
          created_at: string | null
          estado: string | null
          id: string
          tipo: string
          usuario_id: string | null
          valor_sugerido: string
        }
        Insert: {
          categoria_padre?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          tipo: string
          usuario_id?: string | null
          valor_sugerido: string
        }
        Update: {
          categoria_padre?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          tipo?: string
          usuario_id?: string | null
          valor_sugerido?: string
        }
        Relationships: [
          {
            foreignKeyName: "sugerencias_catalogos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          caja_cierre_ciego: boolean | null
          caja_permiso_anular_recibo: boolean | null
          created_at: string | null
          credito_calculo_interes_anticipado: string | null
          credito_interes_moratorio_diario: number | null
          credito_liberacion_garantia_parcial: boolean | null
          credito_renovacion_genera_nuevo_contrato: boolean | null
          id: string
          precio_oro_10k_pen: number | null
          precio_oro_14k_pen: number | null
          precio_oro_18k_pen: number | null
          precio_oro_21k_pen: number | null
          precio_oro_22k_pen: number | null
          precio_oro_24k_pen: number | null
          precio_oro_source: string | null
          precio_oro_updated_at: string | null
          remate_devolver_excedente: boolean | null
          remate_precio_base_automatico: boolean | null
          tesoreria_retiro_desde_caja: boolean | null
          tesoreria_separar_cuentas_socios: boolean | null
          updated_at: string | null
          updated_by: string | null
          yape_destino_personal_permitido: boolean | null
          yape_exigir_evidencia: boolean | null
          yape_limite_diario: number | null
        }
        Insert: {
          caja_cierre_ciego?: boolean | null
          caja_permiso_anular_recibo?: boolean | null
          created_at?: string | null
          credito_calculo_interes_anticipado?: string | null
          credito_interes_moratorio_diario?: number | null
          credito_liberacion_garantia_parcial?: boolean | null
          credito_renovacion_genera_nuevo_contrato?: boolean | null
          id?: string
          precio_oro_10k_pen?: number | null
          precio_oro_14k_pen?: number | null
          precio_oro_18k_pen?: number | null
          precio_oro_21k_pen?: number | null
          precio_oro_22k_pen?: number | null
          precio_oro_24k_pen?: number | null
          precio_oro_source?: string | null
          precio_oro_updated_at?: string | null
          remate_devolver_excedente?: boolean | null
          remate_precio_base_automatico?: boolean | null
          tesoreria_retiro_desde_caja?: boolean | null
          tesoreria_separar_cuentas_socios?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          yape_destino_personal_permitido?: boolean | null
          yape_exigir_evidencia?: boolean | null
          yape_limite_diario?: number | null
        }
        Update: {
          caja_cierre_ciego?: boolean | null
          caja_permiso_anular_recibo?: boolean | null
          created_at?: string | null
          credito_calculo_interes_anticipado?: string | null
          credito_interes_moratorio_diario?: number | null
          credito_liberacion_garantia_parcial?: boolean | null
          credito_renovacion_genera_nuevo_contrato?: boolean | null
          id?: string
          precio_oro_10k_pen?: number | null
          precio_oro_14k_pen?: number | null
          precio_oro_18k_pen?: number | null
          precio_oro_21k_pen?: number | null
          precio_oro_22k_pen?: number | null
          precio_oro_24k_pen?: number | null
          precio_oro_source?: string | null
          precio_oro_updated_at?: string | null
          remate_devolver_excedente?: boolean | null
          remate_precio_base_automatico?: boolean | null
          tesoreria_retiro_desde_caja?: boolean | null
          tesoreria_separar_cuentas_socios?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          yape_destino_personal_permitido?: boolean | null
          yape_exigir_evidencia?: boolean | null
          yape_limite_diario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_parentesco: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: number
          nombre: string
          orden: number | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: number
          nombre: string
          orden?: number | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: number
          nombre?: string
          orden?: number | null
        }
        Relationships: []
      }
      transacciones_bancarias: {
        Row: {
          banco: string
          cliente_nombre: string | null
          created_at: string | null
          credito_relacionado_id: string | null
          descripcion: string | null
          estado: string | null
          fecha: string
          id: string
          metadata: Json | null
          monto: number
          pago_relacionado_id: string | null
          referencia: string | null
        }
        Insert: {
          banco: string
          cliente_nombre?: string | null
          created_at?: string | null
          credito_relacionado_id?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha: string
          id?: string
          metadata?: Json | null
          monto: number
          pago_relacionado_id?: string | null
          referencia?: string | null
        }
        Update: {
          banco?: string
          cliente_nombre?: string | null
          created_at?: string | null
          credito_relacionado_id?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha?: string
          id?: string
          metadata?: Json | null
          monto?: number
          pago_relacionado_id?: string | null
          referencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_bancarias_credito_relacionado_id_fkey"
            columns: ["credito_relacionado_id"]
            isOneToOne: false
            referencedRelation: "creditos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_bancarias_credito_relacionado_id_fkey"
            columns: ["credito_relacionado_id"]
            isOneToOne: false
            referencedRelation: "vista_creditos_intereses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_bancarias_pago_relacionado_id_fkey"
            columns: ["pago_relacionado_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_bancarias_pago_relacionado_id_fkey"
            columns: ["pago_relacionado_id"]
            isOneToOne: false
            referencedRelation: "pagos_efectivos"
            referencedColumns: ["id"]
          },
        ]
      }
      transacciones_capital: {
        Row: {
          banco_origen: Database["public"]["Enums"]["banco_peru"] | null
          created_by: string | null
          descripcion: string | null
          destino_cuenta_id: string | null
          empresa_id: string | null
          evidencia_ref: string | null
          fecha_operacion: string | null
          id: string
          inversionista_id: string | null
          metadata: Json | null
          metodo_pago: Database["public"]["Enums"]["metodo_pago_peru"]
          monto: number
          numero_operacion: string | null
          origen_cuenta_id: string | null
          tipo: Database["public"]["Enums"]["tipo_transaccion_capital"]
        }
        Insert: {
          banco_origen?: Database["public"]["Enums"]["banco_peru"] | null
          created_by?: string | null
          descripcion?: string | null
          destino_cuenta_id?: string | null
          empresa_id?: string | null
          evidencia_ref?: string | null
          fecha_operacion?: string | null
          id?: string
          inversionista_id?: string | null
          metadata?: Json | null
          metodo_pago?: Database["public"]["Enums"]["metodo_pago_peru"]
          monto: number
          numero_operacion?: string | null
          origen_cuenta_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_transaccion_capital"]
        }
        Update: {
          banco_origen?: Database["public"]["Enums"]["banco_peru"] | null
          created_by?: string | null
          descripcion?: string | null
          destino_cuenta_id?: string | null
          empresa_id?: string | null
          evidencia_ref?: string | null
          fecha_operacion?: string | null
          id?: string
          inversionista_id?: string | null
          metadata?: Json | null
          metodo_pago?: Database["public"]["Enums"]["metodo_pago_peru"]
          monto?: number
          numero_operacion?: string | null
          origen_cuenta_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transaccion_capital"]
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_capital_destino_cuenta_id_fkey"
            columns: ["destino_cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas_financieras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_capital_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_capital_inversionista_id_fkey"
            columns: ["inversionista_id"]
            isOneToOne: false
            referencedRelation: "inversionistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_capital_origen_cuenta_id_fkey"
            columns: ["origen_cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas_financieras"
            referencedColumns: ["id"]
          },
        ]
      }
      transferencias_garantias: {
        Row: {
          articulo_id: string
          created_at: string | null
          id: string
          motivo: string | null
          sucursal_destino_id: string | null
          sucursal_origen_id: string | null
          usuario_id: string | null
        }
        Insert: {
          articulo_id: string
          created_at?: string | null
          id?: string
          motivo?: string | null
          sucursal_destino_id?: string | null
          sucursal_origen_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          articulo_id?: string
          created_at?: string | null
          id?: string
          motivo?: string | null
          sucursal_destino_id?: string | null
          sucursal_origen_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transferencias_garantias_sucursal_destino_id_fkey"
            columns: ["sucursal_destino_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_garantias_sucursal_origen_id_fkey"
            columns: ["sucursal_origen_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_garantias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ubicaciones_cobradores: {
        Row: {
          cobrador_id: string
          id: string
          timestamp: string | null
          ubicacion: Json
        }
        Insert: {
          cobrador_id: string
          id?: string
          timestamp?: string | null
          ubicacion: Json
        }
        Update: {
          cobrador_id?: string
          id?: string
          timestamp?: string | null
          ubicacion?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ubicaciones_cobradores_cobrador_id_fkey"
            columns: ["cobrador_id"]
            isOneToOne: true
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubicaciones_cobradores_cobrador_id_fkey"
            columns: ["cobrador_id"]
            isOneToOne: true
            referencedRelation: "empleados_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          activo: boolean | null
          apellido_materno: string | null
          apellido_paterno: string | null
          created_at: string | null
          dni: string | null
          email: string
          empresa_id: string | null
          id: string
          nombres: string
          rol: string | null
          rol_id: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          created_at?: string | null
          dni?: string | null
          email: string
          empresa_id?: string | null
          id?: string
          nombres: string
          rol?: string | null
          rol_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          created_at?: string | null
          dni?: string | null
          email?: string
          empresa_id?: string | null
          id?: string
          nombres?: string
          rol?: string | null
          rol_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      ventas_remates: {
        Row: {
          articulo_id: string
          comprador: string | null
          comprador_telefono: string | null
          created_at: string | null
          id: string
          metodo_pago: string | null
          precio_venta: number
          utilidad: number | null
          valor_original: number | null
          vendedor_id: string | null
        }
        Insert: {
          articulo_id: string
          comprador?: string | null
          comprador_telefono?: string | null
          created_at?: string | null
          id?: string
          metodo_pago?: string | null
          precio_venta: number
          utilidad?: number | null
          valor_original?: number | null
          vendedor_id?: string | null
        }
        Update: {
          articulo_id?: string
          comprador?: string | null
          comprador_telefono?: string | null
          created_at?: string | null
          id?: string
          metodo_pago?: string | null
          precio_venta?: number
          utilidad?: number | null
          valor_original?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventas_remates_articulo_id_fkey"
            columns: ["articulo_id"]
            isOneToOne: false
            referencedRelation: "garantias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_remates_articulo_id_fkey"
            columns: ["articulo_id"]
            isOneToOne: false
            referencedRelation: "inventario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_remates_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_remates_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "empleados_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      verificacion_whatsapp: {
        Row: {
          codigo: string
          creado_en: string | null
          creado_por: string | null
          expira_en: string
          id: string
          telefono: string
          verificado: boolean | null
        }
        Insert: {
          codigo: string
          creado_en?: string | null
          creado_por?: string | null
          expira_en: string
          id?: string
          telefono: string
          verificado?: boolean | null
        }
        Update: {
          codigo?: string
          creado_en?: string | null
          creado_por?: string | null
          expira_en?: string
          id?: string
          telefono?: string
          verificado?: boolean | null
        }
        Relationships: []
      }
      visitas: {
        Row: {
          cobrador_id: string
          created_at: string | null
          credito_id: string
          fotos: string[] | null
          id: string
          monto_cobrado: number | null
          notas: string | null
          resultado: string
          ubicacion: Json | null
        }
        Insert: {
          cobrador_id: string
          created_at?: string | null
          credito_id: string
          fotos?: string[] | null
          id?: string
          monto_cobrado?: number | null
          notas?: string | null
          resultado: string
          ubicacion?: Json | null
        }
        Update: {
          cobrador_id?: string
          created_at?: string | null
          credito_id?: string
          fotos?: string[] | null
          id?: string
          monto_cobrado?: number | null
          notas?: string | null
          resultado?: string
          ubicacion?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "visitas_cobrador_id_fkey"
            columns: ["cobrador_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_cobrador_id_fkey"
            columns: ["cobrador_id"]
            isOneToOne: false
            referencedRelation: "empleados_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "creditos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "vista_creditos_intereses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      categorias_pendientes_promocion: {
        Row: {
          created_at: string | null
          id: number | null
          prioridad: string | null
          prioridad_orden: number | null
          texto_ingresado: string | null
          tipo: string | null
          ultimo_uso: string | null
          veces_usado: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number | null
          prioridad?: never
          prioridad_orden?: never
          texto_ingresado?: string | null
          tipo?: string | null
          ultimo_uso?: string | null
          veces_usado?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number | null
          prioridad?: never
          prioridad_orden?: never
          texto_ingresado?: string | null
          tipo?: string | null
          ultimo_uso?: string | null
          veces_usado?: number | null
        }
        Relationships: []
      }
      clientes_completo: {
        Row: {
          activo: boolean | null
          apellido_materno: string | null
          apellido_paterno: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          empresa_id: string | null
          id: string | null
          nombre_completo: string | null
          nombres: string | null
          numero_documento: string | null
          party_id: string | null
          party_type: string | null
          razon_social: string | null
          score_crediticio: number | null
          telefono_principal: string | null
          tipo_documento: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      empleados_completo: {
        Row: {
          activo: boolean | null
          apellido_materno: string | null
          apellido_paterno: string | null
          cargo: string | null
          created_at: string | null
          email: string | null
          empresa_id: string | null
          fecha_ingreso: string | null
          fecha_salida: string | null
          id: string | null
          nombre_completo: string | null
          nombres: string | null
          numero_documento: string | null
          party_id: string | null
          sucursal_id: string | null
          sucursal_nombre: string | null
          telefono_principal: string | null
          tipo_documento: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empleados_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empleados_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sucursales_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario: {
        Row: {
          categoria_id: string | null
          categoria_nombre: string | null
          cliente_id: string | null
          created_at: string | null
          credito_id: string | null
          descripcion: string | null
          estado: string | null
          estado_bien: string | null
          fotos: string[] | null
          id: string | null
          para_remate: boolean | null
          subcategoria: string | null
          valor_tasado: number | null
        }
        Relationships: [
          {
            foreignKeyName: "garantias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_garantia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "creditos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garantias_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "vista_creditos_intereses"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_efectivos: {
        Row: {
          anulado: boolean | null
          anulado_at: string | null
          anulado_por: string | null
          caja_id: string | null
          caja_operativa_id: string | null
          descripcion: string | null
          efecto_neto: number | null
          es_reversion: boolean | null
          fecha: string | null
          id: string | null
          metadata: Json | null
          monto: number | null
          motivo: string | null
          motivo_anulacion: string | null
          movimiento_original_id: string | null
          movimiento_reversion_id: string | null
          referencia_id: string | null
          saldo_anterior: number | null
          saldo_nuevo: number | null
          tipo: string | null
          usuario_id: string | null
        }
        Insert: {
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_id?: string | null
          caja_operativa_id?: string | null
          descripcion?: string | null
          efecto_neto?: never
          es_reversion?: boolean | null
          fecha?: string | null
          id?: string | null
          metadata?: Json | null
          monto?: number | null
          motivo?: string | null
          motivo_anulacion?: string | null
          movimiento_original_id?: string | null
          movimiento_reversion_id?: string | null
          referencia_id?: string | null
          saldo_anterior?: number | null
          saldo_nuevo?: number | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Update: {
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_id?: string | null
          caja_operativa_id?: string | null
          descripcion?: string | null
          efecto_neto?: never
          es_reversion?: boolean | null
          fecha?: string | null
          id?: string | null
          metadata?: Json | null
          monto?: number | null
          motivo?: string | null
          motivo_anulacion?: string | null
          movimiento_original_id?: string | null
          movimiento_reversion_id?: string | null
          referencia_id?: string | null
          saldo_anterior?: number | null
          saldo_nuevo?: number | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_caja_operativa_caja_id_fkey"
            columns: ["caja_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_caja_operativa_id_fkey"
            columns: ["caja_operativa_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_movimiento_original_id_fkey"
            columns: ["movimiento_original_id"]
            isOneToOne: false
            referencedRelation: "movimientos_caja_operativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_movimiento_original_id_fkey"
            columns: ["movimiento_original_id"]
            isOneToOne: false
            referencedRelation: "movimientos_efectivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_movimiento_reversion_id_fkey"
            columns: ["movimiento_reversion_id"]
            isOneToOne: false
            referencedRelation: "movimientos_caja_operativa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_movimiento_reversion_id_fkey"
            columns: ["movimiento_reversion_id"]
            isOneToOne: false
            referencedRelation: "movimientos_efectivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_operativa_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_efectivos: {
        Row: {
          anulado: boolean | null
          anulado_at: string | null
          anulado_por: string | null
          caja_operativa_id: string | null
          created_at: string | null
          credito_id: string | null
          desglose_capital: number | null
          desglose_interes: number | null
          desglose_mora: number | null
          fecha_pago: string | null
          id: string | null
          medio_pago: string | null
          metadata: Json | null
          metodo_pago: string | null
          monto_total: number | null
          motivo_anulacion: string | null
          observaciones: string | null
          tipo: string | null
          usuario_id: string | null
        }
        Insert: {
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_operativa_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          desglose_capital?: number | null
          desglose_interes?: number | null
          desglose_mora?: number | null
          fecha_pago?: string | null
          id?: string | null
          medio_pago?: string | null
          metadata?: Json | null
          metodo_pago?: string | null
          monto_total?: number | null
          motivo_anulacion?: string | null
          observaciones?: string | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Update: {
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_operativa_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          desglose_capital?: number | null
          desglose_interes?: number | null
          desglose_mora?: number | null
          fecha_pago?: string | null
          id?: string | null
          medio_pago?: string | null
          metadata?: Json | null
          metodo_pago?: string | null
          monto_total?: number | null
          motivo_anulacion?: string | null
          observaciones?: string | null
          tipo?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_caja_operativa_id_fkey"
            columns: ["caja_operativa_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "creditos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_credito_id_fkey"
            columns: ["credito_id"]
            isOneToOne: false
            referencedRelation: "vista_creditos_intereses"
            referencedColumns: ["id"]
          },
        ]
      }
      parentesco_opciones: {
        Row: {
          id: number | null
          nombre: string | null
          orden: number | null
        }
        Insert: {
          id?: number | null
          nombre?: string | null
          orden?: number | null
        }
        Update: {
          id?: number | null
          nombre?: string | null
          orden?: number | null
        }
        Relationships: []
      }
      parties_completo: {
        Row: {
          apellido_materno: string | null
          apellido_paterno: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          fecha_constitucion: string | null
          fecha_nacimiento: string | null
          id: string | null
          nombre_comercial: string | null
          nombre_completo: string | null
          nombres: string | null
          party_type: string | null
          razon_social: string | null
          representante_legal_id: string | null
          sexo: string | null
          tax_id: string | null
          tax_id_type: string | null
          telefono_principal: string | null
          telefono_secundario: string | null
          tipo_sociedad: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_juridicas_representante_legal_id_fkey"
            columns: ["representante_legal_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personas_juridicas_representante_legal_id_fkey"
            columns: ["representante_legal_id"]
            isOneToOne: false
            referencedRelation: "parties_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      vista_creditos_intereses: {
        Row: {
          cliente_dni: string | null
          cliente_nombre: string | null
          codigo: string | null
          dias_transcurridos: number | null
          estado_detallado: string | null
          fecha_desembolso: string | null
          fecha_vencimiento: string | null
          id: string | null
          interes_devengado_actual: number | null
          interes_total_vencimiento: number | null
          monto_prestado: number | null
          porcentaje_devengado: number | null
          saldo_pendiente: number | null
          tasa_interes: number | null
        }
        Relationships: []
      }
      vista_rendimientos_inversionistas: {
        Row: {
          capital_pendiente: number | null
          contrato_id: string | null
          dias_transcurridos: number | null
          estado: Database["public"]["Enums"]["estado_contrato_fondeo"] | null
          fecha_inicio: string | null
          fecha_vencimiento: string | null
          inversionista_id: string | null
          monto_pactado: number | null
          monto_rendimientos_pagados: number | null
          nombre_inversionista: string | null
          rendimiento_devengado: number | null
          rendimiento_pendiente_pago: number | null
          tasa_retorno: number | null
          tipo_contrato:
          | Database["public"]["Enums"]["tipo_contrato_fondeo"]
          | null
          tipo_relacion:
          | Database["public"]["Enums"]["tipo_inversionista"]
          | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_fondeo_inversionista_id_fkey"
            columns: ["inversionista_id"]
            isOneToOne: false
            referencedRelation: "inversionistas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_asignar_caja: {
        Args: {
          p_monto: number
          p_observacion: string
          p_usuario_cajero_id: string
        }
        Returns: string
      }
      admin_inyectar_capital: {
        Args: {
          p_metadata?: Json
          p_monto: number
          p_origen: string
          p_referencia: string
        }
        Returns: string
      }
      anular_pago: {
        Args: { p_motivo: string; p_pago_id: string; p_usuario_id?: string }
        Returns: {
          mensaje: string
          success: boolean
        }[]
      }
      buscar_clientes_con_creditos: {
        Args: { p_is_dni?: boolean; p_limit?: number; p_search_term: string }
        Returns: Json
      }
      calcular_interes_actual: {
        Args: { p_credito_id: string; p_fecha_calculo?: string }
        Returns: number
      }
      calcular_saldo_caja: { Args: { p_caja_id: string }; Returns: number }
      cerrar_caja_oficial: {
        Args: {
          p_caja_id: string
          p_monto_fisico: number
          p_observaciones?: string
        }
        Returns: Json
      }
      conciliar_caja_dia: {
        Args: { p_fecha: string }
        Returns: {
          cuadra: boolean
          detalle: Json
          diferencia: number
          saldo_esperado: number
          saldo_real: number
        }[]
      }
      crear_contrato_oficial: {
        Args: {
          p_caja_id: string
          p_cliente_doc_num: string
          p_cliente_doc_tipo: string
          p_cliente_nombre: string
          p_contrato_data: Json
          p_garantia_data: Json
        }
        Returns: string
      }
      crear_credito_completo: {
        Args: {
          p_caja_id?: string
          p_cliente_id: string
          p_descripcion_garantia: string
          p_fecha_inicio: string
          p_fotos: string[]
          p_monto_prestamo: number
          p_observaciones?: string
          p_periodo_dias: number
          p_tasa_interes: number
          p_usuario_id?: string
          p_valor_tasacion: number
        }
        Returns: Json
      }
      detectar_actividad_sospechosa: {
        Args: never
        Returns: {
          acciones_count: number
          alerta: string
          empleado_id: string
          empleado_nombre: string
          ultima_accion: string
        }[]
      }
      detectar_descuadres: {
        Args: { p_ultimos_dias?: number }
        Returns: {
          caja_id: string
          cajero_nombre: string
          diferencia: number
          fecha: string
          saldo_esperado: number
          saldo_real: number
        }[]
      }
      generar_reporte_cierre: { Args: { p_fecha: string }; Returns: Json }
      get_actividad_empleado: {
        Args: { p_empleado_id: string; p_limit?: number }
        Returns: {
          accion: string
          created_at: string
          descripcion: string
          registro_id: string
          tabla: string
        }[]
      }
      get_auditoria_registro: {
        Args: { p_registro_id: string; p_tabla: string }
        Returns: {
          accion: string
          audit_id: string
          created_at: string
          datos_antes: Json
          datos_despues: Json
          empleado_nombre: string
        }[]
      }
      get_cartera_risk_summary: {
        Args: never
        Returns: {
          cantidad: number
          estado_grupo: string
          total_saldo: number
        }[]
      }
      get_contratos_renovables: {
        Args: { p_dias?: number }
        Returns: {
          cliente_id: string
          cliente_nombre: string
          cliente_telefono: string
          codigo: string
          dias_restantes: number
          dias_transcurridos: number
          fecha_creacion: string
          fecha_vencimiento: string
          garantia_descripcion: string
          id: string
          interes_acumulado: number
          monto_prestado: number
          saldo_pendiente: number
          tasa_interes: number
          urgencia: string
        }[]
      }
      get_contratos_vencimientos: {
        Args: { p_dias?: number }
        Returns: {
          cliente: string
          cliente_id: string
          codigo: string
          dias_restantes: number
          dni: string
          fecha_vencimiento: string
          id: string
          monto: number
          saldo: number
          telefono: string
        }[]
      }
      get_dashboard_complete: { Args: { p_usuario_id: string }; Returns: Json }
      get_empleado_empresa: { Args: { p_sucursal_id: string }; Returns: string }
      get_historial_notificaciones: {
        Args: { p_credito_id: string }
        Returns: Json
      }
      get_movimientos_dia: {
        Args: { p_fecha: string }
        Returns: {
          cantidad_operaciones: number
          categoria: string
          monto_promedio: number
          monto_total: number
          tipo_movimiento: string
        }[]
      }
      get_or_create_party: {
        Args: {
          p_apellido_materno?: string
          p_apellido_paterno?: string
          p_direccion?: string
          p_email?: string
          p_nombres?: string
          p_party_type: string
          p_razon_social?: string
          p_tax_id: string
          p_tax_id_type: string
          p_telefono?: string
        }
        Returns: string
      }
      get_or_create_persona: {
        Args: {
          p_apellido_materno: string
          p_apellido_paterno: string
          p_direccion?: string
          p_email?: string
          p_nombres: string
          p_numero_documento: string
          p_telefono?: string
          p_tipo_documento: string
        }
        Returns: string
      }
      get_saldo_caja_efectivo: { Args: { p_caja_id: string }; Returns: number }
      get_upcoming_expirations: {
        Args: { p_days?: number }
        Returns: {
          cliente_nombre: string
          codigo: string
          dias_restantes: number
          fecha_vencimiento: string
          garantia_descripcion: string
          garantia_foto: string
          id: string
          monto_prestamo: number
          telefono: string
        }[]
      }
      get_user_empresa: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      get_vencimientos_agrupados: {
        Args: never
        Returns: {
          cantidad: number
          contratos: Json
          periodo: string
        }[]
      }
      job_actualizar_estados_creditos: { Args: never; Returns: undefined }
      limpiar_codigos_expirados: { Args: never; Returns: undefined }
      obtener_resumen_rendimientos: {
        Args: never
        Returns: {
          contratos_activos: number
          inversionistas_activos: number
          total_capital_activo: number
          total_pendiente_pago: number
          total_rendimientos_devengados: number
          total_rendimientos_pagados: number
        }[]
      }
      promover_categoria_sugerida: {
        Args: { p_id: number; p_promovido_a: string }
        Returns: boolean
      }
      proyectar_interes: {
        Args: { p_credito_id: string; p_dias_adicionales: number }
        Returns: {
          dias_totales: number
          interes_proyectado: number
          total_a_pagar: number
        }[]
      }
      puede_anular_movimiento: {
        Args: { p_movimiento_id: string; p_usuario_id: string }
        Returns: boolean
      }
      puede_enviar_notificacion: {
        Args: { p_credito_id: string; p_horas_minimas?: number }
        Returns: Json
      }
      registrar_categoria_otro: {
        Args: { p_texto: string; p_tipo: string }
        Returns: undefined
      }
      registrar_evento: {
        Args: {
          p_agregado_id: string
          p_agregado_tipo: string
          p_evento_tipo: string
          p_payload?: Json
          p_usuario_id?: string
        }
        Returns: number
      }
      registrar_pago_oficial:
      | {
        Args: {
          p_caja_id: string
          p_credito_id: string
          p_metadata?: Json
          p_metodo_pago: string
          p_monto_pago: number
          p_tipo_operacion: string
        }
        Returns: Json
      }
      | {
        Args: {
          p_caja_id: string
          p_credito_id: string
          p_metadata?: Json
          p_metodo_pago: string
          p_monto_pago: number
          p_tipo_operacion: string
          p_usuario_id?: string
        }
        Returns: Json
      }
      reversar_movimiento: {
        Args: {
          p_motivo: string
          p_movimiento_id: string
          p_usuario_id?: string
        }
        Returns: {
          mensaje: string
          movimiento_reversion_id: string
          success: boolean
        }[]
      }
    }
    Enums: {
      banco_peru:
      | "BCP"
      | "BBVA"
      | "INTERBANK"
      | "SCOTIABANK"
      | "BANCO_NACION"
      | "CAJA_AREQUIPA"
      | "CAJA_PIURA"
      | "CAJA_CUSCO"
      | "CAJA_HUANCAYO"
      | "MIBANCO"
      | "PICHINCHA"
      | "BANBIF"
      | "OTRO"
      estado_contrato_fondeo: "ACTIVO" | "PAUSADO" | "LIQUIDADO" | "CANCELADO"
      frecuencia_pago_fondeo:
      | "SEMANAL"
      | "QUINCENAL"
      | "MENSUAL"
      | "TRIMESTRAL"
      | "AL_VENCIMIENTO"
      metodo_pago_peru:
      | "EFECTIVO"
      | "YAPE"
      | "PLIN"
      | "TRANSFERENCIA"
      | "CCI"
      | "CHEQUE"
      | "DEPOSITO_VENTANILLA"
      | "AGENTE"
      tipo_contrato_fondeo: "DEUDA_FIJA" | "PARTICIPACION_EQUITY"
      tipo_cuenta_financiera: "EFECTIVO" | "BANCO" | "DIGITAL" | "PASARELA"
      tipo_inversionista: "SOCIO" | "PRESTAMISTA"
      tipo_transaccion_capital:
      | "APORTE"
      | "RETIRO"
      | "PAGO_INTERES"
      | "TRANSFERENCIA_FONDEO"
      | "APERTURA_CAJA"
      | "CIERRE_CAJA"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      banco_peru: [
        "BCP",
        "BBVA",
        "INTERBANK",
        "SCOTIABANK",
        "BANCO_NACION",
        "CAJA_AREQUIPA",
        "CAJA_PIURA",
        "CAJA_CUSCO",
        "CAJA_HUANCAYO",
        "MIBANCO",
        "PICHINCHA",
        "BANBIF",
        "OTRO",
      ],
      estado_contrato_fondeo: ["ACTIVO", "PAUSADO", "LIQUIDADO", "CANCELADO"],
      frecuencia_pago_fondeo: [
        "SEMANAL",
        "QUINCENAL",
        "MENSUAL",
        "TRIMESTRAL",
        "AL_VENCIMIENTO",
      ],
      metodo_pago_peru: [
        "EFECTIVO",
        "YAPE",
        "PLIN",
        "TRANSFERENCIA",
        "CCI",
        "CHEQUE",
        "DEPOSITO_VENTANILLA",
        "AGENTE",
      ],
      tipo_contrato_fondeo: ["DEUDA_FIJA", "PARTICIPACION_EQUITY"],
      tipo_cuenta_financiera: ["EFECTIVO", "BANCO", "DIGITAL", "PASARELA"],
      tipo_inversionista: ["SOCIO", "PRESTAMISTA"],
      tipo_transaccion_capital: [
        "APORTE",
        "RETIRO",
        "PAGO_INTERES",
        "TRANSFERENCIA_FONDEO",
        "APERTURA_CAJA",
        "CIERRE_CAJA",
      ],
    },
  },
} as const

