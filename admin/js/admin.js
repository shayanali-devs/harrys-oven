/* ═══════════════════════════════════════════════════════════
   HARRY'S OVEN — Admin Panel Logic
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── CATEGORY CONFIG ──────────────────────────────────────
  const CATEGORIES = {
    pizzas:     { label: '🍕 Pizzas',     emoji: '🍕' },
    mains:      { label: '🍗 Mains',      emoji: '🍗' },
    pasta:      { label: '🍝 Pasta',      emoji: '🍝' },
    appetizers: { label: '🧆 Starters',   emoji: '🧆' },
    burgers:    { label: '🍔 Burgers',    emoji: '🍔' },
    wraps:      { label: '🌯 Wraps',      emoji: '🌯' },
    beverages:  { label: '🥤 Drinks',     emoji: '🥤' },
    desserts:   { label: '🍰 Desserts',   emoji: '🍰' },
    deals:      { label: '🔥 Deals',      emoji: '🔥' }
  };

  // ── ROLES & PERMISSIONS ─────────────────────────────────
  const ROLES = {
    owner: {
      label: 'Owner',
      color: '#E8462A',
      // Can do everything
      canViewDashboard: true,
      canManageMenu: true,      // add/edit/delete
      canManageReviews: true,   // add/edit/delete
      canManageLocations: true,
      canViewSettings: true,    // Firebase, deploy, API keys
      canDeleteItems: true,
      canChangeSettings: true,
    },
    manager: {
      label: 'Manager',
      color: '#F57C2B',
      // Day-to-day operations, no tech settings
      canViewDashboard: true,
      canManageMenu: true,      // add/edit
      canManageReviews: true,   // add/edit
      canManageLocations: true,
      canViewSettings: false,   // No access to Firebase/API keys
      canDeleteItems: false,    // Can't permanently delete
      canChangeSettings: false,
    },
    staff: {
      label: 'Staff',
      color: '#4CAF7D',
      // Read-only + mark items as sold out
      canViewDashboard: true,
      canManageMenu: true,      // can only toggle sold out / edit price
      canManageReviews: false,  // can't touch reviews
      canManageLocations: false,
      canViewSettings: false,
      canDeleteItems: false,
      canChangeSettings: false,
    }
  };

  // ── DEV ACCOUNTS (password-based login) ──────────────────
  const DEV_ACCOUNTS = [
    { email: 'owner',   password: 'harrys2025', role: 'owner',   name: 'Shayan Ali' },
    { email: 'manager', password: 'manager2025', role: 'manager', name: 'Manager' },
    { email: 'staff',   password: 'staff2025',   role: 'staff',   name: 'Staff' },
    // Also accept any email with the owner password for convenience
    { email: '*',       password: 'harrys2025',  role: 'owner',   name: 'Admin' },
  ];

  let isDevMode = false;
  let currentRole = null; // 'owner' | 'manager' | 'staff'

  // ── STATE ────────────────────────────────────────────────
  let menuData = {};
  let reviewsData = [];
  let activeMenuTab = 'pizzas';
  let currentUser = null;

  // ── INIT ─────────────────────────────────────────────────
  function init() {
    initAuth();
    initSidebar();
    initModals();

    // Loader
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('loaded');
    }, 600);
  }

  // ── AUTH ─────────────────────────────────────────────────
  function initAuth() {
    // Check if Firebase Auth is available
    let authAvailable = true;
    try {
      // Try to check if auth module loaded properly
      if (typeof firebase.auth !== 'function') {
        authAvailable = false;
      }
    } catch(e) {
      authAvailable = false;
    }

    if (authAvailable) {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          currentUser = user;
          isDevMode = false;
          showAdmin();
          updateUserUI(user);
          loadAllData();
        } else {
          currentUser = null;
          showLogin();
        }
      }, error => {
        // Auth not enabled - fall back to dev mode
        console.log('Firebase Auth not available, using dev mode');
        isDevMode = true;
        showLogin();
      });
    } else {
      isDevMode = true;
      showLogin();
    }

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    errorEl.style.display = 'none';
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-spinner').style.display = 'inline';

    // Dev mode: check against role-based accounts
    const devAccount = DEV_ACCOUNTS.find(a =>
      (a.email === '*' || a.email === email) && a.password === password
    );
    // Prefer exact match over wildcard
    const exactAccount = DEV_ACCOUNTS.find(a => a.email === email && a.password === password);
    const matchedAccount = exactAccount || devAccount;

    if (matchedAccount) {
      isDevMode = true;
      currentRole = matchedAccount.role;
      currentUser = {
        email: matchedAccount.email === '*' ? (email || 'admin@harrysoven.com') : matchedAccount.email + '@harrysoven.com',
        displayName: matchedAccount.name
      };
      showAdmin();
      updateUserUI(currentUser);
      applyRolePermissions();
      loadAllData();
      showToast(`Welcome, ${ROLES[currentRole].label}!`, 'success');
      btn.querySelector('.btn-text').style.display = 'inline';
      btn.querySelector('.btn-spinner').style.display = 'none';
      return;
    }

    // Firebase Auth mode
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        isDevMode = false;
        showToast('Welcome back!', 'success');
      })
      .catch(err => {
        // If auth error, suggest dev mode
        const msg = err.code === 'auth/operation-not-allowed'
          ? 'Firebase Auth not enabled. Use role-based login: owner/manager/staff'
          : getAuthError(err.code);
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
      })
      .finally(() => {
        btn.querySelector('.btn-text').style.display = 'inline';
        btn.querySelector('.btn-spinner').style.display = 'none';
      });
  }

  function handleLogout() {
    if (isDevMode) {
      currentUser = null;
      showLogin();
      showToast('Signed out', 'info');
      return;
    }
    firebase.auth().signOut().then(() => {
      showToast('Signed out', 'info');
    });
  }

  function getAuthError(code) {
    const errors = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/too-many-requests': 'Too many attempts. Try again later',
      'auth/invalid-credential': 'Invalid email or password'
    };
    return errors[code] || 'Login failed. Please try again.';
  }

  function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-layout').style.display = 'none';
  }

  function showAdmin() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-layout').style.display = 'flex';
  }

  function updateUserUI(user) {
    const initial = (user.displayName || user.email).charAt(0).toUpperCase();
    const avatarEl = document.getElementById('user-avatar');
    avatarEl.textContent = initial;
    // Color avatar by role
    if (currentRole && ROLES[currentRole]) {
      avatarEl.style.background = ROLES[currentRole].color;
    }
    document.getElementById('user-name').textContent = (user.displayName || 'Admin') + (currentRole ? ` (${ROLES[currentRole].label})` : '');
    document.getElementById('user-email').textContent = user.email;
    const settingsEmail = document.getElementById('settings-user-email');
    if (settingsEmail) settingsEmail.textContent = user.email;
  }

  // ── ROLE PERMISSIONS ─────────────────────────────────────
  function applyRolePermissions() {
    if (!currentRole || !ROLES[currentRole]) return;
    const perms = ROLES[currentRole];

    // Sidebar nav visibility
    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
      const view = btn.dataset.view;
      let show = true;
      if (view === 'settings' && !perms.canViewSettings) show = false;
      if (view === 'reviews' && !perms.canManageReviews) show = false;
      if (view === 'locations' && !perms.canManageLocations) show = false;
      btn.style.display = show ? '' : 'none';
    });

    // Quick actions on dashboard
    const addMenuBtn = document.querySelector('[onclick*="showAddItemModal"]');
    const addReviewBtn = document.querySelector('[onclick*="showAddReviewModal"]');
    const settingsBtn = document.querySelector('[onclick*="switchView(\'settings\')"]');
    if (addMenuBtn && !perms.canManageMenu) addMenuBtn.style.display = 'none';
    if (addReviewBtn && !perms.canManageReviews) addReviewBtn.style.display = 'none';
    if (settingsBtn && !perms.canViewSettings) settingsBtn.style.display = 'none';

    // Store permissions globally for other functions to check
    window._adminPerms = perms;
    window._adminRole = currentRole;
  }

  function hasPermission(perm) {
    if (window._adminPerms && perm in window._adminPerms) {
      return window._adminPerms[perm];
    }
    return true; // default allow for owner/Firebase auth users
  }

  // ── SIDEBAR ──────────────────────────────────────────────
  function initSidebar() {
    // View switching
    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        switchView(btn.dataset.view);
      });
    });

    // Mobile sidebar toggle
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');

    if (hamburger) {
      hamburger.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
    }

    // Close sidebar on view switch (mobile)
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => sidebar.classList.remove('open'));
    });
  }

  function switchView(viewName) {
    // Check permissions before switching
    if (viewName === 'settings' && !hasPermission('canViewSettings')) {
      showToast('Access denied — Settings is for owners only', 'error');
      return;
    }
    if (viewName === 'reviews' && !hasPermission('canManageReviews')) {
      showToast('Access denied — Reviews management requires Manager role', 'error');
      return;
    }
    if (viewName === 'locations' && !hasPermission('canManageLocations')) {
      showToast('Access denied — Locations require Manager role', 'error');
      return;
    }

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const view = document.getElementById('view-' + viewName);
    if (view) view.classList.add('active');

    const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (navItem) navItem.classList.add('active');
  }

  // ── DATA LOADING ─────────────────────────────────────────
  function loadAllData() {
    loadMenuData();
    loadReviewsData();
  }

  function loadMenuData() {
    db.ref('menu').once('value')
      .then(snapshot => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
          menuData = data;
        } else {
          // Use fallback from public site
          menuData = getFallbackMenu();
        }
        renderMenuAdminTabs();
        renderMenuAdminTable();
        renderDashboard();
      })
      .catch(() => {
        menuData = getFallbackMenu();
        renderMenuAdminTabs();
        renderMenuAdminTable();
        renderDashboard();
      });
  }

  function loadReviewsData() {
    db.ref('reviews').once('value')
      .then(snapshot => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
          reviewsData = Object.entries(data).map(([id, r]) => ({ ...r, id }));
        } else {
          reviewsData = getFallbackReviews();
        }
        renderReviewsAdmin();
        renderDashboard();
      })
      .catch(() => {
        reviewsData = getFallbackReviews();
        renderReviewsAdmin();
        renderDashboard();
      });
  }

  // ── DASHBOARD ────────────────────────────────────────────
  function renderDashboard() {
    // Stats
    const totalItems = Object.values(menuData).reduce((sum, cat) => sum + (cat ? cat.length : 0), 0);
    const totalCats = Object.keys(menuData).filter(k => menuData[k] && menuData[k].length > 0).length;

    const statsGrid = document.getElementById('dashboard-stats');
    if (!statsGrid) return;
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-card-icon">🍕</div>
        <div class="stat-card-num">${totalItems}</div>
        <div class="stat-card-label">Menu Items</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">📂</div>
        <div class="stat-card-num">${totalCats}</div>
        <div class="stat-card-label">Categories</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">⭐</div>
        <div class="stat-card-num">${reviewsData.length}</div>
        <div class="stat-card-label">Reviews</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">📍</div>
        <div class="stat-card-num">2</div>
        <div class="stat-card-label">Locations</div>
      </div>
    `;

    // Category breakdown
    const catBreakdown = document.getElementById('dashboard-categories');
    if (!catBreakdown) return;
    catBreakdown.innerHTML = Object.entries(CATEGORIES).map(([key, cfg]) => {
      const count = menuData[key] ? menuData[key].length : 0;
      return `<div class="cat-chip">
        <span class="cat-chip-name">${cfg.emoji} ${cfg.label.split(' ').slice(1).join(' ')}</span>
        <span class="cat-chip-count">${count}</span>
      </div>`;
    }).join('');
  }

  // ── MENU ADMIN TABS ─────────────────────────────────────
  function renderMenuAdminTabs() {
    const tabsContainer = document.getElementById('menu-admin-tabs');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';

    Object.entries(CATEGORIES).forEach(([key, cfg]) => {
      const btn = document.createElement('button');
      btn.className = 'admin-tab' + (key === activeMenuTab ? ' active' : '');
      btn.textContent = cfg.label;
      btn.addEventListener('click', () => {
        activeMenuTab = key;
        document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenuAdminTable();
      });
      tabsContainer.appendChild(btn);
    });
  }

  // ── MENU ADMIN TABLE ────────────────────────────────────
  function renderMenuAdminTable() {
    const tbody = document.getElementById('menu-items-body');
    if (!tbody) return;

    const items = menuData[activeMenuTab] || [];
    items.sort((a, b) => (a.order || 999) - (b.order || 999));

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--sp-8);color:var(--clr-text-light)">No items in this category yet. Click "+ Add Item" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map((item, idx) => {
      const hasImage = item.image && item.image.trim();
      const hasSizes = item.sizes && item.sizes.length > 0;
      const priceText = hasSizes
        ? `from Rs. ${item.sizes[0].price.toLocaleString()}`
        : `Rs. ${item.price.toLocaleString()}`;
      const badgeHTML = item.badge
        ? `<span class="item-badge ${item.badgeColor || ''}">${item.badge}</span>`
        : '<span style="color:var(--clr-text-light)">—</span>';

      return `<tr>
        <td>${item.order || idx + 1}</td>
        <td>${hasImage
          ? `<img class="item-thumb" src="${item.image}" alt="${item.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="item-thumb-placeholder" style="display:none">${CATEGORIES[activeMenuTab]?.emoji || '🍽️'}</div>`
          : `<div class="item-thumb-placeholder">${CATEGORIES[activeMenuTab]?.emoji || '🍽️'}</div>`
        }</td>
        <td>
          <div class="item-name-cell">${item.name}</div>
          <div class="item-desc-cell">${item.description || ''}</div>
        </td>
        <td class="item-price-cell">${priceText}</td>
        <td>${badgeHTML}</td>
        <td>
          <div class="item-actions">
            <button class="btn-icon" title="Edit" onclick="adminApp.editItem('${item.id}')">✏️</button>
            ${hasPermission('canDeleteItems') ? `<button class="btn-icon" title="Delete" onclick="adminApp.deleteItem('${item.id}')">🗑️</button>` : ''}
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // ── ITEM MODAL ───────────────────────────────────────────
  function showAddItemModal() {
    document.getElementById('item-modal-title').textContent = 'Add Menu Item';
    document.getElementById('item-edit-id').value = '';
    document.getElementById('item-form').reset();
    document.getElementById('item-category').value = activeMenuTab;
    document.getElementById('item-order').value = getNextOrder(activeMenuTab);
    clearImagePreview();
    clearSizesContainer();
    addSizeRow(); // One default size row
    document.getElementById('item-form-error').style.display = 'none';
    document.getElementById('item-modal').style.display = 'flex';
  }

  function editItem(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    document.getElementById('item-modal-title').textContent = 'Edit Menu Item';
    document.getElementById('item-edit-id').value = itemId;
    document.getElementById('item-category').value = findItemCategory(itemId) || activeMenuTab;
    document.getElementById('item-order').value = item.order || 1;
    document.getElementById('item-name').value = item.name || '';
    document.getElementById('item-desc').value = item.description || '';
    document.getElementById('item-price').value = item.price || '';
    document.getElementById('item-badge').value = item.badge || '';
    document.getElementById('item-badge-color').value = item.badgeColor || '';
    document.getElementById('item-image').value = item.image || '';

    // Image preview
    clearImagePreview();
    if (item.image) {
      setImagePreview(item.image);
    }

    // Sizes
    clearSizesContainer();
    if (item.sizes && item.sizes.length > 0) {
      item.sizes.forEach(s => addSizeRow(s.label, s.price));
    } else {
      addSizeRow();
    }

    document.getElementById('item-form-error').style.display = 'none';
    document.getElementById('item-modal').style.display = 'flex';
  }

  function closeItemModal() {
    document.getElementById('item-modal').style.display = 'none';
  }

  function saveItem(e) {
    e.preventDefault();
    const editId = document.getElementById('item-edit-id').value;
    const category = document.getElementById('item-category').value;
    const name = document.getElementById('item-name').value.trim();
    const desc = document.getElementById('item-desc').value.trim();
    const price = parseInt(document.getElementById('item-price').value) || 0;
    const badge = document.getElementById('item-badge').value.trim();
    const badgeColor = document.getElementById('item-badge-color').value;
    const order = parseInt(document.getElementById('item-order').value) || 1;
    const imageUrl = document.getElementById('item-image').value.trim();

    // Collect sizes
    const sizes = collectSizes();

    if (!name || !desc) {
      showFormError('item-form-error', 'Name and description are required');
      return;
    }

    if (sizes.length === 0 && price <= 0) {
      showFormError('item-form-error', 'Please set a price or add at least one size');
      return;
    }

    const itemData = {
      id: editId || generateId(category),
      name,
      description: desc,
      order,
      badge,
      badgeColor,
      image: imageUrl
    };

    if (sizes.length > 0) {
      itemData.sizes = sizes;
      itemData.price = sizes[0].price;
    } else {
      itemData.price = price;
    }

    const btn = document.getElementById('item-form-btn');
    setBtnLoading(btn, true);

    // Ensure category array exists
    if (!menuData[category]) menuData[category] = [];

    if (editId) {
      // Edit: remove from old category if changed
      const oldCat = findItemCategory(editId);
      if (oldCat && oldCat !== category) {
        menuData[oldCat] = menuData[oldCat].filter(i => i.id !== editId);
      } else if (oldCat) {
        menuData[oldCat] = menuData[oldCat].filter(i => i.id !== editId);
      }
      menuData[category].push(itemData);
    } else {
      menuData[category].push(itemData);
    }

    // Save to Firebase
    db.ref('menu').set(menuData)
      .then(() => {
        showToast(editId ? 'Item updated!' : 'Item added!', 'success');
        closeItemModal();
        renderMenuAdminTable();
        renderDashboard();
      })
      .catch(err => {
        showFormError('item-form-error', 'Failed to save: ' + err.message);
      })
      .finally(() => setBtnLoading(btn, false));
  }

  function deleteItem(itemId) {
    if (!hasPermission('canDeleteItems')) {
      showToast('Access denied — Only owners can delete items', 'error');
      return;
    }
    showConfirm('Delete Item', 'Are you sure you want to delete this item? This cannot be undone.', () => {
      const cat = findItemCategory(itemId);
      if (!cat) return;

      menuData[cat] = menuData[cat].filter(i => i.id !== itemId);

      db.ref('menu').set(menuData)
        .then(() => {
          showToast('Item deleted', 'success');
          renderMenuAdminTable();
          renderDashboard();
        })
        .catch(err => showToast('Delete failed: ' + err.message, 'error'));
    });
  }

  // ── SIZE ROWS ────────────────────────────────────────────
  function addSizeRow(label, price) {
    const container = document.getElementById('sizes-container');
    const idx = container.children.length;
    const row = document.createElement('div');
    row.className = 'size-row';
    row.dataset.index = idx;
    row.innerHTML = `
      <input type="text" class="size-label" placeholder='e.g. 11"' value="${label || ''}">
      <input type="number" class="size-price" placeholder="Price" min="0" value="${price || ''}">
      <button type="button" class="btn-remove-size" title="Remove">✕</button>
    `;
    container.appendChild(row);
  }

  function removeSizeRow(btn) {
    btn.closest('.size-row').remove();
  }

  function clearSizesContainer() {
    document.getElementById('sizes-container').innerHTML = '';
  }

  function collectSizes() {
    const rows = document.querySelectorAll('.size-row');
    const sizes = [];
    rows.forEach(row => {
      const label = row.querySelector('.size-label').value.trim();
      const price = parseInt(row.querySelector('.size-price').value) || 0;
      if (label && price > 0) {
        sizes.push({ label, price });
      }
    });
    return sizes;
  }

  // ── IMAGE UPLOAD ─────────────────────────────────────────
  function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 32 * 1024 * 1024) {
      showToast('Image too large (max 32MB)', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_API_KEY, {
      method: 'POST',
      body: formData
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        const url = data.data.display_url;
        document.getElementById('item-image').value = url;
        setImagePreview(url);
        showToast('Image uploaded!', 'success');
      } else {
        showToast('Upload failed', 'error');
      }
    })
    .catch(() => showToast('Upload failed — check connection', 'error'));
  }

  function setImagePreview(url) {
    const preview = document.getElementById('image-preview');
    if (!url) return;
    preview.innerHTML = `
      <img src="${url}" alt="Preview" style="width:60px;height:60px;object-fit:cover;border-radius:var(--r-xs);border:2px solid var(--clr-border)">
      <button type="button" class="btn btn-secondary btn-xs" onclick="document.getElementById('item-image-file').click()">Replace</button>
    `;
  }

  function clearImagePreview() {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = `<button type="button" class="btn btn-secondary btn-xs" onclick="document.getElementById('item-image-file').click()">📷 Upload Image</button>`;
  }

  // ── REVIEWS ADMIN ────────────────────────────────────────
  function renderReviewsAdmin() {
    const container = document.getElementById('reviews-admin-list');
    if (!container) return;

    if (reviewsData.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--clr-text-light);padding:var(--sp-8)">No reviews yet. Click "+ Add Review" to create one.</p>';
      return;
    }

    container.innerHTML = reviewsData.map(r => `
      <div class="review-admin-card">
        <div class="review-admin-avatar">${r.initial || r.name.charAt(0)}</div>
        <div class="review-admin-body">
          <div class="review-admin-header">
            <span class="review-admin-name">${r.name}</span>
            <span class="review-admin-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
            <span class="review-admin-platform">${r.platform || 'Customer'}</span>
          </div>
          <div class="review-admin-text">"${r.text}"</div>
        </div>
        <div class="review-admin-actions">
          <button class="btn-icon" title="Edit" onclick="adminApp.editReview('${r.id}')">✏️</button>
          <button class="btn-icon" title="Delete" onclick="adminApp.deleteReview('${r.id}')">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  function showAddReviewModal() {
    document.getElementById('review-modal-title').textContent = 'Add Review';
    document.getElementById('review-edit-id').value = '';
    document.getElementById('review-form').reset();
    document.getElementById('review-form-error').style.display = 'none';
    document.getElementById('review-modal').style.display = 'flex';
  }

  function editReview(reviewId) {
    const review = reviewsData.find(r => r.id === reviewId);
    if (!review) return;

    document.getElementById('review-modal-title').textContent = 'Edit Review';
    document.getElementById('review-edit-id').value = reviewId;
    document.getElementById('review-name').value = review.name || '';
    document.getElementById('review-stars').value = review.stars || 5;
    document.getElementById('review-platform').value = review.platform || 'Foodpanda';
    document.getElementById('review-text').value = review.text || '';
    document.getElementById('review-form-error').style.display = 'none';
    document.getElementById('review-modal').style.display = 'flex';
  }

  function closeReviewModal() {
    document.getElementById('review-modal').style.display = 'none';
  }

  function saveReview(e) {
    e.preventDefault();
    const editId = document.getElementById('review-edit-id').value;
    const name = document.getElementById('review-name').value.trim();
    const stars = parseInt(document.getElementById('review-stars').value) || 5;
    const platform = document.getElementById('review-platform').value;
    const text = document.getElementById('review-text').value.trim();

    if (!name || !text) {
      showFormError('review-form-error', 'Name and review text are required');
      return;
    }

    const btn = document.getElementById('review-form-btn');
    setBtnLoading(btn, true);

    const reviewData = {
      id: editId || ('r' + Date.now()),
      name,
      stars,
      platform,
      text,
      initial: name.charAt(0).toUpperCase()
    };

    if (editId) {
      const idx = reviewsData.findIndex(r => r.id === editId);
      if (idx !== -1) reviewsData[idx] = reviewData;
    } else {
      reviewsData.push(reviewData);
    }

    // Convert to Firebase format (object with IDs as keys)
    const fbData = {};
    reviewsData.forEach(r => { fbData[r.id] = r; });

    db.ref('reviews').set(fbData)
      .then(() => {
        showToast(editId ? 'Review updated!' : 'Review added!', 'success');
        closeReviewModal();
        renderReviewsAdmin();
        renderDashboard();
      })
      .catch(err => showFormError('review-form-error', 'Failed to save: ' + err.message))
      .finally(() => setBtnLoading(btn, false));
  }

  function deleteReview(reviewId) {
    showConfirm('Delete Review', 'Are you sure you want to delete this review?', () => {
      reviewsData = reviewsData.filter(r => r.id !== reviewId);
      const fbData = {};
      reviewsData.forEach(r => { fbData[r.id] = r; });

      db.ref('reviews').set(fbData)
        .then(() => {
          showToast('Review deleted', 'success');
          renderReviewsAdmin();
          renderDashboard();
        })
        .catch(err => showToast('Delete failed: ' + err.message, 'error'));
    });
  }

  // ── MODALS ───────────────────────────────────────────────
  function initModals() {
    // Item form
    document.getElementById('item-form').addEventListener('submit', saveItem);
    // Review form
    document.getElementById('review-form').addEventListener('submit', saveReview);

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
        }
      });
    });

    // ESC key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      }
    });
  }

  // ── CONFIRM DIALOG ───────────────────────────────────────
  let confirmCallback = null;

  function showConfirm(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-modal').style.display = 'flex';
    confirmCallback = onConfirm;
  }

  // ── TOAST ────────────────────────────────────────────────
  function showToast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  // ── HELPERS ──────────────────────────────────────────────
  function findItemById(id) {
    for (const cat of Object.values(menuData)) {
      if (!cat) continue;
      const item = cat.find(i => i.id === id);
      if (item) return item;
    }
    return null;
  }

  function findItemCategory(id) {
    for (const [key, cat] of Object.entries(menuData)) {
      if (!cat) continue;
      if (cat.find(i => i.id === id)) return key;
    }
    return null;
  }

  function getNextOrder(category) {
    const items = menuData[category] || [];
    if (items.length === 0) return 1;
    return Math.max(...items.map(i => i.order || 0)) + 1;
  }

  function generateId(category) {
    const prefix = category.substring(0, 2);
    return prefix + '_' + Date.now();
  }

  function showFormError(elId, msg) {
    const el = document.getElementById(elId);
    el.textContent = msg;
    el.style.display = 'block';
  }

  function setBtnLoading(btn, loading) {
    btn.querySelector('.btn-text').style.display = loading ? 'none' : 'inline';
    btn.querySelector('.btn-spinner').style.display = loading ? 'inline' : 'none';
    btn.disabled = loading;
  }

  // ── FALLBACK DATA ────────────────────────────────────────
  function getFallbackMenu() {
    return {
      pizzas: [
        { id:'p1',name:'Wood Fired Smokehouse Pizza',description:'Tender smoked chicken, melted mozzarella, zesty tomato sauce, parmesan & fresh basil',image:'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop',sizes:[{label:'11"',price:1849},{label:'16"',price:2699}],badge:'Bestseller',badgeColor:'red',order:1 },
        { id:'p2',name:'Chef Margherita Special Pizza',description:'Crisp thin crust, fresh mozzarella, ripened tomatoes, fragrant basil, wood fired',image:'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=400&fit=crop',sizes:[{label:'11"',price:1649},{label:'16"',price:2399}],badge:'Classic',badgeColor:'green',order:2 },
        { id:'p3',name:'Wood Fired Pepperoni Pizza',description:'Beef or chicken pepperoni, melted mozzarella, parmesan & fresh basil',image:'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop',sizes:[{label:'11"',price:1849},{label:'16"',price:2699}],badge:'',badgeColor:'',order:3 },
        { id:'p4',name:'Wood Fired Veggies Delight',description:'Flame-roasted vegetables, mozzarella, tomato sauce, parmesan & basil',image:'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop',sizes:[{label:'11"',price:1699},{label:'16"',price:2499}],badge:'Veggie',badgeColor:'green',order:4 },
        { id:'p5',name:'BBQ Chicken Pizza',description:'Smoky BBQ sauce, grilled chicken, red onions, mozzarella & cilantro',image:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',sizes:[{label:'11"',price:1899},{label:'16"',price:2799}],badge:'Popular',badgeColor:'',order:5 },
        { id:'p6',name:'Four Cheese Pizza',description:'Mozzarella, cheddar, parmesan & gorgonzola on a crispy wood-fired base',image:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop',sizes:[{label:'11"',price:1799},{label:'16"',price:2599}],badge:'Cheesy',badgeColor:'red',order:6 }
      ],
      mains: [
        { id:'m1',name:'Chicken Parmesan',description:'Crispy chicken breast in breadcrumbs, marinara, mozzarella, parmesan, served with spaghetti',image:'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop',price:1799,badge:'#1 Most Liked',badgeColor:'red',order:1 },
        { id:'m2',name:'Panuozzo Signature Sandwich',description:'Wood-fired Italian bread stuffed with juicy chicken, crisp lettuce & smoky mayo',image:'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&h=400&fit=crop',price:1149,badge:'#2 Most Liked',badgeColor:'red',order:2 },
        { id:'m3',name:'Grilled Steak Plate',description:'Juicy grilled steak with roasted vegetables, herb butter & garlic mashed potatoes',image:'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&h=400&fit=crop',price:2299,badge:'Premium',badgeColor:'',order:3 },
        { id:'m4',name:'Herb Roasted Chicken',description:'Whole herb-marinated chicken, slow roasted, served with seasonal vegetables',image:'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop',price:1899,badge:'',badgeColor:'',order:4 },
        { id:'m5',name:'Fish & Chips',description:'Beer-battered fish fillets, golden fries, tartar sauce & lemon wedge',image:'https://images.unsplash.com/photo-1579208030886-b1f5b734b5e7?w=600&h=400&fit=crop',price:1549,badge:'',badgeColor:'',order:5 }
      ],
      pasta: [
        { id:'pa1',name:'Alfredo White Sauce Pasta',description:'Silky fettuccine, rich creamy alfredo, parmesan & fresh herbs',image:'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',price:1549,badge:'',badgeColor:'',order:1 },
        { id:'pa2',name:'Spicy Fusilli Pasta',description:'Fusilli in zesty tomato sauce, chili flakes, garlic & parmesan',image:'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop',price:1649,badge:'Spicy 🌶️',badgeColor:'red',order:2 },
        { id:'pa3',name:'Beef Lasagna',description:'Layers of pasta, rich beef ragù, creamy béchamel & melted mozzarella',image:'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=400&fit=crop',price:1749,badge:'Comfort Food',badgeColor:'green',order:3 },
        { id:'pa4',name:'Penne Arrabbiata',description:'Penne in fiery tomato sauce with garlic, red chili & fresh basil',image:'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop',price:1449,badge:'',badgeColor:'',order:4 },
        { id:'pa5',name:'Chicken Carbonara',description:'Spaghetti with creamy egg sauce, grilled chicken, parmesan & black pepper',image:'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop',price:1699,badge:'',badgeColor:'',order:5 }
      ],
      appetizers: [
        { id:'a1',name:'Cracklin Chicken',description:'Crispy golden chicken bites with tangy dipping sauce',image:'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop',price:829,badge:'',badgeColor:'',order:1 },
        { id:'a2',name:'Chicken Tenders',description:'Hand-breaded chicken strips, golden crisp, with choice of dipping sauce',image:'https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=600&h=400&fit=crop',price:899,badge:'',badgeColor:'',order:2 },
        { id:'a3',name:'Garlic Bread with Cheese',description:'Warm baked garlic bread with mozzarella & parmesan',image:'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&h=400&fit=crop',price:399,badge:'Value',badgeColor:'green',order:3 },
        { id:'a5',name:'Mozzarella Sticks',description:'Crispy fried mozzarella sticks with marinara dipping sauce',image:'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=600&h=400&fit=crop',price:699,badge:'',badgeColor:'',order:5 },
        { id:'a6',name:'Chicken Wings',description:'Crispy wings tossed in your choice of buffalo, BBQ or honey garlic',image:'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop',price:999,badge:'Popular',badgeColor:'red',order:6 }
      ],
      burgers: [
        { id:'b1',name:'Harry Chicken Burger',description:'Grilled chicken breast, lettuce, tomatoes, mayo, toasted bun, served with fries & dip',image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',price:1149,badge:'Signature',badgeColor:'red',order:1 },
        { id:'b2',name:'Classic Beef Burger',description:'Juicy beef patty, cheddar, pickles, onion rings & smoky BBQ sauce',image:'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=400&fit=crop',price:1249,badge:'',badgeColor:'',order:2 },
        { id:'b3',name:'Double Smash Burger',description:'Two smashed beef patties, American cheese, special sauce, pickles',image:'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&h=400&fit=crop',price:1499,badge:'Loaded',badgeColor:'red',order:3 },
        { id:'b4',name:'Crispy Chicken Burger',description:'Crispy fried chicken fillet, coleslaw, pickles & spicy mayo',image:'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&h=400&fit=crop',price:1099,badge:'',badgeColor:'',order:4 },
        { id:'b5',name:'Veggie Burger',description:'Black bean patty, avocado, lettuce, tomato & herb mayo',image:'https://images.unsplash.com/photo-1520072959219-c595e6cdc07e?w=600&h=400&fit=crop',price:999,badge:'Veggie',badgeColor:'green',order:5 }
      ],
      wraps: [
        { id:'w1',name:'Chicken Tortilla Wrap',description:'Grilled chicken, flour tortilla, lettuce, tomato, onion, creamy sauce',image:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop',price:575,badge:'',badgeColor:'',order:1 },
        { id:'w2',name:'BBQ Chicken Wrap',description:'Smoky BBQ chicken, crisp lettuce, cheddar cheese & ranch dressing',image:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop',price:649,badge:'',badgeColor:'',order:2 },
        { id:'w3',name:'Seekh Kabab Wrap',description:'Spicy seekh kabab, fresh onion, mint chutney & tamarind sauce',image:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop',price:599,badge:'Desi',badgeColor:'',order:3 },
        { id:'w4',name:'Falafel Wrap',description:'Crispy falafel, hummus, pickled veggies & tahini sauce',image:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop',price:549,badge:'Veggie',badgeColor:'green',order:4 },
        { id:'w5',name:'Grilled Veggie Wrap',description:'Roasted vegetables, feta cheese, mixed greens & balsamic glaze',image:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop',price:525,badge:'',badgeColor:'',order:5 }
      ],
      beverages: [
        { id:'bv1',name:'Fruity Fizz — Peach',description:'Refreshing sparkling peach drink',image:'',price:449,badge:'',badgeColor:'',order:1 },
        { id:'bv2',name:'Fruity Fizz — Mango',description:'Refreshing sparkling mango drink',image:'',price:449,badge:'Popular',badgeColor:'green',order:2 },
        { id:'bv3',name:'Fruity Fizz — Lychee',description:'Refreshing sparkling lychee drink',image:'',price:449,badge:'',badgeColor:'',order:3 },
        { id:'bv4',name:'Fresh Lime',description:'Freshly squeezed lime with soda',image:'',price:220,badge:'#3 Most Liked',badgeColor:'green',order:4 },
        { id:'bv5',name:'Mint Lemonade',description:'Cool mint & fresh lemon, perfectly balanced',image:'',price:349,badge:'Refreshing',badgeColor:'',order:5 },
        { id:'bv6',name:'Fruity Fizz — Orange',description:'Refreshing sparkling orange drink',image:'',price:449,badge:'',badgeColor:'',order:6 },
        { id:'bv7',name:'Iced Tea',description:'Chilled classic iced tea with lemon',image:'',price:299,badge:'',badgeColor:'',order:7 }
      ],
      desserts: [
        { id:'d1',name:'Molten Lava Cake',description:'Warm, gooey, and dangerously irresistible chocolate lava cake',image:'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop',price:699,badge:'New!',badgeColor:'red',order:1 },
        { id:'d2',name:'Tiramisu',description:'Classic Italian tiramisu with espresso-soaked ladyfingers & mascarpone',image:'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop',price:749,badge:'Italian Classic',badgeColor:'',order:2 },
        { id:'d3',name:'New York Cheesecake',description:'Creamy baked cheesecake with a buttery graham cracker base',image:'https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=600&h=400&fit=crop',price:649,badge:'',badgeColor:'',order:3 },
        { id:'d4',name:'Chocolate Brownie',description:'Warm fudgy brownie served with vanilla ice cream',image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop',price:549,badge:'',badgeColor:'',order:4 },
        { id:'d5',name:'Gelato Scoops',description:'Authentic Italian gelato — choose from vanilla, chocolate, pistachio or mango',image:'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&h=400&fit=crop',price:399,badge:'Seasonal',badgeColor:'green',order:5 }
      ],
      deals: [
        { id:'dl1',name:'Tortilla Wrap Meal',description:'Wrap + fries + drink — a complete meal',image:'',price:699,badge:'Value',badgeColor:'green',order:1 },
        { id:'dl2',name:"Harry's Wrap Combo",description:'2 wraps + fries + 2 drinks',image:'',price:1149,badge:'',badgeColor:'',order:2 },
        { id:'dl3',name:'Wrap Sharing Box',description:'4 wraps + 2 sides + 4 drinks — perfect for sharing',image:'',price:1899,badge:'Best Value',badgeColor:'red',order:3 },
        { id:'dl4',name:'Pizza Duo Deal',description:'2 medium pizzas + garlic bread + 2 drinks',image:'',price:3299,badge:'Popular',badgeColor:'red',order:4 },
        { id:'dl5',name:'Family Feast',description:'1 large pizza + 1 pasta + 4 chicken tenders + garlic bread + 4 drinks',image:'',price:4499,badge:'Best Seller',badgeColor:'red',order:5 },
        { id:'dl6',name:'Burger Combo',description:'Burger + fries + drink',image:'',price:1349,badge:'',badgeColor:'',order:6 }
      ]
    };
  }

  function getFallbackReviews() {
    return [
      { id:'r1',name:'Ahmed K.',text:'Best pizza I have found so far in Lahore. Delicious!',stars:5,platform:'Foodpanda',initial:'A' },
      { id:'r2',name:'Sara M.',text:'Amazing sandwich 10/10 taste worth the price, excellent quality and quantity, received fresh.',stars:5,platform:'Foodpanda',initial:'S' },
      { id:'r3',name:'Usman T.',text:'Wonderful parmesan chicken. Will definitely order again!',stars:5,platform:'Foodpanda',initial:'U' },
      { id:'r4',name:'Fatima R.',text:'Chicken burger was good! Quality and quantity was awesome as always.',stars:4,platform:'Foodpanda',initial:'F' },
      { id:'r5',name:'Ali H.',text:'Great wood-fired flavor, the crust is perfection. Best in Gulberg!',stars:5,platform:'Google',initial:'A' },
      { id:'r6',name:'Zainab S.',text:'Family-friendly atmosphere and the kids love the cheesy garlic bread.',stars:4,platform:'Facebook',initial:'Z' },
      { id:'r7',name:'Bilal A.',text:'The Molten Lava Cake is to die for. Perfect end to a great meal!',stars:5,platform:'Instagram',initial:'B' },
      { id:'r8',name:'Hira N.',text:'Love the outdoor seating at Gulberg branch. Pizza was amazing as always.',stars:4,platform:'Google',initial:'H' }
    ];
  }

  // ── CONFIRM DIALOG HANDLERS ──────────────────────────────
  document.getElementById('confirm-ok').addEventListener('click', () => {
    document.getElementById('confirm-modal').style.display = 'none';
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
  });
  document.getElementById('confirm-cancel').addEventListener('click', () => {
    document.getElementById('confirm-modal').style.display = 'none';
    confirmCallback = null;
  });

  // ── EXPOSE PUBLIC API ────────────────────────────────────
  window.adminApp = {
    switchView,
    showAddItemModal,
    editItem,
    deleteItem,
    closeItemModal,
    showAddReviewModal,
    editReview,
    deleteReview,
    closeReviewModal,
    addSizeRow,
    removeSizeRow,
    handleImageUpload
  };

  // ── BOOT ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
