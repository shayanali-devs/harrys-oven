/* ═══════════════════════════════════════════════════════════
   HARRY'S OVEN — Main Application Logic
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── FALLBACK MENU DATA (5+ items per category) ──────────
  const FALLBACK_MENU = {
    pizzas: [
      { id: 'p1', name: 'Wood Fired Smokehouse Pizza', description: 'Tender smoked chicken, melted mozzarella, zesty tomato sauce, parmesan & fresh basil', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop', sizes: [{ label: '11"', price: 1849 }, { label: '16"', price: 2699 }], badge: 'Bestseller', badgeColor: 'red', order: 1 },
      { id: 'p2', name: 'Chef Margherita Special Pizza', description: 'Crisp thin crust, fresh mozzarella, ripened tomatoes, fragrant basil, wood fired', image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=400&fit=crop', sizes: [{ label: '11"', price: 1649 }, { label: '16"', price: 2399 }], badge: 'Classic', badgeColor: 'green', order: 2 },
      { id: 'p3', name: 'Wood Fired Pepperoni Pizza', description: 'Beef or chicken pepperoni, melted mozzarella, parmesan & fresh basil', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop', sizes: [{ label: '11"', price: 1849 }, { label: '16"', price: 2699 }], badge: '', badgeColor: '', order: 3 },
      { id: 'p4', name: 'Wood Fired Veggies Delight', description: 'Flame-roasted vegetables, mozzarella, tomato sauce, parmesan & basil', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop', sizes: [{ label: '11"', price: 1699 }, { label: '16"', price: 2499 }], badge: 'Veggie', badgeColor: 'green', order: 4 },
      { id: 'p5', name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce, grilled chicken, red onions, mozzarella & cilantro', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop', sizes: [{ label: '11"', price: 1899 }, { label: '16"', price: 2799 }], badge: 'Popular', badgeColor: '', order: 5 },
      { id: 'p6', name: 'Four Cheese Pizza', description: 'Mozzarella, cheddar, parmesan & gorgonzola on a crispy wood-fired base', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop', sizes: [{ label: '11"', price: 1799 }, { label: '16"', price: 2599 }], badge: 'Cheesy', badgeColor: 'red', order: 6 }
    ],
    mains: [
      { id: 'm1', name: 'Chicken Parmesan', description: 'Crispy chicken breast in breadcrumbs, marinara, mozzarella, parmesan, served with spaghetti', image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop', price: 1799, badge: '#1 Most Liked', badgeColor: 'red', order: 1 },
      { id: 'm2', name: 'Panuozzo Signature Sandwich', description: 'Wood-fired Italian bread stuffed with juicy chicken, crisp lettuce & smoky mayo', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&h=400&fit=crop', price: 1149, badge: '#2 Most Liked', badgeColor: 'red', order: 2 },
      { id: 'm3', name: 'Grilled Steak Plate', description: 'Juicy grilled steak with roasted vegetables, herb butter & garlic mashed potatoes', image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&h=400&fit=crop', price: 2299, badge: 'Premium', badgeColor: '', order: 3 },
      { id: 'm4', name: 'Herb Roasted Chicken', description: 'Whole herb-marinated chicken, slow roasted, served with seasonal vegetables', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop', price: 1899, badge: '', badgeColor: '', order: 4 },
      { id: 'm5', name: 'Fish & Chips', description: 'Beer-battered fish fillets, golden fries, tartar sauce & lemon wedge', image: 'https://images.unsplash.com/photo-1579208030886-b1f5b734b5e7?w=600&h=400&fit=crop', price: 1549, badge: '', badgeColor: '', order: 5 }
    ],
    pasta: [
      { id: 'pa1', name: 'Alfredo White Sauce Pasta', description: 'Silky fettuccine, rich creamy alfredo, parmesan & fresh herbs', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop', price: 1549, badge: '', badgeColor: '', order: 1 },
      { id: 'pa2', name: 'Spicy Fusilli Pasta', description: 'Fusilli in zesty tomato sauce, chili flakes, garlic & parmesan', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop', price: 1649, badge: 'Spicy 🌶️', badgeColor: 'red', order: 2 },
      { id: 'pa3', name: 'Beef Lasagna', description: 'Layers of pasta, rich beef ragù, creamy béchamel & melted mozzarella', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=400&fit=crop', price: 1749, badge: 'Comfort Food', badgeColor: 'green', order: 3 },
      { id: 'pa4', name: 'Penne Arrabbiata', description: 'Penne in fiery tomato sauce with garlic, red chili & fresh basil', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop', price: 1449, badge: '', badgeColor: '', order: 4 },
      { id: 'pa5', name: 'Chicken Carbonara', description: 'Spaghetti with creamy egg sauce, grilled chicken, parmesan & black pepper', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop', price: 1699, badge: '', badgeColor: '', order: 5 }
    ],
    appetizers: [
      { id: 'a1', name: 'Cracklin Chicken', description: 'Crispy golden chicken bites with tangy dipping sauce', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop', price: 829, badge: '', badgeColor: '', order: 1 },
      { id: 'a2', name: 'Chicken Tenders', description: 'Hand-breaded chicken strips, golden crisp, with choice of dipping sauce', image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=600&h=400&fit=crop', price: 899, badge: '', badgeColor: '', order: 2 },
      { id: 'a3', name: 'Garlic Bread with Cheese', description: 'Warm baked garlic bread with mozzarella & parmesan', image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&h=400&fit=crop', price: 399, badge: 'Value', badgeColor: 'green', order: 3 },
      { id: 'a4', name: 'Loaded Potato Skins', description: 'Crispy potato skins topped with cheese, bacon bits & sour cream', image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber632?w=600&h=400&fit=crop', price: 749, badge: '', badgeColor: '', order: 4 },
      { id: 'a5', name: 'Mozzarella Sticks', description: 'Crispy fried mozzarella sticks with marinara dipping sauce', image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=600&h=400&fit=crop', price: 699, badge: '', badgeColor: '', order: 5 },
      { id: 'a6', name: 'Chicken Wings', description: 'Crispy wings tossed in your choice of buffalo, BBQ or honey garlic', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop', price: 999, badge: 'Popular', badgeColor: 'red', order: 6 }
    ],
    burgers: [
      { id: 'b1', name: 'Harry Chicken Burger', description: 'Grilled chicken breast, lettuce, tomatoes, mayo, toasted bun, served with fries & dip', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', price: 1149, badge: 'Signature', badgeColor: 'red', order: 1 },
      { id: 'b2', name: 'Classic Beef Burger', description: 'Juicy beef patty, cheddar, pickles, onion rings & smoky BBQ sauce', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=400&fit=crop', price: 1249, badge: '', badgeColor: '', order: 2 },
      { id: 'b3', name: 'Double Smash Burger', description: 'Two smashed beef patties, American cheese, special sauce, pickles', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&h=400&fit=crop', price: 1499, badge: 'Loaded', badgeColor: 'red', order: 3 },
      { id: 'b4', name: 'Crispy Chicken Burger', description: 'Crispy fried chicken fillet, coleslaw, pickles & spicy mayo', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&h=400&fit=crop', price: 1099, badge: '', badgeColor: '', order: 4 },
      { id: 'b5', name: 'Veggie Burger', description: 'Black bean patty, avocado, lettuce, tomato & herb mayo', image: 'https://images.unsplash.com/photo-1520072959219-c595e6cdc07e?w=600&h=400&fit=crop', price: 999, badge: 'Veggie', badgeColor: 'green', order: 5 }
    ],
    wraps: [
      { id: 'w1', name: 'Chicken Tortilla Wrap', description: 'Grilled chicken, flour tortilla, lettuce, tomato, onion, creamy sauce', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop', price: 575, badge: '', badgeColor: '', order: 1 },
      { id: 'w2', name: 'BBQ Chicken Wrap', description: 'Smoky BBQ chicken, crisp lettuce, cheddar cheese & ranch dressing', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop', price: 649, badge: '', badgeColor: '', order: 2 },
      { id: 'w3', name: 'Seekh Kabab Wrap', description: 'Spicy seekh kabab, fresh onion, mint chutney & tamarind sauce', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop', price: 599, badge: 'Desi', badgeColor: '', order: 3 },
      { id: 'w4', name: 'Falafel Wrap', description: 'Crispy falafel, hummus, pickled veggies & tahini sauce', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop', price: 549, badge: 'Veggie', badgeColor: 'green', order: 4 },
      { id: 'w5', name: 'Grilled Veggie Wrap', description: 'Roasted vegetables, feta cheese, mixed greens & balsamic glaze', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop', price: 525, badge: '', badgeColor: '', order: 5 }
    ],
    beverages: [
      { id: 'bv1', name: 'Fruity Fizz — Peach', description: 'Refreshing sparkling peach drink', image: '', price: 449, badge: '', badgeColor: '', order: 1 },
      { id: 'bv2', name: 'Fruity Fizz — Mango', description: 'Refreshing sparkling mango drink', image: '', price: 449, badge: 'Popular', badgeColor: 'green', order: 2 },
      { id: 'bv3', name: 'Fruity Fizz — Lychee', description: 'Refreshing sparkling lychee drink', image: '', price: 449, badge: '', badgeColor: '', order: 3 },
      { id: 'bv4', name: 'Fresh Lime', description: 'Freshly squeezed lime with soda', image: '', price: 220, badge: '#3 Most Liked', badgeColor: 'green', order: 4 },
      { id: 'bv5', name: 'Mint Lemonade', description: 'Cool mint & fresh lemon, perfectly balanced', image: '', price: 349, badge: 'Refreshing', badgeColor: '', order: 5 },
      { id: 'bv6', name: 'Fruity Fizz — Orange', description: 'Refreshing sparkling orange drink', image: '', price: 449, badge: '', badgeColor: '', order: 6 },
      { id: 'bv7', name: 'Iced Tea', description: 'Chilled classic iced tea with lemon', image: '', price: 299, badge: '', badgeColor: '', order: 7 }
    ],
    desserts: [
      { id: 'd1', name: 'Molten Lava Cake', description: 'Warm, gooey, and dangerously irresistible chocolate lava cake', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop', price: 699, badge: 'New!', badgeColor: 'red', order: 1 },
      { id: 'd2', name: 'Tiramisu', description: 'Classic Italian tiramisu with espresso-soaked ladyfingers & mascarpone', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop', price: 749, badge: 'Italian Classic', badgeColor: '', order: 2 },
      { id: 'd3', name: 'New York Cheesecake', description: 'Creamy baked cheesecake with a buttery graham cracker base', image: 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=600&h=400&fit=crop', price: 649, badge: '', badgeColor: '', order: 3 },
      { id: 'd4', name: 'Chocolate Brownie', description: 'Warm fudgy brownie served with vanilla ice cream', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop', price: 549, badge: '', badgeColor: '', order: 4 },
      { id: 'd5', name: 'Gelato Scoops', description: 'Authentic Italian gelato — choose from vanilla, chocolate, pistachio or mango', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&h=400&fit=crop', price: 399, badge: 'Seasonal', badgeColor: 'green', order: 5 }
    ],
    deals: [
      { id: 'dl1', name: 'Tortilla Wrap Meal', description: 'Wrap + fries + drink — a complete meal', image: '', price: 699, badge: 'Value', badgeColor: 'green', order: 1 },
      { id: 'dl2', name: "Harry's Wrap Combo", description: '2 wraps + fries + 2 drinks', image: '', price: 1149, badge: '', badgeColor: '', order: 2 },
      { id: 'dl3', name: 'Wrap Sharing Box', description: '4 wraps + 2 sides + 4 drinks — perfect for sharing', image: '', price: 1899, badge: 'Best Value', badgeColor: 'red', order: 3 },
      { id: 'dl4', name: 'Pizza Duo Deal', description: '2 medium pizzas + garlic bread + 2 drinks', image: '', price: 3299, badge: 'Popular', badgeColor: 'red', order: 4 },
      { id: 'dl5', name: 'Family Feast', description: '1 large pizza + 1 pasta + 4 chicken tenders + garlic bread + 4 drinks', image: '', price: 4499, badge: 'Best Seller', badgeColor: 'red', order: 5 },
      { id: 'dl6', name: 'Burger Combo', description: 'Burger + fries + drink', image: '', price: 1349, badge: '', badgeColor: '', order: 6 }
    ]
  };

  const FALLBACK_REVIEWS = [
    { id: 'r1', name: 'Ahmed K.', text: 'Best pizza I have found so far in Lahore. Delicious!', stars: 5, platform: 'Foodpanda', initial: 'A' },
    { id: 'r2', name: 'Sara M.', text: 'Amazing sandwich 10/10 taste worth the price, excellent quality and quantity, received fresh.', stars: 5, platform: 'Foodpanda', initial: 'S' },
    { id: 'r3', name: 'Usman T.', text: 'Wonderful parmesan chicken. Will definitely order again!', stars: 5, platform: 'Foodpanda', initial: 'U' },
    { id: 'r4', name: 'Fatima R.', text: 'Chicken burger was good! Quality and quantity was awesome as always.', stars: 4, platform: 'Foodpanda', initial: 'F' },
    { id: 'r5', name: 'Ali H.', text: 'Great wood-fired flavor, the crust is perfection. Best in Gulberg!', stars: 5, platform: 'Google', initial: 'A' },
    { id: 'r6', name: 'Zainab S.', text: 'Family-friendly atmosphere and the kids love the cheesy garlic bread.', stars: 4, platform: 'Facebook', initial: 'Z' },
    { id: 'r7', name: 'Bilal A.', text: 'The Molten Lava Cake is to die for. Perfect end to a great meal!', stars: 5, platform: 'Instagram', initial: 'B' },
    { id: 'r8', name: 'Hira N.', text: 'Love the outdoor seating at Gulberg branch. Pizza was amazing as always.', stars: 4, platform: 'Google', initial: 'H' }
  ];

  // ── CATEGORY DISPLAY CONFIG ──
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

  // ── STATE ──
  let menuData = null;
  let activeTab = 'pizzas';

  // ── NAVBAR ────────────────────────────────────────────
  function initNav() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.nav-mobile');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    });

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  // ── MENU ──────────────────────────────────────────────
  function loadMenu() {
    db.ref('menu').once('value')
      .then(snapshot => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
          menuData = data;
        } else {
          menuData = FALLBACK_MENU;
        }
        renderMenuTabs();
        renderMenuGrid();
      })
      .catch(() => {
        menuData = FALLBACK_MENU;
        renderMenuTabs();
        renderMenuGrid();
      });
  }

  function renderMenuTabs() {
    const tabsContainer = document.getElementById('menu-tabs');
    if (!tabsContainer || !menuData) return;

    tabsContainer.innerHTML = '';
    Object.keys(CATEGORIES).forEach(key => {
      if (!menuData[key] || menuData[key].length === 0) return;
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (key === activeTab ? ' active' : '');
      btn.textContent = CATEGORIES[key].label;
      btn.dataset.category = key;
      btn.addEventListener('click', () => {
        activeTab = key;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenuGrid();
      });
      tabsContainer.appendChild(btn);
    });
  }

  function renderMenuGrid() {
    const grid = document.getElementById('menu-grid');
    if (!grid || !menuData) return;

    const items = menuData[activeTab] || [];
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--clr-text-light);padding:40px;grid-column:1/-1;">Coming soon...</p>';
      return;
    }

    items.sort((a, b) => (a.order || 999) - (b.order || 999));

    // Category emoji for no-image placeholders
    const catEmoji = CATEGORIES[activeTab] ? CATEGORIES[activeTab].emoji : '🍽️';
    const catClass = activeTab === 'beverages' ? 'cat-beverages' :
                     activeTab === 'deals' ? 'cat-deals' : 'cat-default';

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'menu-card fade-in';

      const hasImage = item.image && item.image.trim();
      const hasSizes = item.sizes && item.sizes.length > 0;
      const badgeHTML = item.badge ? `<span class="menu-badge ${item.badgeColor || ''}">${item.badge}</span>` : '';

      let priceHTML = '';
      if (hasSizes) {
        priceHTML = `<span class="menu-price"><span class="from">from </span>Rs. ${item.sizes[0].price.toLocaleString()}</span>`;
      } else {
        priceHTML = `<span class="menu-price">Rs. ${item.price.toLocaleString()}</span>`;
      }

      let sizesHTML = '';
      if (hasSizes) {
        sizesHTML = '<div class="menu-sizes">' +
          item.sizes.map((s, i) =>
            `<span class="size-chip${i === 0 ? ' active' : ''}" data-price="${s.price}">${s.label} — Rs. ${s.price.toLocaleString()}</span>`
          ).join('') + '</div>';
      }

      const ribbonHTML = (item.badge === 'Bestseller' || item.badge === '#1 Most Liked' || item.badge === 'Best Seller')
        ? `<div class="sold-ribbon">${item.badge}</div>` : '';

      // No-image placeholder or actual image
      const imageHTML = hasImage
        ? `<img class="menu-card-img" src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="menu-card-no-img ${catClass}">${catEmoji}</div>`;

      // WhatsApp order button
      const orderURL = `https://wa.me/923044444292?text=${encodeURIComponent('Hi! I\'d like to order the ' + item.name)}`;
      const orderBtnHTML = `<a class="menu-card-order" href="${orderURL}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>Order</a>`;

      card.innerHTML = `
        ${ribbonHTML}
        ${imageHTML}
        <div class="menu-card-body">
          <div class="menu-card-name">${item.name}</div>
          <div class="menu-card-desc">${item.description}</div>
          ${sizesHTML}
          <div class="menu-card-footer">
            ${priceHTML}
            ${badgeHTML}
            ${orderBtnHTML}
          </div>
        </div>
      `;

      grid.appendChild(card);

      if (hasSizes) {
        card.querySelectorAll('.size-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            card.querySelectorAll('.size-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const price = chip.dataset.price;
            card.querySelector('.menu-price').innerHTML = `Rs. ${parseInt(price).toLocaleString()}`;
          });
        });
      }
    });

    requestAnimationFrame(() => {
      grid.querySelectorAll('.fade-in').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 50);
      });
    });
  }

  // ── SIGNATURE DISHES ──────────────────────────────────
  function renderSignatureDishes() {
    const grid = document.getElementById('signature-grid');
    if (!grid) return;

    const dishes = [
      { name: 'Smokehouse Pizza', desc: 'Wood-fired with tender smoked chicken', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop', price: '1,849', badge: 'Bestseller', badgeColor: 'red' },
      { name: 'Chicken Parmesan', desc: 'Crispy chicken, marinara, mozzarella', image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop', price: '1,799', badge: '#1 Most Liked', badgeColor: 'red' },
      { name: 'Panuozzo Sandwich', desc: 'Wood-fired Italian bread, juicy chicken', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&h=400&fit=crop', price: '1,149', badge: '#2 Most Liked', badgeColor: 'green' },
      { name: 'Molten Lava Cake', desc: 'Warm, gooey, dangerously irresistible', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop', price: '699', badge: 'New!', badgeColor: 'red' }
    ];

    grid.innerHTML = dishes.map(d => `
      <div class="sig-card fade-in">
        <img class="sig-card-img" src="${d.image}" alt="${d.name}" loading="lazy">
        <div class="sig-card-body">
          <div class="sig-card-name">${d.name}</div>
          <div class="sig-card-desc">${d.desc}</div>
          <div class="sig-card-footer">
            <span class="sig-price">Rs. ${d.price}</span>
            <span class="sig-badge ${d.badgeColor}">${d.badge}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── REVIEWS ───────────────────────────────────────────
  function loadReviews() {
    db.ref('reviews').once('value')
      .then(snapshot => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
          renderReviews(Object.values(data));
        } else {
          renderReviews(FALLBACK_REVIEWS);
        }
      })
      .catch(() => renderReviews(FALLBACK_REVIEWS));
  }

  function renderReviews(reviews) {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    grid.innerHTML = reviews.map(r => `
      <div class="review-card fade-in">
        <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
        <div class="review-text">"${r.text}"</div>
        <div class="review-author">
          <div class="review-avatar">${r.initial || r.name.charAt(0)}</div>
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-platform">${r.platform || 'Verified Customer'}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── SCROLL ANIMATIONS ─────────────────────────────────
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // ── SMOOTH SCROLL ─────────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const offset = 80;
          const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  }

  // ── ANIMATED STATS COUNTER ─────────────────────────────
  function initStatsCounter() {
    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    const statNums = statsBar.querySelectorAll('.stat-num[data-target]');
    let animated = false;

    // easeOutQuart easing function
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1500; // 1.5s
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.round(easedProgress * target);
        el.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          statNums.forEach(el => animateCounter(el));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsBar);
  }

  // ── BACK TO TOP BUTTON ──────────────────────────────────
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── LOADING OVERLAY ─────────────────────────────────────
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => {
      loader.classList.add('loaded');
    }, 800);
  }

  // ── DYNAMIC COPYRIGHT YEAR ──────────────────────────────
  function initCopyrightYear() {
    const el = document.getElementById('copyright-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ── MENU TAB SCROLL INDICATOR ───────────────────────────
  function initMenuTabScroll() {
    const wrap = document.querySelector('.menu-tabs-wrap');
    const tabs = document.getElementById('menu-tabs');
    if (!wrap || !tabs) return;

    function checkScroll() {
      wrap.classList.toggle('scrolling', tabs.scrollLeft + tabs.clientWidth < tabs.scrollWidth - 2);
    }

    tabs.addEventListener('scroll', checkScroll);
    // Check on resize and initially
    window.addEventListener('resize', checkScroll);
    setTimeout(checkScroll, 500);
  }

  // ── INIT ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNav();
    renderSignatureDishes();
    loadMenu();
    loadReviews();
    initSmoothScroll();
    initStatsCounter();
    initBackToTop();
    initCopyrightYear();
    initMenuTabScroll();

    setTimeout(initScrollAnimations, 300);

    const gridObserver = new MutationObserver(() => {
      document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08 });
        observer.observe(el);
      });
    });
    const menuGrid = document.getElementById('menu-grid');
    if (menuGrid) gridObserver.observe(menuGrid, { childList: true });
  });

})();
