/* ================================================================
   js/supabase-client.js — Supabase connection + Auth + CRUD
================================================================ */

const SUPABASE_URL      = 'https://gfdmlvhhumdvxvnyknpz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2xjoS-5OOR0GU_pD6_SvIQ_2IUIt5qY';

/* ================================================================
   PUBLIC INSERT — uses anon key
   ================================================================
   Used by public-facing lead submission forms (leads.js).
   Visitors are unauthenticated, so the anon key is correct here.
   RLS allows: anon INSERT on leads only.
   DO NOT use this for admin operations on resources.
================================================================ */
async function supabaseInsert(table, record) {
  if (
    SUPABASE_URL      === 'YOUR_SUPABASE_PROJECT_URL' ||
    SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY'
  ) {
    console.warn('NexusAssets: Supabase credentials are not filled in yet.');
    return { data: null, error: { message: 'Supabase is not configured.' } };
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(record)
    });
    if (!response.ok) {
      let errorBody = {};
      try { errorBody = await response.json(); } catch (_) {}
      return { data: null, error: { message: errorBody.message || `HTTP ${response.status}`, details: errorBody } };
    }
    return { data: true, error: null };
  } catch (networkError) {
    return { data: null, error: { message: 'Network error. Please check your connection and try again.' } };
  }
}

/* ================================================================
   ADMIN INSERT — uses authenticated session JWT
   ================================================================
   Used by admin pages to INSERT new records (e.g. add a resource).
   Sends the admin's access_token so Supabase evaluates the request
   under the `authenticated` role, satisfying admin INSERT policies.

   WHY THIS IS SEPARATE FROM supabaseInsert():
   supabaseInsert() uses the anon key — correct for public visitors
   submitting leads. If we changed it to use the session token,
   public lead submission would break for unauthenticated visitors.
   Admin inserts need the authenticated JWT; public inserts need
   the anon key. Two functions, two clear responsibilities.
================================================================ */
async function supabaseAdminInsert(table, record) {
  const session = supabaseGetSession();
  if (!session) return { data: null, error: { message: 'Not authenticated.' } };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(record)
    });
    if (!response.ok) {
      let errorBody = {};
      try { errorBody = await response.json(); } catch (_) {}
      return { data: null, error: { message: errorBody.message || `HTTP ${response.status}`, details: errorBody } };
    }
    return { data: true, error: null };
  } catch (networkError) {
    return { data: null, error: { message: 'Network error.' } };
  }
}

/* ── AUTH — Sign in ─────────────────────────────────────────── */
async function supabaseSignIn(email, password) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body:    JSON.stringify({ email, password })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { session: null, error: data.error_description || data.message || 'Invalid email or password.' };
    }
    sessionStorage.setItem('na_session', JSON.stringify({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    data.expires_at,
      user:          data.user
    }));
    return { session: data, error: null };
  } catch (err) {
    return { session: null, error: 'Network error. Please check your connection.' };
  }
}

/* ── AUTH — Sign out ────────────────────────────────────────── */
async function supabaseSignOut() {
  const session = supabaseGetSession();
  if (session) {
    fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` }
    }).catch(() => {});
  }
  sessionStorage.removeItem('na_session');
}

/* ── AUTH — Get session ─────────────────────────────────────── */
function supabaseGetSession() {
  try {
    const raw = sessionStorage.getItem('na_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && now >= session.expires_at) {
      sessionStorage.removeItem('na_session');
      return null;
    }
    return session;
  } catch (_) {
    sessionStorage.removeItem('na_session');
    return null;
  }
}

/* ── AUTH — Authenticated GET ───────────────────────────────── */
async function supabaseFetch(table, queryString = '') {
  const session = supabaseGetSession();
  if (!session) return { data: null, error: 'Not authenticated.' };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${queryString}`, {
      method:  'GET',
      headers: {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Accept':        'application/json'
      }
    });
    if (!response.ok) {
      let errorBody = {};
      try { errorBody = await response.json(); } catch (_) {}
      return { data: null, error: errorBody.message || `HTTP ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: 'Network error.' };
  }
}

/* ── AUTH — Authenticated PATCH ─────────────────────────────── */
async function supabaseUpdate(table, queryString, updates) {
  const session = supabaseGetSession();
  if (!session) return { data: null, error: 'Not authenticated.' };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${queryString}`, {
      method:  'PATCH',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      let errorBody = {};
      try { errorBody = await response.json(); } catch (_) {}
      return { data: null, error: errorBody.message || `HTTP ${response.status}` };
    }
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: 'Network error.' };
  }
}

/* ── AUTH — Authenticated DELETE ────────────────────────────── */
async function supabaseDelete(table, queryString) {
  const session = supabaseGetSession();
  if (!session) return { data: null, error: 'Not authenticated.' };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${queryString}`, {
      method:  'DELETE',
      headers: {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer':        'return=minimal'
      }
    });
    if (!response.ok) {
      let errorBody = {};
      try { errorBody = await response.json(); } catch (_) {}
      return { data: null, error: errorBody.message || `HTTP ${response.status}` };
    }
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: 'Network error.' };
  }
}
