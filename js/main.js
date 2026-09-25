/* ================================================================
   main.js — All Site Interactivity
   ================================================================
   SECTIONS:
   A  — Shared utilities (runs every page)
   B  — Toast notification system
   C  — Resource card rendering
   D  — Homepage featured assets
   E  — Resources page (filter + search + sort + load more)
   F  — Download page (asset detail + related assets)
   G  — Blog listing page               ← NEW
   H  — Blog post page                  ← NEW
================================================================ */


/* ================================================================
   SECTION A — SHARED UTILITIES
================================================================ */

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', function () {
    mobileNav.classList.toggle('is-open');
  });
  document.addEventListener('click', function (event) {
    const clickedOutside =
      !mobileNav.contains(event.target) &&
      !hamburger.contains(event.target);
    if (clickedOutside) mobileNav.classList.remove('is-open');
  });
}

// Nav border on scroll
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  window.addEventListener('scroll', function () {
    siteHeader.style.borderBottomColor =
      window.scrollY > 20 ? 'rgba(42,42,61,0.9)' : 'var(--color-border)';
  });
}


/* ================================================================
   SECTION B — TOAST NOTIFICATION SYSTEM
================================================================ */
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icons = { success: '✓', info: 'ℹ', error: '✕' };
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.info}</span>
    <span class="toast__message">${message}</span>
  `;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
  });
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}


/* ================================================================
   SECTION C — RESOURCE CARD RENDERING
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
          src="${asset.image}"
          alt="${asset.title} preview"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="resource-card__thumb-emoji" style="display:none;">
          ${asset.emoji}
        </div>
      </div>
      <div class="resource-card__body">
        <span class="resource-card__tag">${asset.categoryLabel}</span>
        <h3 class="resource-card__title">${asset.title}</h3>
        <p class="resource-card__desc">${asset.description}</p>
        <div class="resource-card__footer">
          <span class="resource-card__meta">
            ${asset.type === 'free' ? `⬇ ${formatDownloads(asset.downloads)}` : '💎 Premium'}
          </span>
          ${asset.type === 'free'
            ? '<span class="badge--free">Free</span>'
            : '<span class="badge--premium">Let\'s Talk</span>'
          }
        </div>
      </div>
    </article>
  `;
}

function renderResourceCards(assets, containerId, basePath = '', append = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const html = assets.map(asset => createResourceCardHTML(asset, basePath)).join('');
  if (append) {
    container.insertAdjacentHTML('beforeend', html);
  } else {
    container.innerHTML = html;
  }
}

function goToDownload(id, basePath = '') {
  window.location.href = `${basePath}pages/download.html?id=${id}`;
}


/* ================================================================
   SECTION D — HOMEPAGE
================================================================ */
if (document.getElementById('featuredGrid')) {
  renderResourceCards(getFeaturedAssets(), 'featuredGrid', '');
}


/* ================================================================
   SECTION E — RESOURCES PAGE
================================================================ */
if (document.getElementById('resourceGrid')) {
  const params       = new URLSearchParams(window.location.search);
  let activeCategory = params.get('category') || 'all';
  let activeSort     = 'downloads';
  let searchQuery    = '';
  let visibleCount   = 6;
  const PAGE_SIZE    = 6;

  const filterButtons = document.querySelectorAll('.filter-btn');
  const resultsCount  = document.getElementById('resultsCount');
  const emptyState    = document.querySelector('.empty-state');
  const loadMoreBtn   = document.getElementById('loadMoreBtn');
  const searchInput   = document.getElementById('searchInput');
  const sortSelect    = document.getElementById('sortSelect');

  function applyFilters() {
    let results = getAssetsByCategory(activeCategory);
    if (searchQuery) results = searchAssets(searchQuery, results);
    results = sortAssets(results, activeSort);

    if (resultsCount) {
      const word = results.length === 1 ? 'resource' : 'resources';
      resultsCount.innerHTML = `Showing <span>${Math.min(visibleCount, results.length)}</span> of <span>${results.length}</span> ${word}`;
    }

    if (results.length === 0) {
      renderResourceCards([], 'resourceGrid');
      if (emptyState) emptyState.classList.add('visible');
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.classList.remove('visible');
    renderResourceCards(results.slice(0, visibleCount), 'resourceGrid', '../');

    if (loadMoreBtn) {
      const remaining = results.length - visibleCount;
      if (remaining > 0) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.textContent = `Load More (${remaining} remaining)`;
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
    window._currentResults = results;
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = this.value;
      visibleCount = PAGE_SIZE;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      activeSort = this.value;
      visibleCount = PAGE_SIZE;
      applyFilters();
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      activeCategory = this.dataset.category;
      visibleCount = PAGE_SIZE;
      applyFilters();
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      visibleCount += PAGE_SIZE;
      applyFilters();
    });
  }

  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === activeCategory);
  });

  applyFilters();
}


