/* ================================================================
   js/main.js — Public Site Interactivity
   ================================================================
   WHAT CHANGED FROM THE data.js VERSION:
   Resources now come from Supabase (public.resources table) via
   supabasePublicFetch() instead of the local ASSETS array.

   KEY DIFFERENCES:
   - All resource operations are now async (await)
   - Column names are snake_case to match Supabase schema:
       asset.categoryLabel  → asset.category_label
       asset.fileSize       → asset.file_size
       asset.fileFormat     → asset.file_format
       asset.blenderVersion → asset.blender_version
       asset.downloadUrl    → asset.download_url
       asset.contactSubject → asset.contact_subject
       asset.dateAdded      → asset.date_added
   - Only published resources are returned (RLS enforces this)
   - Blog code is completely unchanged

   SUPABASE DEPENDENCY:
   supabase-client.js must load before this file on every page.
   It provides supabasePublicFetch() for public reads.

   SECTIONS:
   A — Shared utilities (nav, toast)
   B — Resource card rendering
   C — Homepage
   D — Resources page (filter + search + sort + load more)
   E — Download page
   F — Blog listing
   G — Blog post
================================================================ */


/* ================================================================
   SECTION A — SHARED UTILITIES
================================================================ */

const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', function () {
    mobileNav.classList.toggle('is-open');
  });
  document.addEventListener('click', function (event) {
    if (!mobileNav.contains(event.target) && !hamburger.contains(event.target)) {
      mobileNav.classList.remove('is-open');
    }
  });
}

const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  window.addEventListener('scroll', function () {
    siteHeader.style.borderBottomColor =
      window.scrollY > 20 ? 'rgba(42,42,61,0.9)' : 'var(--color-border)';
  });
}

/* ── Toast ──────────────────────────────────────────────────── */
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icons = { success: '✓', info: 'ℹ', error: '✕' };
  toast.innerHTML = `<span class="toast__icon">${icons[type] || icons.info}</span><span class="toast__message">${message}</span>`;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast--visible')));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}


/* ================================================================
   SECTION B — RESOURCE CARD RENDERING
   ================================================================
   COLUMN NAME CHANGES (snake_case from Supabase):
   asset.categoryLabel → asset.category_label
   asset.downloadUrl   → asset.download_url (not used in card)
================================================================ */

function createResourceCardHTML(asset, basePath = '') {
  return `
    <article
      class="resource-card"
      onclick="goToDownload(${asset.id}, '${basePath}')"
      role="button"
      tabindex="0"
      aria-label="View ${asset.title}"
    >
      <div class="resource-card__thumb-wrap">
        <img
          class="resource-card__thumb-img"
          src="${asset.image || ''}"
          alt="${asset.title} preview"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="resource-card__thumb-emoji" style="display:none;">
          ${asset.emoji || '📦'}
        </div>
      </div>
      <div class="resource-card__body">
        <span class="resource-card__tag">${asset.category_label || asset.category}</span>
        <h3 class="resource-card__title">${asset.title}</h3>
        <p class="resource-card__desc">${asset.description || ''}</p>
        <div class="resource-card__footer">
          <span class="resource-card__meta">
            ${asset.type === 'free'
              ? `⬇ ${formatDownloads(asset.downloads)}`
              : '💎 Premium'}
          </span>
          ${asset.type === 'free'
            ? '<span class="badge--free">Free</span>'
            : '<span class="badge--premium">Let\'s Talk</span>'}
        </div>
      </div>
    </article>`;
}

function renderResourceCards(assets, containerId, basePath = '') {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!assets || assets.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = assets.map(a => createResourceCardHTML(a, basePath)).join('');
}

function goToDownload(id, basePath = '') {
  window.location.href = `${basePath}pages/download.html?id=${id}`;
}


/* ================================================================
   SECTION C — HOMEPAGE
   ================================================================
   Fetches featured resources from Supabase.
   RLS returns only published resources automatically.
================================================================ */
if (document.getElementById('featuredGrid')) {
  (async function () {
    const { data, error } = await supabasePublicFetch(
      'resources',
      '?featured=eq.true&published=eq.true&order=id.asc'
    );
    if (error || !data) return;
    renderResourceCards(data, 'featuredGrid', '');
  })();
}


