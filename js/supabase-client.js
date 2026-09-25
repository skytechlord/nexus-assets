/* ================================================================
   js/supabase-client.js — Supabase connection
   ================================================================
   SECURITY:
   Only the anon/public key lives here. Safe to commit.
   RLS on the leads table allows INSERT only for anon users.
   Visitors can submit but can never read other people's leads.
   The service role key never goes in frontend code.
================================================================ */

const SUPABASE_URL      = 'https://gfdmlvhhumdvxvnyknpz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2xjoS-5OOR0GU_pD6_SvIQ_2IUIt5qY';

/**
 * POST a record to a Supabase table via the REST API.
 * No npm, no build step — pure fetch().
 *
 * @param {string} table  - e.g. "leads"
 * @param {Object} record - the row to insert
 * @returns {Promise<{data: any, error: any}>}
 */
async function supabaseInsert(table, record) {

  /*
    GUARD — checks for the original placeholder strings only.
    If you have filled in real values (as you have), this is skipped
    and the real fetch runs normally.

    The previous version accidentally compared the real URL against
    itself, which meant Supabase was never actually called.
  */
  if (
    SUPABASE_URL      === 'YOUR_SUPABASE_PROJECT_URL' ||
    SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY'
  ) {
    console.warn('NexusAssets: Supabase credentials are not filled in yet.');
    return {
      data:  null,
      error: { message: 'Supabase is not configured. Please contact us directly.' }
    };
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
      return {
        data:  null,
        error: {
          message: errorBody.message || `HTTP ${response.status}`,
          details: errorBody
        }
      };
    }

    return { data: true, error: null };

  } catch (networkError) {
    return {
      data:  null,
      error: { message: 'Network error. Please check your connection and try again.' }
    };
  }
}
