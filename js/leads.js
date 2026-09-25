/* ================================================================
   js/leads.js — Lead submission logic
   ================================================================
   WHAT THIS FILE DOES:
   Provides one public function: submitLead(leadData)
   Called by contact-premium.html when the form is submitted.

   WHAT IT DOES NOT DO:
   - Does not touch the DOM
   - Does not know about the form fields
   - Does not know about the page layout
   - Does not import or modify main.js

   This isolation means:
   - You can swap Supabase for another backend later by editing
     only this file. The form page doesn't change.
   - If submitLead() fails, nothing else on the site breaks.

   DEPENDS ON:
   - supabase-client.js (must be loaded before this file)
     It provides: supabaseInsert()
================================================================ */

/**
 * Submits a lead to the Supabase `leads` table.
 *
 * @param {Object} leadData
 * @param {string}  leadData.first_name         required
 * @param {string}  leadData.last_name          required
 * @param {string}  leadData.email              required
 * @param {string}  leadData.whatsapp           optional — empty string if not given
 * @param {string}  leadData.telegram           optional — empty string if not given
 * @param {number|null} leadData.resource_id    the asset id from data.js
 * @param {string}  leadData.resource_title     human-readable asset name
 * @param {string}  leadData.resource_type      "premium" | "contact"
 * @param {string}  leadData.message            required
 * @param {boolean} leadData.marketing_consent  explicit checkbox value
 *
 * @returns {Promise<{success: boolean, error: string|null}>}
 *   Caller checks success to decide what to show the visitor.
 */
async function submitLead(leadData) {

  // Build the exact record shape that matches the `leads` table schema.
  // Fields not provided by the visitor get safe defaults so the
  // database INSERT never fails on a missing column.
  const record = {
    first_name:        leadData.first_name.trim(),
    last_name:         leadData.last_name.trim(),
    email:             leadData.email.trim().toLowerCase(),

    // Optional fields — store empty string rather than null so the
    // admin dashboard can display them without null-checks everywhere
    whatsapp:          (leadData.whatsapp  || '').trim(),
    telegram:          (leadData.telegram  || '').trim(),

    // Resource context — tells you which asset triggered this lead
    resource_id:       leadData.resource_id    || null,
    resource_title:    leadData.resource_title || '',
    resource_type:     leadData.resource_type  || 'premium',

    message:           leadData.message.trim(),

    // Status starts as "new" — admin changes this in the dashboard
    status:            'new',

    // Explicit boolean — never inferred, never defaulted to true
    marketing_consent: leadData.marketing_consent === true,

    // Timestamps — created_at is set by Supabase default (now()),
    // but we include updated_at manually so it's always present
    updated_at:        new Date().toISOString()

    // These are intentionally NOT set here — they belong to the admin:
    // last_contacted_at, admin_notes
  };

  // Validate required fields before even hitting the network.
  // This is a second layer after the form's own HTML validation —
  // belt-and-suspenders approach.
  const missing = [];
  if (!record.first_name) missing.push('first name');
  if (!record.last_name)  missing.push('last name');
  if (!record.email)      missing.push('email');
  if (!record.message)    missing.push('message');

  if (missing.length > 0) {
    return {
      success: false,
      error:   `Missing required fields: ${missing.join(', ')}.`
    };
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // Submit to Supabase via supabase-client.js
  const { data, error } = await supabaseInsert('leads', record);

  if (error) {
    // Log the full error for debugging (only visible in browser DevTools)
    console.error('NexusAssets lead submission error:', error);

    return {
      success: false,
      // Return a friendly message, not the raw Supabase error string
      error:   error.message || 'Something went wrong. Please try again or contact us directly.'
    };
  }

  return { success: true, error: null };
}
