/* ================================================================
   js/admin-auth.js — Admin authentication guard
   ================================================================
   This file is loaded by EVERY admin page (admin.html, and any
   future admin pages like leads.html, resources.html, etc.)

   HOW THE GUARD WORKS:
   1. On page load, calls supabaseGetSession() from supabase-client.js
   2. If no valid session → redirects immediately to admin-login.html
   3. If valid session → page renders normally

   The redirect happens before the page content is visible, so
   unauthenticated users never see the admin UI — not even briefly.

   LOAD ORDER IN EVERY ADMIN PAGE:
   <script src="../js/supabase-client.js"></script>  ← must be first
   <script src="../js/admin-auth.js"></script>        ← runs guard immediately
   <script src="../js/admin-page-specific.js"></script> ← only runs if authed
================================================================ */

(function () {

  /* ── Path to login page ───────────────────────────────────────
     Relative to the /pages/ directory where all admin HTML lives.
     If you move admin pages to a subfolder, update this path.
  ─────────────────────────────────────────────────────────────── */
  const LOGIN_PAGE = 'admin-login.html';

  /* ── Guard ────────────────────────────────────────────────────
     supabaseGetSession() is synchronous — it reads sessionStorage,
     checks expiry, and returns null or the session object.
     No network call, no delay, no flash of admin content.
  ─────────────────────────────────────────────────────────────── */
  const session = supabaseGetSession();

  if (!session) {
    // Not logged in or session expired — redirect to login immediately
    // replace() is used instead of href so the protected page is
    // NOT added to browser history (the back button won't return to it)
    window.location.replace(LOGIN_PAGE);
    // Stop any further script execution on this page
    throw new Error('NexusAssets Admin: unauthenticated — redirecting to login.');
  }

  /* ── Expose admin info to the page ───────────────────────────
     Other scripts on the page can read window.ADMIN_SESSION to
     get the current admin's email and access_token without
     having to call supabaseGetSession() again.
  ─────────────────────────────────────────────────────────────── */
  window.ADMIN_SESSION = session;

  /* ── Wire up logout button ────────────────────────────────────
     Any element with id="logoutBtn" on any admin page will
     trigger sign-out and redirect to login automatically.
     No per-page logout code needed.
  ─────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        this.textContent = 'Signing out…';
        this.disabled    = true;
        await supabaseSignOut();
        window.location.replace(LOGIN_PAGE);
      });
    }

    // Show the admin email in any element with id="adminEmail"
    const adminEmailEl = document.getElementById('adminEmail');
    if (adminEmailEl && session.user && session.user.email) {
      adminEmailEl.textContent = session.user.email;
    }
  });

})();
