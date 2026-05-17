const fs = require('fs');
const key = 'SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudGxmaGNubmVudGl2cGJqaXl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc0NjE0NCwiZXhwIjoyMDkyMzIyMTQ0fQ.MtwAazHDaUx0FOo6zTrNiN4GimxmurZeyH_N75Mt4B8';
let content = fs.readFileSync('.env.local', 'utf8');
if (!content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
  fs.appendFileSync('.env.local', '\n' + key + '\n');
  console.log('Key appended');
}
