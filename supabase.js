const SUPABASE_URL = 'https://zxwwffnjrrkmtsxzvswa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4d3dmZm5qcnJrbXRzeHp2c3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MDU2MzksImV4cCI6MjA5NjI4MTYzOX0.0rCwuo78dkvJ-C6Y3br3s7ZuPpdikakxC21WO4dv_rI';

async function buscarEnSupabase(texto) {
  const url = `${SUPABASE_URL}/rest/v1/locales?or=(nombre.ilike.*${texto}*,comuna.ilike.*${texto}*)&limit=20`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  return await res.json();
}