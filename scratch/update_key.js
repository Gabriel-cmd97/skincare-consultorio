const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tntlfhcnnentivpbjiyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudGxmaGNubmVudGl2cGJqaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NDYxNDQsImV4cCI6MjA5MjMyMjE0NH0.I8IUuL1aj4a5trAjM-8EvhJbGz_OrE8nJ5giT82CEoQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateKey() {
  console.log('🔄 Actualizando API Key en Supabase...');
  
  const { error } = await supabase
    .from('configuracion')
    .update({ valor: '7720184' })
    .eq('clave', 'callmebot_api_key');

  if (error) {
    console.error('❌ Error al actualizar:', error.message);
  } else {
    console.log('✅ API Key actualizada con éxito a: 7720184');
  }
}

updateKey();
