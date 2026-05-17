const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  supabase.from('configuracion').upsert({ clave: 'logo_url', valor: '/logo.png' }, { onConflict: 'clave' }).then(() => console.log('Logo URL configurado'));
  supabase.from('configuracion').upsert({ clave: 'primary_color', valor: '#D29C9F' }, { onConflict: 'clave' }).then(() => console.log('Color configurado'));
}
