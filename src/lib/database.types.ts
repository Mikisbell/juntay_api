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
      boveda_central: {
        Row: {
          empresa_id: string | null
          estado: string | null
          fecha_actualizacion: string | null
          id: string
          saldo_asignado: number
          saldo_disponible: number
          saldo_total: number
        }
        Insert: {
          empresa_id?: string | null
          estado?: string | null
          fecha_actualizacion?: string | null
          id?: string
          saldo_asignado?: number
          saldo_disponible?: number
          saldo_total?: number
        }
        Update: {
          empresa_id?: string | null
          estado?: string | null
          fecha_actualizacion?: string | null
          id?: string
          saldo_asignado?: number
          saldo_disponible?: number
          saldo_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "boveda_central_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cajas_operativas: {
        Row: {
          boveda_origen_id: string | null
          diferencia_cierre: number | null
          estado: string
          fecha_apertura: string | null
          fecha_cierre: string | null
          id: string
          numero_caja: number
          observaciones_cierre: string | null
          saldo_actual: number | null
          saldo_final_cierre: number | null
          saldo_inicial: number | null
          usuario_id: string
        }
        Insert: {
          boveda_origen_id?: string | null
          diferencia_cierre?: number | null
          estado?: string
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          id?: string
          numero_caja: number
          observaciones_cierre?: string | null
          saldo_actual?: number | null
          saldo_final_cierre?: number | null
          saldo_inicial?: number | null
          usuario_id: string
        }
        Update: {
          boveda_origen_id?: string | null
          diferencia_cierre?: number | null
          estado?: string
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          id?: string
          numero_caja?: number
          observaciones_cierre?: string | null
          saldo_actual?: number | null
          saldo_final_cierre?: number | null
          saldo_inicial?: number | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cajas_operativas_boveda_origen_id_fkey"
            columns: ["boveda_origen_id"]
            isOneToOne: false
            referencedRelation: "boveda_central"
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
          persona_id: string | null
          provincia: string | null
          score_crediticio: number | null
          telefono_principal: string | null
          tipo_documento: string
          ubigeo_cod: string | null
        }
        Insert: {
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
          persona_id?: string | null
          provincia?: string | null
          score_crediticio?: number | null
          telefono_principal?: string | null
          tipo_documento: string
          ubigeo_cod?: string | null
        }
        Update: {
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
          persona_id?: string | null
          provincia?: string | null
          score_crediticio?: number | null
          telefono_principal?: string | null
          tipo_documento?: string
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
            foreignKeyName: "clientes_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      creditos: {
        Row: {
          caja_origen_id: string | null
          cliente_id: string
          codigo: string | null
          codigo_credito: string | null
          created_at: string | null
          dias_transcurridos: number | null
          empresa_id: string | null
          estado: string | null
          estado_detallado: string
          fecha_desembolso: string | null
          fecha_inicio: string | null
          fecha_vencimiento: string
          garantia_id: string | null
          id: string
          interes_acumulado: number | null
          interes_devengado_actual: number | null
          monto_prestado: number
          observaciones: string | null
          periodo_dias: number
          saldo_pendiente: number
          tasa_interes: number
          updated_at: string | null
        }
        Insert: {
          caja_origen_id?: string | null
          cliente_id: string
          codigo?: string | null
          codigo_credito?: string | null
          created_at?: string | null
          dias_transcurridos?: number | null
          empresa_id?: string | null
          estado?: string | null
          estado_detallado: string
          fecha_desembolso?: string | null
          fecha_inicio?: string | null
          fecha_vencimiento: string
          garantia_id?: string | null
          id?: string
          interes_acumulado?: number | null
          interes_devengado_actual?: number | null
          monto_prestado: number
          observaciones?: string | null
          periodo_dias: number
          saldo_pendiente: number
          tasa_interes: number
          updated_at?: string | null
        }
        Update: {
          caja_origen_id?: string | null
          cliente_id?: string
          codigo?: string | null
          codigo_credito?: string | null
          created_at?: string | null
          dias_transcurridos?: number | null
          empresa_id?: string | null
          estado?: string | null
          estado_detallado?: string
          fecha_desembolso?: string | null
          fecha_inicio?: string | null
          fecha_vencimiento?: string
          garantia_id?: string | null
          id?: string
          interes_acumulado?: number | null
          interes_devengado_actual?: number | null
          monto_prestado?: number
          observaciones?: string | null
          periodo_dias?: number
          saldo_pendiente?: number
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
            foreignKeyName: "creditos_garantia_id_fkey"
            columns: ["garantia_id"]
            isOneToOne: false
            referencedRelation: "garantias"
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
          fecha_ingreso: string | null
          fecha_salida: string | null
          id: string
          persona_id: string
          sucursal_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activo?: boolean | null
          cargo: string
          created_at?: string | null
          fecha_ingreso?: string | null
          fecha_salida?: string | null
          id?: string
          persona_id: string
          sucursal_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activo?: boolean | null
          cargo?: string
          created_at?: string | null
          fecha_ingreso?: string | null
          fecha_salida?: string | null
          id?: string
          persona_id?: string
          sucursal_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
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
      garantias: {
        Row: {
          anio: number | null
          area: number | null
          capacidad: string | null
          categoria_id: string | null
          cliente_id: string | null
          created_at: string | null
          credito_id: string | null
          descripcion: string
          estado: string | null
          estado_bien: string | null
          fecha_venta: string | null
          fotos: string[] | null
          fotos_urls: string[] | null
          id: string
          kilometraje: number | null
          marca: string | null
          modelo: string | null
          partida_registral: string | null
          peso: number | null
          placa: string | null
          precio_venta: number | null
          quilataje: string | null
          serie: string | null
          subcategoria: string | null
          ubicacion: string | null
          valor_prestamo_sugerido: number | null
          valor_tasacion: number
        }
        Insert: {
          anio?: number | null
          area?: number | null
          capacidad?: string | null
          categoria_id?: string | null
          cliente_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          descripcion: string
          estado?: string | null
          estado_bien?: string | null
          fecha_venta?: string | null
          fotos?: string[] | null
          fotos_urls?: string[] | null
          id?: string
          kilometraje?: number | null
          marca?: string | null
          modelo?: string | null
          partida_registral?: string | null
          peso?: number | null
          placa?: string | null
          precio_venta?: number | null
          quilataje?: string | null
          serie?: string | null
          subcategoria?: string | null
          ubicacion?: string | null
          valor_prestamo_sugerido?: number | null
          valor_tasacion: number
        }
        Update: {
          anio?: number | null
          area?: number | null
          capacidad?: string | null
          categoria_id?: string | null
          cliente_id?: string | null
          created_at?: string | null
          credito_id?: string | null
          descripcion?: string
          estado?: string | null
          estado_bien?: string | null
          fecha_venta?: string | null
          fotos?: string[] | null
          fotos_urls?: string[] | null
          id?: string
          kilometraje?: number | null
          marca?: string | null
          modelo?: string | null
          partida_registral?: string | null
          peso?: number | null
          placa?: string | null
          precio_venta?: number | null
          quilataje?: string | null
          serie?: string | null
          subcategoria?: string | null
          ubicacion?: string | null
          valor_prestamo_sugerido?: number | null
          valor_tasacion?: number
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
        ]
      }
      movimientos_boveda_auditoria: {
        Row: {
          boveda_id: string
          caja_operativa_id: string | null
          fecha: string | null
          id: string
          metadata: Json | null
          monto: number
          referencia: string | null
          saldo_anterior: number | null
          saldo_nuevo: number | null
          tipo: string
          usuario_responsable_id: string | null
        }
        Insert: {
          boveda_id: string
          caja_operativa_id?: string | null
          fecha?: string | null
          id?: string
          metadata?: Json | null
          monto: number
          referencia?: string | null
          saldo_anterior?: number | null
          saldo_nuevo?: number | null
          tipo: string
          usuario_responsable_id?: string | null
        }
        Update: {
          boveda_id?: string
          caja_operativa_id?: string | null
          fecha?: string | null
          id?: string
          metadata?: Json | null
          monto?: number
          referencia?: string | null
          saldo_anterior?: number | null
          saldo_nuevo?: number | null
          tipo?: string
          usuario_responsable_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_boveda_auditoria_boveda_id_fkey"
            columns: ["boveda_id"]
            isOneToOne: false
            referencedRelation: "boveda_central"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_boveda_auditoria_caja_operativa_id_fkey"
            columns: ["caja_operativa_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_boveda_auditoria_usuario_responsable_id_fkey"
            columns: ["usuario_responsable_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_caja_operativa: {
        Row: {
          anulado: boolean | null
          anulado_at: string | null
          anulado_por: string | null
          caja_id: string | null
          caja_operativa_id: string
          descripcion: string | null
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
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_id?: string | null
          caja_operativa_id: string
          descripcion?: string | null
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
          anulado?: boolean | null
          anulado_at?: string | null
          anulado_por?: string | null
          caja_id?: string | null
          caja_operativa_id?: string
          descripcion?: string | null
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
            foreignKeyName: "movimientos_caja_operativa_caja_operativa_id_fkey"
            columns: ["caja_operativa_id"]
            isOneToOne: false
            referencedRelation: "cajas_operativas"
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
        Relationships: []
      }
      pagos: {
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
          id: string
          medio_pago: string | null
          metadata: Json | null
          metodo_pago: string | null
          monto_total: number
          motivo_anulacion: string | null
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
          id?: string
          medio_pago?: string | null
          metadata?: Json | null
          metodo_pago?: string | null
          monto_total: number
          motivo_anulacion?: string | null
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
          id?: string
          medio_pago?: string | null
          metadata?: Json | null
          metodo_pago?: string | null
          monto_total?: number
          motivo_anulacion?: string | null
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
          telefono_principal?: string | null
          telefono_secundario?: string | null
          tipo_documento?: string
          updated_at?: string | null
        }
        Relationships: []
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
    }
    Views: {
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
          persona_id: string | null
          score_crediticio: number | null
          telefono_principal: string | null
          telefono_secundario: string | null
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
            foreignKeyName: "clientes_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
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
          direccion: string | null
          email: string | null
          fecha_ingreso: string | null
          fecha_salida: string | null
          id: string | null
          nombre_completo: string | null
          nombres: string | null
          numero_documento: string | null
          persona_id: string | null
          sucursal_id: string | null
          telefono_principal: string | null
          tipo_documento: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empleados_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "personas"
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
          fecha_vencimiento: string
          garantia_descripcion: string
          id: string
          interes_acumulado: number
          monto_prestado: number
          saldo_pendiente: number
          urgencia: string
        }[]
      }
      get_contratos_vencimientos: {
        Args: { p_dias?: number }
        Returns: {
          cliente: string
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
      proyectar_interes: {
        Args: { p_credito_id: string; p_dias_adicionales: number }
        Returns: {
          dias_totales: number
          interes_proyectado: number
          total_a_pagar: number
        }[]
      }
      puede_enviar_notificacion: {
        Args: { p_credito_id: string; p_horas_minimas?: number }
        Returns: Json
      }
      registrar_pago_oficial: {
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
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