/* ================================================================
   SECTION D — RESOURCES PAGE
   ================================================================
   Fetches all published resources once, then filters/searches/
   sorts client-side — same UX as before, no extra DB calls.
================================================================ */
if (document.getElementById('resourceGrid')) {

  const urlParams     = new URLSearchParams(window.location.search);
  let allResources    = [];
  let activeCategory  = urlParams.get('category') || 'all';
  let activeSort      = 'downloads';
  let searchQuery     = '';
  let visibleCount    = 6;
  const PAGE_SIZE     = 6;

  const filterButtons = document.querySelectorAll('.filter-btn');
  const resultsCount  = document.getElementById('resultsCount');
  const emptyState    = document.querySelector('.empty-state');
  const loadMoreBtn   = document.getElementById('loadMoreBtn');
  const searchInput   = document.getElementById('searchInput');
  const sortSelect    = document.getElementById('sortSelect');

  /* ── Filter + search + sort (all client-side) ─────────────── */
  function applyFilters() {
    let results = allResources;

    // Category filter
    if (activeCategory !== 'all') {
      results = results.filter(a => a.category === activeCategory);
    }

    // Search — title, category_label, tags
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(a => {
        const tags = Array.isArray(a.tags) ? a.tags.join(' ') : (a.tags || '');
        return (
          (a.title          || '').toLowerCase().includes(q) ||
          (a.category_label || '').toLowerCase().includes(q) ||
          tags.toLowerCase().includes(q)
        );
      });
    }

    // Sort — uses snake_case columns from Supabase
    if (activeSort === 'downloads') {
      results = [...results].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (activeSort === 'newest') {
      results = [...results].sort((a, b) =>
        new Date(b.date_added) - new Date(a.date_added)
      );
    } else if (activeSort === 'az') {
      results = [...results].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      );
    }

    // Update count text
    if (resultsCount) {
      const word = results.length === 1 ? 'resource' : 'resources';
      resultsCount.innerHTML =
        `Showing <span>${Math.min(visibleCount, results.length)}</span> of <span>${results.length}</span> ${word}`;
    }

    // Empty state
    if (results.length === 0) {
      renderResourceCards([], 'resourceGrid');
      if (emptyState) emptyState.classList.add('visible');
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.classList.remove('visible');

    // Render slice
    renderResourceCards(results.slice(0, visibleCount), 'resourceGrid', '../');

    // Load more button
    if (loadMoreBtn) {
      const remaining = results.length - visibleCount;
      if (remaining > 0) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.textContent   = `Load More (${remaining} remaining)`;
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    window._currentResults = results;
  }

  // Event listeners — identical to before
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery  = this.value;
      visibleCount = PAGE_SIZE;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      activeSort   = this.value;
      visibleCount = PAGE_SIZE;
      applyFilters();
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      activeCategory = this.dataset.category;
      visibleCount   = PAGE_SIZE;
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      applyFilters();
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      visibleCount += PAGE_SIZE;
      applyFilters();
    });
  }

  // Set correct active filter button
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === activeCategory);
  });

  // Show loading state while fetching
  const grid = document.getElementById('resourceGrid');
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:var(--space-3xl) 0; color:var(--color-text-muted);">
        Loading resources…
      </div>`;
  }

  // Fetch all published resources once, then filter client-side
  (async function () {
    const { data, error } = await supabasePublicFetch(
      'resources',
      '?published=eq.true&order=id.asc'
    );

    if (error || !data) {
      if (grid) {
        grid.innerHTML = `
          <div style="grid-column:1/-1; text-align:center; padding:var(--space-3xl) 0; color:var(--color-text-muted);">
            Failed to load resources. Please try refreshing.
          </div>`;
      }
      return;
    }

    allResources = data;
    applyFilters();
  })();
}


/* ================================================================
   SECTION E — DOWNLOAD PAGE
   ================================================================
   Reads ?id= from the URL, fetches that single resource from
   Supabase, then populates the page.

   COLUMN NAME CHANGES:
   asset.categoryLabel  → asset.category_label
   asset.fileSize       → asset.file_size
   asset.fileFormat     → asset.file_format
   asset.blenderVersion → asset.blender_version
   asset.downloadUrl    → asset.download_url
   asset.contactSubject → asset.contact_subject
================================================================ */
if (document.getElementById('assetTitle')) {

  const params  = new URLSearchParams(window.location.search);
  const assetId = parseInt(params.get('id'));

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  (async function () {

    if (!assetId) {
      setText('assetTitle', 'Asset not found');
      return;
    }

    // Fetch this specific resource by id
    // RLS ensures it must be published for public access
    const { data, error } = await supabasePublicFetch(
      'resources',
      `?id=eq.${assetId}&published=eq.true`
    );

    if (error || !data || data.length === 0) {
      setText('assetTitle', 'Asset not found');
      setText('assetDescription', 'This asset may have been removed or the link is invalid.');
      return;
    }

    const asset = data[0];

    // ── Populate page ──────────────────────────────────────────
    document.title = `${asset.title} — NexusAssets`;
    setText('assetTitle',       asset.title);
    setText('assetCategory',    asset.category_label || asset.category);
    setText('assetDescription', asset.description);
    setText('assetFileSize',    asset.file_size    || '—');
    setText('assetFileFormat',  asset.file_format  || '—');
    setText('assetVersion',     asset.version      || '—');
    setText('assetDownloads',   formatDownloads(asset.downloads) + ' downloads');

    // Cover image
    const previewImg   = document.getElementById('assetPreviewImg');
    const previewEmoji = document.getElementById('assetPreviewEmoji');
    if (previewImg && previewEmoji) {
      previewImg.src = asset.image || '';
      previewImg.alt = asset.title;
      previewImg.onload  = () => { previewEmoji.style.display = 'none'; };
      previewImg.onerror = () => {
        previewImg.style.display   = 'none';
        previewEmoji.style.display = 'flex';
        previewEmoji.textContent   = asset.emoji || '📦';
      };
    }

    // Blender version row
    const blenderRow = document.getElementById('blenderVersionRow');
    if (blenderRow) {
      if (asset.blender_version) {
        setText('assetBlenderVersion', asset.blender_version);
      } else {
        blenderRow.style.display = 'none';
      }
    }

    // Tags
    const tagsContainer = document.getElementById('assetTags');
    if (tagsContainer) {
      const tags = Array.isArray(asset.tags) ? asset.tags : [];
      tagsContainer.innerHTML = tags.map(tag => `<span>${tag}</span>`).join('');
    }

    // ── Show correct action panel based on type ────────────────
    const freePanel    = document.getElementById('freePanel');
    const premiumPanel = document.getElementById('premiumPanel');

    if (asset.type === 'premium' || asset.type === 'contact') {
      if (freePanel)    freePanel.style.display    = 'none';
      if (premiumPanel) premiumPanel.style.display = 'block';

      // Pre-fill contact links with asset context
      const subject   = encodeURIComponent(asset.contact_subject || asset.title);
      const assetName = encodeURIComponent(asset.title);

      document.querySelectorAll('.premium-contact-link').forEach(link => {
        const base = link.getAttribute('data-href');
        if (!base) return;

        if (base.startsWith('mailto:')) {
          const subjectClean = decodeURIComponent(subject);
          link.href = `${base}?subject=${encodeURIComponent(subjectClean)}`;
        } else {
          const qs = new URLSearchParams({
            id:      assetId,
            type:    asset.type,
            asset:   asset.title,
            subject: decodeURIComponent(subject)
          }).toString();
          link.href = `${base}?${qs}`;
        }
      });

    } else {
      if (premiumPanel) premiumPanel.style.display = 'none';
      if (freePanel)    freePanel.style.display    = 'block';
    }

    // ── Related assets ─────────────────────────────────────────
    const relatedSection = document.getElementById('relatedSection');
    const relatedGrid    = document.getElementById('relatedGrid');

    if (relatedGrid) {
      const { data: relatedData } = await supabasePublicFetch(
        'resources',
        `?category=eq.${asset.category}&published=eq.true&id=neq.${assetId}&limit=3`
      );
      if (relatedData && relatedData.length > 0) {
        renderResourceCards(relatedData, 'relatedGrid', '../');
        if (relatedSection) relatedSection.style.display = 'block';
      } else if (relatedSection) {
        relatedSection.style.display = 'none';
      }
    }

    // ── Download button ────────────────────────────────────────
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        if (!asset.download_url) {
          showToast('Download link not available yet.', 'info', 3000);
          return;
        }
        const link     = document.createElement('a');
        link.href      = asset.download_url;
        const safeName = asset.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        link.download      = safeName + '.zip';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const original     = this.innerHTML;
        this.innerHTML     = '✓ Download Started!';
        this.disabled      = true;
        this.style.cssText = 'background:#4ade80;border-color:#4ade80;color:#0a1a0a;';
        showToast('Your download has started!', 'success', 3500);
        setTimeout(() => {
          this.innerHTML     = original;
          this.disabled      = false;
          this.style.cssText = '';
        }, 3000);
      });
    }

  })(); // end async IIFE
}


/* ================================================================
   SECTION F — BLOG LISTING (unchanged from before)
================================================================ */
function createArticleCardHTML(post, isFeatured = false) {
  const featuredClass  = isFeatured ? 'article-card--featured' : '';
  const featuredBadge  = isFeatured
    ? '<span class="article-card__featured-badge">Featured</span>'
    : '';
  return `
    <article
      class="article-card ${featuredClass}"
      onclick="goToBlogPost(${post.id})"
      role="button"
      tabindex="0"
    >
      <div class="article-card__img-wrap">
        ${featuredBadge}
        <img class="article-card__img" src="${post.image}" alt="${post.title}"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="article-card__img-emoji" style="display:none;">📝</div>
      </div>
      <div class="article-card__body">
        <span class="article-card__tag">${post.categoryLabel}</span>
        <h2 class="article-card__title">${post.title}</h2>
        <p class="article-card__excerpt">${post.excerpt}</p>
        <div class="article-card__footer">
          <div class="article-card__author">
            <div class="article-card__avatar">${post.authorInitials}</div>
            <span class="article-card__author-name">${post.author}</span>
          </div>
          <span class="article-card__meta">${post.readTime} min read</span>
        </div>
      </div>
    </article>`;
}

function renderArticleCards(posts, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!posts || posts.length === 0) { container.innerHTML = ''; return; }
  container.innerHTML = posts.map((post, i) =>
    createArticleCardHTML(post, i === 0)
  ).join('');
}

function goToBlogPost(id) {
  window.location.href = `blog-post.html?id=${id}`;
}

if (document.getElementById('blogGrid')) {
  const blogFilterBtns  = document.querySelectorAll('.blog-filter-btn');
  const blogResultCount = document.getElementById('blogResultsCount');
  const blogEmpty       = document.getElementById('blogEmpty');
  let activeBlogCategory = 'all';

  function applyBlogFilter(category) {
    activeBlogCategory = category;
    const posts = getBlogPostsByCategory(category);
    if (blogResultCount) {
      const word = posts.length === 1 ? 'article' : 'articles';
      blogResultCount.innerHTML = `Showing <span>${posts.length}</span> ${word}`;
    }
    if (posts.length === 0) {
      renderArticleCards([], 'blogGrid');
      if (blogEmpty) blogEmpty.classList.add('visible');
    } else {
      if (blogEmpty) blogEmpty.classList.remove('visible');
      renderArticleCards(posts, 'blogGrid');
    }
    blogFilterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
  }

  blogFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => applyBlogFilter(btn.dataset.category));
  });

  applyBlogFilter('all');
}


/* ================================================================
   SECTION G — BLOG POST (unchanged from before)
================================================================ */
if (document.getElementById('postTitle')) {
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get('id'));
  const post   = getBlogPostById(postId);

  function setPostText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  if (post) {
    document.title = `${post.title} — NexusAssets`;
    setPostText('postCategory',   post.categoryLabel);
    setPostText('postTitle',      post.title);
    setPostText('postAuthorName', post.author);

    const avatarEl = document.getElementById('postAuthorAvatar');
    if (avatarEl) avatarEl.textContent = post.authorInitials;

    setPostText('postMeta',
      `${formatBlogDate(post.dateAdded)} · ${post.readTime} min read`
    );

    const coverImg   = document.getElementById('postCoverImg');
    const coverEmoji = document.getElementById('postCoverEmoji');
    if (coverImg) {
      coverImg.src = post.image;
      coverImg.alt = post.title;
      coverImg.onload  = () => { if (coverEmoji) coverEmoji.style.display = 'none'; };
      coverImg.onerror = () => {
        coverImg.style.display   = 'none';
        if (coverEmoji) coverEmoji.style.display = 'flex';
      };
    }

    const postBody = document.getElementById('postBody');
    if (postBody) {
      postBody.innerHTML = post.content
        .map(p => `<p>${p.replace(/^(\d+\.\s[^:]+:)/, '<strong>$1</strong>')}</p>`)
        .join('');
    }

    const authorBlockAvatar = document.getElementById('authorBlockAvatar');
    if (authorBlockAvatar) authorBlockAvatar.textContent = post.authorInitials;
    setPostText('authorBlockName', post.author);

    const tocList = document.getElementById('tocList');
    if (tocList) {
      tocList.innerHTML = post.content.slice(0, 6).map((paragraph, index) => {
        const label = paragraph.length > 55 ? paragraph.slice(0, 52) + '...' : paragraph;
        return `<div class="toc-list__item" onclick="scrollToSection(${index})">${label}</div>`;
      }).join('');
    }

    const relatedPosts   = getRelatedPosts(post.id, post.category, 3);
    const relatedGrid    = document.getElementById('relatedArticlesGrid');
    const relatedSection = document.getElementById('relatedArticlesSection');
    if (relatedGrid && relatedPosts.length > 0) {
      relatedGrid.innerHTML = relatedPosts.map(p => createArticleCardHTML(p, false)).join('');
      if (relatedSection) relatedSection.style.display = 'block';
    } else if (relatedSection) {
      relatedSection.style.display = 'none';
    }

  } else {
    setPostText('postTitle', 'Article not found');
    const postBody = document.getElementById('postBody');
    if (postBody) postBody.innerHTML = '<p>This article could not be found.</p>';
  }

  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          showToast('Link copied to clipboard!', 'success', 2500);
          const original = this.textContent;
          this.textContent = '✓ Copied!';
          setTimeout(() => { this.textContent = original; }, 2000);
        })
        .catch(() => {
          showToast('Copy the URL from your browser address bar.', 'info', 3000);
        });
    });
  }
}

function scrollToSection(index) {
  const postBody = document.getElementById('postBody');
  if (!postBody) return;
  const paragraphs = postBody.querySelectorAll('p');
  if (paragraphs[index]) {
    paragraphs[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
