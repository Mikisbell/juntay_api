require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createAuthUser() {
  console.log('🔐 Creando usuario Auth DEMO...\n');

  const email = 'admin@demo.juntay.io';
  const password = 'Demo123456!';

  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirmar email
    user_metadata: {
      rol: 'admin',
      nombre: 'Admin Demo'
    }
  });

  if (error) {
    console.error('❌ Error:', error.message);
    
    // Si el usuario ya existe, intentar actualizar
    if (error.message.includes('already registered')) {
      console.log('ℹ️  Usuario ya existe, actualizando contraseña...');
      
      // Buscar el usuario
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);
      
      if (existingUser) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: password }
        );
        
        if (updateError) {
          console.error('❌ Error actualizando:', updateError.message);
        } else {
          console.log('✅ Contraseña actualizada');
          console.log('\n📧 Email:', email);
          console.log('🔑 Password:', password);
        }
      }
    }
    return;
  }

  console.log('✅ Usuario Auth creado exitosamente!\n');
  console.log('═'.repeat(50));
  console.log('🔐 CREDENCIALES DE LOGIN');
  console.log('═'.repeat(50));
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('═'.repeat(50));
  console.log('\n💡 Ahora puedes hacer login en:');
  console.log('   http://localhost:3003/login');
}

createAuthUser().catch(console.error);
