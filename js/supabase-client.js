/* ================================================================
   js/supabase-client.js — Supabase connection + Auth
   ================================================================
   SECURITY:
   Only the anon/public key lives here. Safe to commit.
   RLS on the leads table allows INSERT only for anon users.
   The service role key never goes in frontend code.

   WHAT'S NEW:
   Added auth helpers below supabaseInsert:
   - supabaseSignIn(email, password)
   - supabaseSignOut()
   - supabaseGetSession()
   - supabaseFetch(table, queryString)
================================================================ */

const SUPABASE_URL      = 'https://gfdmlvhhumdvxvnyknpz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2xjoS-5OOR0GU_pD6_SvIQ_2IUIt5qY';

/* ── INSERT (unchanged) ─────────────────────────────────────── */
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
   AUTH — Sign in with email + password
   ================================================================
   Calls Supabase Auth token endpoint.
   On success, stores the session in sessionStorage.

   WHY sessionStorage NOT localStorage?
   sessionStorage clears when the browser tab closes — safer for
   an admin panel on shared machines. localStorage would persist
   until explicitly cleared.
================================================================ */
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

/* ================================================================
   AUTH — Get current session (synchronous, no network call)
   ================================================================
   Returns null if not logged in or if token has expired.
   Used by every admin page on load to guard access.
================================================================ */
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

/* ================================================================
   AUTH — Authenticated GET request
   ================================================================
   Sends the admin's access_token in the Authorization header.
   This is what allows the RLS "admin can read leads" policy
   to recognise the user and grant SELECT access.
================================================================ */
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

/* ================================================================
   AUTH — Authenticated PATCH request (update a row)
   ================================================================
   Used by admin leads page to update status, admin_notes, etc.
   Sends the admin's access_token — satisfies RLS update policy.

   @param {string} table       - e.g. "leads"
   @param {string} queryString - filter, e.g. "?id=eq.UUID"
   @param {Object} updates     - fields to update, e.g. { status: "contacted" }
   @returns {Promise<{data: boolean|null, error: string|null}>}
================================================================ */
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

/* ================================================================
   AUTH — Authenticated DELETE request
   ================================================================
   Used by admin leads page to delete a lead row.
   Sends the admin's access_token — satisfies RLS delete policy.

   @param {string} table       - e.g. "leads"
   @param {string} queryString - filter, e.g. "?id=eq.UUID"
   @returns {Promise<{data: boolean|null, error: string|null}>}
================================================================ */
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
