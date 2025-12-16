/**
 * Script para crear el bucket 'garantias' en Supabase Storage
 * Ejecutar: node scripts/create-storage-bucket.js
 */

import { createClient } from '@supabase/supabase-js'

// Lee las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Faltan variables de entorno')
    console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createGarantiasBucket() {
    console.log('🚀 Creando bucket "garantias"...')

    try {
        // 1. Crear el bucket
        const { data: bucket, error: bucketError } = await supabase.storage.createBucket('garantias', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        })

        if (bucketError) {
            if (bucketError.message.includes('already exists')) {
                console.log('ℹ️  El bucket "garantias" ya existe')
            } else {
                console.error('❌ Error creando bucket:', bucketError)
                throw bucketError
            }
        } else {
            console.log('✅ Bucket "garantias" creado exitosamente')
        }

        // 2. Verificar que existe
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()

        if (listError) {
            console.error('❌ Error listando buckets:', listError)
            throw listError
        }

        const garantiasBucket = buckets.find(b => b.id === 'garantias')

        if (garantiasBucket) {
            console.log('✅ Bucket verificado:')
            console.log('   - ID:', garantiasBucket.id)
            console.log('   - Público:', garantiasBucket.public)
            console.log('   - Límite:', '5MB')
            console.log('')
            console.log('🎉 ¡Listo! Ahora puedes subir fotos de garantías')
        } else {
            console.error('❌ El bucket no se encuentra en la lista')
        }

    } catch (error) {
        console.error('❌ Error fatal:', error)
        process.exit(1)
    }
}

createGarantiasBucket()
