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

async function supaFetch(url, options = {}) {
  let token = localStorage.getItem('dm_token');

  // Decodificar JWT y refrescar si expira en menos de 30s
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now() + 30000) {
        const refreshTk = localStorage.getItem('dm_refresh');
        if (refreshTk) {
          const rr = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshTk })
          });
          if (rr.ok) {
            const nd = await rr.json();
            token = nd.access_token;
            localStorage.setItem('dm_token', nd.access_token);
            localStorage.setItem('dm_user', JSON.stringify(nd.user));
            if (nd.refresh_token) localStorage.setItem('dm_refresh', nd.refresh_token);
          }
        }
      }
    } catch (e) {
      token = null;
    }
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${token || SUPABASE_KEY}`,
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
}