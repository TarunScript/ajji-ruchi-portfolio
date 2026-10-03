/**
 * Ajji Ruchi & Allied Brands - Interactive Application Logic
 * M.G. Bannishetty Foods & Beverages
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let currentCategory = 'all';
  let searchQuery = '';
  let currentPitchSlide = 0;
  
  // --- DOM ELEMENTS ---
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('productSearchInput');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const catalogCount = document.getElementById('catalogCount');
  
  // Modal Elements
  const productModal = document.getElementById('productDetailModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalProductImg');
  const modalTitle = document.getElementById('modalProductTitle');
  const modalKannada = document.getElementById('modalProductKannada');
  const modalTagline = document.getElementById('modalProductTagline');
  const modalDesc = document.getElementById('modalProductDesc');
  const modalIngredients = document.getElementById('modalProductIngredients');
  const modalPairings = document.getElementById('modalProductPairings');
  const modalSizes = document.getElementById('modalProductSizes');
  const modalSpiceMeter = document.getElementById('modalSpiceMeter');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

  // Pitch Deck Elements
  const pitchModal = document.getElementById('pitchDeckModal');
  const openPitchBtn = document.getElementById('openPitchDeckBtn');
  const heroPitchBtn = document.getElementById('heroPitchDeckBtn');
  const closePitchBtn = document.getElementById('closePitchDeckBtn');
  const prevSlideBtn = document.getElementById('prevPitchSlideBtn');
  const nextSlideBtn = document.getElementById('nextPitchSlideBtn');
  const pitchDotsContainer = document.getElementById('pitchDotsContainer');
  const slideNumEl = document.getElementById('slideNumberText');
  const slideTitleEl = document.getElementById('slideTitleText');
  const slideSubtitleEl = document.getElementById('slideSubtitleText');
  const slidePointsEl = document.getElementById('slidePointsList');
  const slideMetricValEl = document.getElementById('slideMetricVal');
  const slideMetricLabelEl = document.getElementById('slideMetricLabel');
  const fullscreenPitchBtn = document.getElementById('fullscreenPitchBtn');

  // B2B Margin Calculator Elements
  const calcQtyInput = document.getElementById('calcUnitsQty');
  const calcMrpInput = document.getElementById('calcRetailMrp');
  const calcDiscountSelect = document.getElementById('calcWholesaleDiscount');
  const calcInvestmentEl = document.getElementById('calcTotalInvestment');
  const calcRevenueEl = document.getElementById('calcTotalRevenue');
  const calcProfitEl = document.getElementById('calcEstimatedProfit');
  const calcRoiEl = document.getElementById('calcRoiPercentage');

  // WhatsApp Order Form Elements
  const orderProductSelect = document.getElementById('orderProductSelect');
  const orderTypeSelect = document.getElementById('orderBuyerType');
  const orderQtyInput = document.getElementById('orderQuantity');
  const orderNameInput = document.getElementById('orderName');
  const orderCityInput = document.getElementById('orderCity');
  const orderNotesInput = document.getElementById('orderCustomNotes');
  const sendWhatsAppBtn = document.getElementById('sendWhatsAppOrderBtn');

  // Theme Toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  // --- INITIALIZE THEME ---
  const savedTheme = localStorage.getItem('ajjiruchi_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('ajjiruchi_theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = theme === 'dark' 
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  // Mobile Nav Toggle
  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  // --- POPULATE PRODUCT DROPDOWN IN INQUIRY FORM ---
  if (orderProductSelect && typeof PRODUCTS_DATA !== 'undefined') {
    PRODUCTS_DATA.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = `${p.name} (${p.categoryLabel})`;
      orderProductSelect.appendChild(opt);
    });

    // Add OPPER products as well
    if (typeof ALLIED_BRANDS_DATA !== 'undefined' && ALLIED_BRANDS_DATA.opper) {
      ALLIED_BRANDS_DATA.opper.products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = `OPPER: ${p.name}`;
        opt.textContent = `OPPER Skincare: ${p.name}`;
        orderProductSelect.appendChild(opt);
      });
    }
  }

  // --- RENDER PRODUCTS GRID ---
  function renderProducts() {
    if (!productsGrid || typeof PRODUCTS_DATA === 'undefined') return;

    const filtered = PRODUCTS_DATA.filter(prod => {
      // Category filter
      let matchesCat = true;
      if (currentCategory === 'bestsellers') {
        matchesCat = prod.isBestseller || prod.isFlagship;
      } else if (currentCategory !== 'all') {
        matchesCat = prod.category === currentCategory;
      }

      // Search filter
      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const inName = prod.name.toLowerCase().includes(q);
        const inKannada = prod.kannadaName && prod.kannadaName.toLowerCase().includes(q);
        const inDesc = prod.description.toLowerCase().includes(q);
        const inIngredients = prod.ingredients && prod.ingredients.some(i => i.toLowerCase().includes(q));
        matchesSearch = inName || inKannada || inDesc || inIngredients;
      }

      return matchesCat && matchesSearch;
    });

    if (catalogCount) {
      catalogCount.textContent = `Showing ${filtered.length} of ${PRODUCTS_DATA.length} Products`;
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
          <p style="font-size: 1.25rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">No products found matching "${searchQuery}"</p>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">Try searching for sambar, millet, vangi bath, biriyani or select another category filter.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(prod => {
      // Build spice dots
      let spiceDots = '';
      for (let i = 1; i <= 5; i++) {
        spiceDots += `<span class="spice-dot ${i <= prod.spiceLevel ? 'active' : ''}"></span>`;
      }

      const chipsHtml = prod.dietary.slice(0, 3).map(d => `<span class="card-chip">${d}</span>`).join('');

      return `
        <article class="product-card" data-product-id="${prod.id}">
          <div class="product-card-media">
            <span class="card-category-tag">${prod.categoryLabel}</span>
            <div class="card-spice-meter" title="Spice level: ${prod.spiceLevel}/5">${spiceDots}</div>
            <img src="${prod.image}" alt="${prod.name}" loading="lazy" width="220" height="200" onerror="this.src='assets/branding/hero_spices.jpg'">
          </div>
          <div class="product-card-body">
            <div class="card-kannada">${prod.kannadaName || ''}</div>
            <h3 class="card-title">${prod.name}</h3>
            <div class="card-tagline">${prod.tagline}</div>
            <p class="card-desc">${prod.description}</p>
            <div class="card-chips">${chipsHtml}</div>
            <div class="product-card-footer">
              <button type="button" class="btn-card-details" data-open-id="${prod.id}">
                Explore Specs
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button type="button" class="btn-card-inquire" data-quick-order="${prod.name}">
                Inquire
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click handlers
    document.querySelectorAll('.btn-card-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pid = e.currentTarget.getAttribute('data-open-id');
        openProductModal(pid);
      });
    });

    document.querySelectorAll('.btn-card-inquire').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pName = e.currentTarget.getAttribute('data-quick-order');
        if (orderProductSelect) {
          orderProductSelect.value = pName;
          const orderSec = document.getElementById('orderSection');
          if (orderSec) {
            orderSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // Filter tab interactions
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category');
      renderProducts();
    });
  });

  // Search input interaction
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // --- PRODUCT MODAL LOGIC ---
  function openProductModal(productId) {
    const prod = PRODUCTS_DATA.find(p => p.id === productId);
    if (!prod || !productModal) return;

    modalImg.src = prod.image;
    modalImg.alt = prod.name;
    modalTitle.textContent = prod.name;
    modalKannada.textContent = prod.kannadaName || '';
    modalTagline.textContent = prod.tagline;
    modalDesc.textContent = prod.description;
    modalIngredients.textContent = prod.ingredients.join(', ');
    modalPairings.textContent = prod.bestPairedWith;

    modalSizes.innerHTML = prod.packSizes.map(s => `<span class="size-pill">${s}</span>`).join('');

    let spiceDots = '';
    for (let i = 1; i <= 5; i++) {
      spiceDots += `<span class="spice-dot ${i <= prod.spiceLevel ? 'active' : ''}"></span>`;
    }
    modalSpiceMeter.innerHTML = spiceDots;

    modalWhatsAppBtn.onclick = () => {
      const msg = encodeURIComponent(`Hello Ajji Ruchi Team! I am interested in inquiring about ${prod.name} (${prod.packSizes.join(', ')}). Could you please share the pricing, availability, and ordering details?`);
      window.open(`https://wa.me/917338644404?text=${msg}`, '_blank');
    };

    productModal.showModal();
  }

  if (modalCloseBtn && productModal) {
    modalCloseBtn.addEventListener('click', () => productModal.close());
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) productModal.close();
    });
  }

  // --- PITCH DECK / BOARDROOM PRESENTATION MODE ---
  function renderPitchSlide(idx) {
    if (typeof PITCH_DECK_SLIDES === 'undefined') return;
    const slides = PITCH_DECK_SLIDES;
    if (idx < 0) idx = 0;
    if (idx >= slides.length) idx = slides.length - 1;
    currentPitchSlide = idx;

    const s = slides[currentPitchSlide];
    slideNumEl.textContent = `Slide ${s.slideNumber} of ${slides.length} — Boardroom Executive Deck`;
    slideTitleEl.textContent = s.title;
    slideSubtitleEl.textContent = s.subtitle;

    slidePointsEl.innerHTML = s.points.map(pt => `
      <li class="slide-point-item">
        <span class="slide-point-bullet"></span>
        <span>${pt}</span>
      </li>
    `).join('');

    slideMetricValEl.textContent = s.metric;
    slideMetricLabelEl.textContent = s.metricLabel;

    // Update dots
    if (pitchDotsContainer) {
      pitchDotsContainer.innerHTML = slides.map((_, i) => `
        <span class="pitch-dot ${i === currentPitchSlide ? 'active' : ''}" data-slide-idx="${i}"></span>
      `).join('');

      pitchDotsContainer.querySelectorAll('.pitch-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          const sIdx = parseInt(e.target.getAttribute('data-slide-idx'), 10);
          renderPitchSlide(sIdx);
        });
      });
    }

    // Toggle button state
    if (prevSlideBtn) prevSlideBtn.disabled = (currentPitchSlide === 0);
    if (nextSlideBtn) nextSlideBtn.disabled = (currentPitchSlide === slides.length - 1);
  }

  function openPitchModal() {
    if (!pitchModal) return;
    pitchModal.classList.add('active');
    renderPitchSlide(0);
    document.body.style.overflow = 'hidden';
  }

  function closePitchModal() {
    if (!pitchModal) return;
    pitchModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openPitchBtn) openPitchBtn.addEventListener('click', openPitchModal);
  if (heroPitchBtn) heroPitchBtn.addEventListener('click', openPitchModal);
  if (closePitchBtn) closePitchBtn.addEventListener('click', closePitchModal);

  if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => renderPitchSlide(currentPitchSlide - 1));
  if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => renderPitchSlide(currentPitchSlide + 1));

  // Keyboard navigation for presentation mode
  window.addEventListener('keydown', (e) => {
    if (!pitchModal || !pitchModal.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      renderPitchSlide(currentPitchSlide + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      renderPitchSlide(currentPitchSlide - 1);
    } else if (e.key === 'Escape') {
      closePitchModal();
    }
  });

  // Fullscreen button
  if (fullscreenPitchBtn) {
    fullscreenPitchBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        pitchModal.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
    });
  }

  // --- B2B MARGIN & REVENUE CALCULATOR ---
  function updateMarginCalculator() {
    if (!calcQtyInput || !calcMrpInput || !calcDiscountSelect) return;
    const units = parseInt(calcQtyInput.value, 10) || 500;
    const mrp = parseFloat(calcMrpInput.value) || 95;
    const discountPercent = parseFloat(calcDiscountSelect.value) || 35;

    const wholesalePricePerUnit = mrp * (1 - discountPercent / 100);
    const totalInvestment = units * wholesalePricePerUnit;
    const totalRevenue = units * mrp;
    const totalProfit = totalRevenue - totalInvestment;
    const roi = ((totalProfit / totalInvestment) * 100).toFixed(1);

    if (calcInvestmentEl) calcInvestmentEl.textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
    if (calcRevenueEl) calcRevenueEl.textContent = `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`;
    if (calcProfitEl) calcProfitEl.textContent = `₹${Math.round(totalProfit).toLocaleString('en-IN')}`;
    if (calcRoiEl) calcRoiEl.textContent = `${roi}% ROI`;
  }

  if (calcQtyInput) calcQtyInput.addEventListener('input', updateMarginCalculator);
  if (calcMrpInput) calcMrpInput.addEventListener('input', updateMarginCalculator);
  if (calcDiscountSelect) calcDiscountSelect.addEventListener('change', updateMarginCalculator);
  updateMarginCalculator();

  // --- WHATSAPP ORDER / SAMPLE INQUIRY BUILDER ---
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', () => {
      const product = orderProductSelect ? orderProductSelect.value : 'Special Sambar Powder';
      const buyerType = orderTypeSelect ? orderTypeSelect.value : 'Household / Direct Consumer';
      const qty = orderQtyInput ? orderQtyInput.value : '5 packs';
      const name = orderNameInput ? orderNameInput.value.trim() : '';
      const city = orderCityInput ? orderCityInput.value.trim() : '';
      const notes = orderNotesInput ? orderNotesInput.value.trim() : '';

      if (!name) {
        alert('Please enter your Name or Business Name');
        if (orderNameInput) orderNameInput.focus();
        return;
      }

      const msg = 
`*New Inquiry - Ajji Ruchi & Allied Brands*
----------------------------------------
*Name / Business:* ${name}
*City / Location:* ${city || 'Not specified'}
*Buyer Type:* ${buyerType}
*Interested Product:* ${product}
*Quantity / Requirement:* ${qty}
*Special Requirements / Notes:* ${notes || 'Interested in sample packs and pricing.'}
----------------------------------------
_Inquiry sent via Ajji Ruchi Official Portfolio Portal_`;

      const targetUrl = `https://wa.me/917338644404?text=${encodeURIComponent(msg)}`;
      window.open(targetUrl, '_blank');
    });
  }

  // --- RENDER INITIAL PRODUCTS ---
  renderProducts();
});