/* ================================================================
   SECTION F — DOWNLOAD PAGE
================================================================ */
if (document.getElementById('assetTitle')) {
  const params  = new URLSearchParams(window.location.search);
  const assetId = parseInt(params.get('id'));
  const asset   = getAssetById(assetId);

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  if (asset) {
    document.title = `${asset.title} — NexusAssets`;
    setText('assetTitle',       asset.title);
    setText('assetCategory',    asset.categoryLabel);
    setText('assetDescription', asset.description);
    setText('assetFileSize',    asset.fileSize);
    setText('assetFileFormat',  asset.fileFormat);
    setText('assetVersion',     asset.version);
    setText('assetDownloads',   formatDownloads(asset.downloads) + ' downloads');

    const previewImg   = document.getElementById('assetPreviewImg');
    const previewEmoji = document.getElementById('assetPreviewEmoji');
    if (previewImg && previewEmoji) {
      previewImg.src = asset.image;
      previewImg.alt = asset.title;
      previewImg.onload  = () => { previewEmoji.style.display = 'none'; };
      previewImg.onerror = () => {
        previewImg.style.display   = 'none';
        previewEmoji.style.display = 'flex';
        previewEmoji.textContent   = asset.emoji;
      };
    }

    const blenderRow = document.getElementById('blenderVersionRow');
    if (blenderRow) {
      if (asset.blenderVersion) {
        setText('assetBlenderVersion', asset.blenderVersion);
      } else {
        blenderRow.style.display = 'none';
      }
    }

    const tagsContainer = document.getElementById('assetTags');
    if (tagsContainer) {
      tagsContainer.innerHTML = asset.tags.map(tag => `<span>${tag}</span>`).join('');
    }

    const related     = getRelatedAssets(asset.category, asset.id, 3);
    const relatedGrid = document.getElementById('relatedGrid');
    const relatedSection = document.getElementById('relatedSection');
    if (relatedGrid && related.length > 0) {
      renderResourceCards(related, 'relatedGrid', '');
      if (relatedSection) relatedSection.style.display = 'block';
    } else if (relatedSection) {
      relatedSection.style.display = 'none';
    }
  } else {
    setText('assetTitle', 'Asset not found');
    setText('assetDescription', 'This asset may have been removed or the link is invalid.');
  }

  // ── Render the correct action panel based on asset type ────
  // The download.html has three panels — only one is shown at a time.
  // JS reads asset.type and shows the right one, hides the other two.
  const freePanel    = document.getElementById('freePanel');
  const premiumPanel = document.getElementById('premiumPanel');

  if (asset) {
    if (asset.type === 'premium' || asset.type === 'contact') {
      // ── PREMIUM / CONTACT: show "Let's Talk" panel ──────────
      if (freePanel)    freePanel.style.display    = 'none';
      if (premiumPanel) premiumPanel.style.display = 'block';

      // Pre-fill the contact subject on the "Get in Touch" buttons
      // by appending ?subject= to the contact-premium.html URL
      const subject   = asset.contactSubject || asset.title;
      const assetName = encodeURIComponent(asset.title);

      document.querySelectorAll('.premium-contact-link').forEach(link => {
        const base = link.getAttribute('data-href');
        if (!base) return;

        // Build a full URL with all context the contact page needs:
        // ?id=        → numeric asset id, so the lead record knows which asset
        // ?type=      → "premium" or "contact", controls page wording
        // ?asset=     → human-readable asset name, pre-fills the form
        // ?subject=   → email subject line (same as asset name or contactSubject)
        const qs = new URLSearchParams({
          id:      assetId,
          type:    asset.type,
          asset:   asset.title,
          subject: subject
        }).toString();

        link.href = `${base}?${qs}`;
      });

    } else {
      // ── FREE: show standard download panel ──────────────────
      if (premiumPanel) premiumPanel.style.display = 'none';
      if (freePanel)    freePanel.style.display    = 'block';
    }
  }

  // ── Free download button ─────────────────────────────────────
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      if (!asset || !asset.downloadUrl) {
        showToast('Download link not available yet.', 'info', 3000);
        return;
      }

      // Create a hidden <a> and programmatically click it —
      // the standard library-free way to trigger a file download.
      const link     = document.createElement('a');
      link.href      = asset.downloadUrl;
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
}


