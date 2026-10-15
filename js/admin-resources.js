/* ================================================================
   js/admin-resources.js — Resources Management Logic
   ================================================================
   Loaded by admin-resources.html AFTER:
     1. supabase-client.js  (supabaseFetch, supabaseInsert,
                             supabaseUpdate, supabaseDelete)
     2. admin-auth.js       (page guard, window.ADMIN_SESSION)

   Responsibilities:
   - Fetch all resources from public.resources
   - Render filterable, searchable table
   - Add / Edit resource via slide-in drawer
   - Delete with confirmation
   - All operations hit real Supabase — no mocks, no localStorage
================================================================ */

(function () {

  /* ================================================================
     STATE
  ================================================================ */
  let allResources  = [];   // full array from Supabase
  let filtered      = [];   // after filters applied
  let activeType    = 'all';
  let activeCat     = 'all';
  let activePublished = 'all';
  let activeFeatured  = 'all';
  let searchQuery   = '';
  let editingId     = null; // null = adding new, number = editing existing

  /* ================================================================
     CONSTANTS
  ================================================================ */
  const CATEGORIES = [
    'blender','vfx','models','textures','templates',
    'audio','graphics','developer','software','windows',
    'plugins','productivity','other'
  ];

  const TYPE_META = {
    free:    { label: 'Free',    cls: 'res-type-badge--free'    },
    premium: { label: 'Premium', cls: 'res-type-badge--premium' },
    contact: { label: 'Contact', cls: 'res-type-badge--contact' }
  };

  /* ================================================================
     TOAST (self-contained — no main.js dependency)
  ================================================================ */
  (function () {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  })();

  function showToast(message, type, duration) {
    type     = type     || 'success';
    duration = duration || 3000;
    const tc    = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icons = { success: '✓', info: 'ℹ', error: '✕' };
    toast.innerHTML = `<span class="toast__icon">${icons[type]||'ℹ'}</span><span class="toast__message">${message}</span>`;
    tc.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      toast.classList.add('toast--visible')
    ));
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      toast.classList.add('toast--hiding');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
  }

  /* ================================================================
     HELPERS
  ================================================================ */
  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function typeBadge(type) {
    const m = TYPE_META[type] || { label: type, cls: '' };
    return `<span class="res-type-badge ${m.cls}">${m.label}</span>`;
  }

  function pill(val) {
    return val
      ? '<span class="res-pill-yes">✓</span>'
      : '<span class="res-pill-no">—</span>';
  }

  /* ================================================================
     FETCH
  ================================================================ */
  async function fetchResources() {
    setTableState('loading');

    const { data, error } = await supabaseFetch(
      'resources',
      '?select=*&order=id.asc'
    );

    if (error) {
      setTableState('error', error);
      return;
    }

    allResources = data || [];
    updateSubtitle();
    applyFilters();
  }

  function updateSubtitle() {
    const el = document.getElementById('resSubtitle');
    if (el) el.textContent =
      `${allResources.length} resource${allResources.length !== 1 ? 's' : ''} total`;
  }

  /* ================================================================
     FILTER + SEARCH
  ================================================================ */
  function applyFilters() {
    let result = allResources;

    if (activeType !== 'all')
      result = result.filter(r => r.type === activeType);

    if (activeCat !== 'all')
      result = result.filter(r => r.category === activeCat);

    if (activePublished === 'published')
      result = result.filter(r => r.published === true);
    else if (activePublished === 'unpublished')
      result = result.filter(r => !r.published);

    if (activeFeatured === 'featured')
      result = result.filter(r => r.featured === true);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        (r.title       || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (Array.isArray(r.tags) ? r.tags.join(' ') : (r.tags || '')).toLowerCase().includes(q)
      );
    }

    filtered = result;
    renderTable();
  }

  /* ================================================================
     TABLE STATES
  ================================================================ */
  function setTableState(state, msg) {
    const wrap = document.getElementById('resTableWrap');
    const count = document.getElementById('resCount');
    if (count) count.textContent = '';

    const icons   = { loading: '⏳', error: '⚠️', empty: '📭' };
    const titles  = { loading: 'Loading resources…', error: 'Failed to load resources', empty: 'No resources found' };
    const subs    = {
      loading: 'Fetching from Supabase',
      error:   msg || 'Unknown error',
      empty:   allResources.length === 0
        ? 'No resources have been added yet.'
        : 'No resources match the current filters.'
    };

    wrap.innerHTML = `
      <div class="res-state">
        <div class="res-state__icon">${icons[state]}</div>
        <h3>${titles[state]}</h3>
        <p>${subs[state]}</p>
      </div>`;
  }

  /* ================================================================
     RENDER TABLE
  ================================================================ */
  function renderTable() {
    const wrap  = document.getElementById('resTableWrap');
    const count = document.getElementById('resCount');

    if (count) {
      count.innerHTML = `Showing <span>${filtered.length}</span> of <span>${allResources.length}</span> resource${allResources.length !== 1 ? 's' : ''}`;
    }

    if (filtered.length === 0) {
      setTableState('empty');
      return;
    }

    const rows = filtered.map(r => `
      <tr>
        <td class="res-cell-muted">${r.id}</td>
        <td>
          <div style="font-weight:500; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
               title="${r.title}">${r.title}</div>
          <div class="res-cell-muted">${r.category_label || r.category}</div>
        </td>
        <td>${typeBadge(r.type)}</td>
        <td>${pill(r.featured)}</td>
        <td>${pill(r.published)}</td>
        <td class="res-cell-muted">${r.downloads != null ? r.downloads.toLocaleString() : '0'}</td>
        <td class="res-cell-muted">${formatDate(r.date_added)}</td>
        <td>
          <div class="res-row-actions">
            <button class="res-btn-edit"   data-id="${r.id}">Edit</button>
            <button class="res-btn-delete" data-id="${r.id}">Delete</button>
          </div>
        </td>
      </tr>`).join('');

    wrap.innerHTML = `
      <div class="res-table-wrap">
        <table class="res-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title / Category</th>
              <th>Type</th>
              <th>Featured</th>
              <th>Published</th>
              <th>Downloads</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    // Wire edit buttons
    wrap.querySelectorAll('.res-btn-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDrawer(parseInt(btn.dataset.id));
      });
    });

    // Wire delete buttons
    wrap.querySelectorAll('.res-btn-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDeleteConfirm(parseInt(btn.dataset.id));
      });
    });
  }

  /* ================================================================
     DRAWER — open for Add or Edit
  ================================================================ */
  function openDrawer(id) {
    editingId = id || null;
    const overlay = document.getElementById('resDrawerOverlay');
    const title   = document.getElementById('resDrawerTitle');
    const saveBtn = document.getElementById('resSaveBtn');

    // Reset error state
    document.getElementById('resFormError').classList.remove('visible');
    document.getElementById('resDeleteConfirm').classList.remove('visible');

    if (editingId) {
      // Edit mode — find resource and populate form
      const r = allResources.find(x => x.id === editingId);
      if (!r) return;
      title.textContent   = 'Edit Resource';
      saveBtn.textContent = 'Save Changes';
      populateForm(r);
    } else {
      // Add mode — clear form
      title.textContent   = 'Add Resource';
      saveBtn.textContent = 'Add Resource';
      clearForm();
    }

    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('resDrawerOverlay').classList.remove('visible');
    document.body.style.overflow = '';
    editingId = null;
    document.getElementById('resDeleteConfirm').classList.remove('visible');
    document.getElementById('resFormError').classList.remove('visible');
  }

  /* ================================================================
     FORM — populate and clear
  ================================================================ */
  function f(id) { return document.getElementById(id); }

  function populateForm(r) {
    f('fTitle').value          = r.title           || '';
    f('fCategory').value       = r.category        || 'blender';
    f('fCategoryLabel').value  = r.category_label  || '';
    f('fDescription').value    = r.description     || '';
    f('fTags').value           = Array.isArray(r.tags)
      ? r.tags.join(', ')
      : (r.tags || '');
    f('fImage').value          = r.image           || '';
    f('fEmoji').value          = r.emoji           || '';
    f('fFileSize').value       = r.file_size       || '';
    f('fFileFormat').value     = r.file_format     || '';
    f('fVersion').value        = r.version         || '';
    f('fBlenderVersion').value = r.blender_version || '';
    f('fDownloads').value      = r.downloads       != null ? r.downloads : 0;
    f('fFeatured').checked     = r.featured        === true;
    f('fDateAdded').value      = r.date_added      ? r.date_added.slice(0,10) : '';
    f('fType').value           = r.type            || 'free';
    f('fDownloadUrl').value    = r.download_url    || '';
    f('fContactSubject').value = r.contact_subject || '';
    f('fPublished').checked    = r.published       === true;
    f('fAdminNotes').value     = r.admin_notes     || '';
    toggleUrlFields(r.type || 'free');
  }

  function clearForm() {
    ['fTitle','fCategoryLabel','fDescription','fTags','fImage','fEmoji',
     'fFileSize','fFileFormat','fVersion','fBlenderVersion','fDownloadUrl',
     'fContactSubject','fAdminNotes'].forEach(id => { f(id).value = ''; });
    f('fCategory').value  = 'blender';
    f('fDownloads').value = '0';
    f('fType').value      = 'free';
    f('fFeatured').checked = false;
    f('fPublished').checked = true;
    f('fDateAdded').value  = new Date().toISOString().slice(0,10);
    toggleUrlFields('free');
    // Clear any red borders
    document.querySelectorAll('.res-form-input.error').forEach(el =>
      el.classList.remove('error'));
  }

  /* Show/hide download URL vs contact subject based on type */
  function toggleUrlFields(type) {
    const urlRow     = document.getElementById('fDownloadUrlRow');
    const subjectRow = document.getElementById('fContactSubjectRow');
    if (type === 'free') {
      urlRow.style.display     = 'block';
      subjectRow.style.display = 'none';
    } else if (type === 'premium' || type === 'contact') {
      urlRow.style.display     = 'none';
      subjectRow.style.display = 'block';
    }
  }

  f('fType').addEventListener('change', function () {
    toggleUrlFields(this.value);
  });

  /* ================================================================
     FORM — build record from fields
  ================================================================ */
  function buildRecord() {
    // Parse tags: "addon, nodes, shader" → ["addon","nodes","shader"]
    const tagsRaw = f('fTags').value.trim();
    const tags = tagsRaw
      ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    return {
      title:           f('fTitle').value.trim(),
      category:        f('fCategory').value,
      category_label:  f('fCategoryLabel').value.trim(),
      description:     f('fDescription').value.trim(),
      tags:            tags,
      image:           f('fImage').value.trim(),
      emoji:           f('fEmoji').value.trim(),
      file_size:       f('fFileSize').value.trim(),
      file_format:     f('fFileFormat').value.trim(),
      version:         f('fVersion').value.trim(),
      blender_version: f('fBlenderVersion').value.trim(),
      downloads:       parseInt(f('fDownloads').value) || 0,
      featured:        f('fFeatured').checked,
      date_added:      f('fDateAdded').value || new Date().toISOString().slice(0,10),
      type:            f('fType').value,
      download_url:    f('fDownloadUrl').value.trim(),
      contact_subject: f('fContactSubject').value.trim(),
      published:       f('fPublished').checked,
      admin_notes:     f('fAdminNotes').value.trim()
    };
  }

  /* ================================================================
     VALIDATE
  ================================================================ */
  function validate(record) {
    const errors = [];

    if (!record.title)          errors.push('Title is required.');
    if (!record.category)       errors.push('Category is required.');
    if (!record.category_label) errors.push('Category Label is required.');
    if (!record.description)    errors.push('Description is required.');

    // Mark fields red
    f('fTitle').classList.toggle('error',          !record.title);
    f('fCategoryLabel').classList.toggle('error',  !record.category_label);
    f('fDescription').classList.toggle('error',    !record.description);

    return errors;
  }

  /* ================================================================
     SAVE (Add or Update)
  ================================================================ */
  document.getElementById('resSaveBtn').addEventListener('click', async function () {
    document.getElementById('resFormError').classList.remove('visible');

    const record = buildRecord();
    const errors = validate(record);

    if (errors.length > 0) {
      const errEl = document.getElementById('resFormError');
      errEl.textContent = errors.join(' ');
      errEl.classList.add('visible');
      return;
    }

    this.textContent = 'Saving…';
    this.disabled    = true;

    let result;

    if (editingId) {
      // UPDATE — do not send created_at; trigger handles updated_at
      result = await supabaseUpdate(
        'resources',
        `?id=eq.${editingId}`,
        record
      );
    } else {
      // INSERT — get next id safely
      const maxId = allResources.reduce((m, r) => Math.max(m, r.id || 0), 0);
      record.id   = maxId + 1;
      result = await supabaseAdminInsert('resources', record);
    }

    if (result.error) {
      this.textContent = editingId ? 'Save Changes' : 'Add Resource';
      this.disabled    = false;
      const errEl = document.getElementById('resFormError');
      errEl.textContent = result.error.message || result.error;
      errEl.classList.add('visible');
      return;
    }

    // Success
    this.textContent = '✓ Saved';
    showToast(
      editingId ? 'Resource updated successfully.' : 'Resource added successfully.',
      'success', 3000
    );

    await fetchResources(); // re-fetch to get fresh data

    setTimeout(() => {
      // Reset button BEFORE closing so it is in a clean state
      // when the drawer opens again for the next edit.
      // This was the root cause: button stayed disabled=true after
      // the first save, making all subsequent saves appear dead.
      this.textContent = editingId ? 'Save Changes' : 'Add Resource';
      this.disabled    = false;
      closeDrawer();
    }, 600);
  });

  /* ================================================================
     DELETE — confirm dialog triggered from row action button
  ================================================================ */
  let pendingDeleteId = null;

  // Called from row delete button (outside the drawer)
  function openDeleteConfirm(id) {
    const r = allResources.find(x => x.id === id);
    if (!r) return;
    pendingDeleteId = id;

    // Open drawer in edit mode so the confirm block appears in context
    editingId = id;
    openDrawer(id);

    // Immediately show the confirm block
    setTimeout(() => {
      document.getElementById('resDeleteConfirm').classList.add('visible');
    }, 50);
  }

  document.getElementById('resDeleteBtn').addEventListener('click', function () {
    document.getElementById('resDeleteConfirm').classList.toggle('visible');
  });

  document.getElementById('resDeleteNo').addEventListener('click', function () {
    document.getElementById('resDeleteConfirm').classList.remove('visible');
    pendingDeleteId = null;
  });

  document.getElementById('resDeleteYes').addEventListener('click', async function () {
    const idToDelete = pendingDeleteId || editingId;
    if (!idToDelete) return;

    this.textContent = 'Deleting…';
    this.disabled    = true;

    const { error } = await supabaseDelete('resources', `?id=eq.${idToDelete}`);

    if (error) {
      this.textContent = 'Yes, Delete';
      this.disabled    = false;
      const errEl = document.getElementById('resFormError');
      errEl.textContent = 'Delete failed: ' + (error.message || error);
      errEl.classList.add('visible');
      document.getElementById('resDeleteConfirm').classList.remove('visible');
      return;
    }

    pendingDeleteId = null;
    allResources    = allResources.filter(r => r.id !== idToDelete);
    closeDrawer();
    updateSubtitle();
    applyFilters();
    showToast('Resource deleted.', 'success', 3000);
  });

  /* ================================================================
     DRAWER CLOSE
  ================================================================ */
  document.getElementById('resDrawerClose').addEventListener('click', closeDrawer);
  document.getElementById('resDrawerOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeDrawer();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ================================================================
     SEARCH
  ================================================================ */
  document.getElementById('resSearch').addEventListener('input', function () {
    searchQuery = this.value.trim();
    applyFilters();
  });

  /* ================================================================
     FILTER PILLS
  ================================================================ */
  function wireFilters(selector, setter) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', function () {
        setter(this.dataset.value);
        document.querySelectorAll(selector).forEach(b =>
          b.classList.toggle('active', b.dataset.value === this.dataset.value)
        );
        applyFilters();
      });
    });
  }

  wireFilters('.res-type-filter',      v => { activeType      = v; });
  wireFilters('.res-pub-filter',       v => { activePublished = v; });
  wireFilters('.res-featured-filter',  v => { activeFeatured  = v; });

  // Category dropdown filter
  document.getElementById('resCatFilter').addEventListener('change', function () {
    activeCat = this.value;
    applyFilters();
  });

  /* ================================================================
     ADD BUTTON
  ================================================================ */
  document.getElementById('resAddBtn').addEventListener('click', () => openDrawer(null));

  /* ================================================================
     ADMIN AVATAR
  ================================================================ */
  if (window.ADMIN_SESSION && window.ADMIN_SESSION.user) {
    const email = window.ADMIN_SESSION.user.email || '';
    const av = document.getElementById('adminAvatar');
    if (av) av.textContent = email.charAt(0).toUpperCase();
  }

  /* ================================================================
     INIT
  ================================================================ */
  fetchResources();

})();