/* ================================================================
   SECTION G — BLOG LISTING PAGE
   ================================================================
   Handles blog.html:
   - Renders article cards from BLOG_POSTS in data.js
   - First card gets .article-card--featured for the wide layout
   - Category filter buttons work the same as the resources page
================================================================ */

/**
 * Builds the HTML for one article card.
 * @param {Object}  post       - one post object from BLOG_POSTS
 * @param {boolean} isFeatured - if true, adds the wide hero card class
 */
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
      aria-label="Read ${post.title}"
    >
      <div class="article-card__img-wrap">
        ${featuredBadge}
        <img
          class="article-card__img"
          src="${post.image}"
          alt="${post.title}"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
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
    </article>
  `;
}

/**
 * Renders an array of posts into a blog grid container.
 * The first post always gets the featured (wide) card treatment.
 * @param {Array}  posts       - array of post objects
 * @param {string} containerId - id of the target grid element
 */
function renderArticleCards(posts, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML = '';
    return;
  }

  // First post = featured hero card, rest = normal cards
  const html = posts.map((post, index) =>
    createArticleCardHTML(post, index === 0)
  ).join('');

  container.innerHTML = html;
}

/**
 * Navigates to the blog post detail page.
 * Same URL parameter pattern as goToDownload().
 * @param {number} id
 */
function goToBlogPost(id) {
  // Works from /pages/ (where blog.html lives)
  window.location.href = `blog-post.html?id=${id}`;
}

// ── Blog listing page init ────────────────────────────────────────
if (document.getElementById('blogGrid')) {
  const blogFilterBtns  = document.querySelectorAll('.blog-filter-btn');
  const blogResultCount = document.getElementById('blogResultsCount');
  const blogEmpty       = document.getElementById('blogEmpty');

  let activeBlogCategory = 'all';

  function applyBlogFilter(category) {
    activeBlogCategory = category;
    const posts = getBlogPostsByCategory(category);  // from data.js

    // Update results count
    if (blogResultCount) {
      const word = posts.length === 1 ? 'article' : 'articles';
      blogResultCount.innerHTML = `Showing <span>${posts.length}</span> ${word}`;
    }

    // Show empty state or render cards
    if (posts.length === 0) {
      renderArticleCards([], 'blogGrid');
      if (blogEmpty) blogEmpty.classList.add('visible');
    } else {
      if (blogEmpty) blogEmpty.classList.remove('visible');
      renderArticleCards(posts, 'blogGrid');
    }

    // Update active filter button styling
    blogFilterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
  }

  // Attach click listeners to filter buttons
  blogFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => applyBlogFilter(btn.dataset.category));
  });

  // Run on page load
  applyBlogFilter('all');
}


/* ================================================================
   SECTION H — BLOG POST PAGE
   ================================================================
   Handles blog-post.html:
   - Reads ?id= from URL
   - Finds the matching post from BLOG_POSTS
   - Populates all elements: title, author, cover image, body text
   - Generates a table of contents from the content paragraphs
   - Renders related articles at the bottom
   - Copy link button
================================================================ */
if (document.getElementById('postTitle')) {
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get('id'));
  const post   = getBlogPostById(postId);  // from data.js

  function setPostText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  if (post) {
    // ── Page metadata ───────────────────────────────────────────
    document.title = `${post.title} — NexusAssets`;

    // ── Populate header elements ────────────────────────────────
    setPostText('postCategory',   post.categoryLabel);
    setPostText('postTitle',      post.title);
    setPostText('postAuthorName', post.author);

    // Author avatar initials
    const avatarEl = document.getElementById('postAuthorAvatar');
    if (avatarEl) avatarEl.textContent = post.authorInitials;

    // Date + read time line
    setPostText('postMeta',
      `${formatBlogDate(post.dateAdded)} · ${post.readTime} min read`
    );

    // ── Cover image with fallback ───────────────────────────────
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

    // ── Article body ────────────────────────────────────────────
    // Each string in post.content[] becomes its own <p> tag.
    // We wrap numbers at the start of a paragraph (like "1. ...")
    // in a <strong> tag to make the list items stand out visually.
    const postBody = document.getElementById('postBody');
    if (postBody) {
      postBody.innerHTML = post.content
        .map(paragraph => {
          // Check if paragraph starts with a number (like "1. Title:")
          // If so, bold everything up to the first colon
          const formatted = paragraph.replace(
            /^(\d+\.\s[^:]+:)/,
            '<strong>$1</strong>'
          );
          return `<p>${formatted}</p>`;
        })
        .join('');
    }

    // ── Author block at bottom ──────────────────────────────────
    const authorBlockAvatar = document.getElementById('authorBlockAvatar');
    if (authorBlockAvatar) authorBlockAvatar.textContent = post.authorInitials;
    setPostText('authorBlockName', post.author);

    // ── Table of contents ───────────────────────────────────────
    // We generate TOC entries from the first sentence of each paragraph.
    // slice(0, 6) limits to first 6 paragraphs so the sidebar isn't too long.
    const tocList = document.getElementById('tocList');
    if (tocList) {
      tocList.innerHTML = post.content
        .slice(0, 6)
        .map((paragraph, index) => {
          // Take first 50 characters of each paragraph as the TOC label
          const label = paragraph.length > 55
            ? paragraph.slice(0, 52) + '...'
            : paragraph;
          return `<div class="toc-list__item" onclick="scrollToSection(${index})">${label}</div>`;
        })
        .join('');
    }

    // ── Related articles ────────────────────────────────────────
    const relatedPosts    = getRelatedPosts(post.id, post.category, 3);  // from data.js
    const relatedGrid     = document.getElementById('relatedArticlesGrid');
    const relatedSection  = document.getElementById('relatedArticlesSection');

    if (relatedGrid && relatedPosts.length > 0) {
      // Related cards are never featured — all normal size
      relatedGrid.innerHTML = relatedPosts
        .map(p => createArticleCardHTML(p, false))
        .join('');
      if (relatedSection) relatedSection.style.display = 'block';
    } else if (relatedSection) {
      relatedSection.style.display = 'none';
    }

  } else {
    // Post not found
    setPostText('postTitle', 'Article not found');
    const postBody = document.getElementById('postBody');
    if (postBody) {
      postBody.innerHTML = '<p>This article may have been removed or the link is invalid.</p>';
    }
  }

  // ── Copy link button ──────────────────────────────────────────
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function () {
      // navigator.clipboard.writeText() copies text to the clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          showToast('Link copied to clipboard!', 'success', 2500);
          const original = this.textContent;
          this.textContent = '✓ Copied!';
          setTimeout(() => { this.textContent = original; }, 2000);
        })
        .catch(() => {
          // Clipboard API not available (e.g. file:// protocol locally)
          showToast('Copy the URL from your browser address bar.', 'info', 3000);
        });
    });
  }
}

/**
 * Scrolls smoothly to a paragraph in the article body.
 * Called by the table of contents items.
 * @param {number} index - which paragraph to scroll to
 */
function scrollToSection(index) {
  const postBody = document.getElementById('postBody');
  if (!postBody) return;

  // querySelectorAll('p') returns all paragraph elements as a list
  const paragraphs = postBody.querySelectorAll('p');
  if (paragraphs[index]) {
    // scrollIntoView() is a built-in browser function that
    // smoothly scrolls the page until the element is visible
    paragraphs[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
