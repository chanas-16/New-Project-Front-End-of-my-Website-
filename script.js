/*
 * Anas Ahmad Fabrics — Frontend Script
 *
 * NOTE: This project includes a Flask backend (app.py).
 * API endpoints (/api/auth/*, /api/inquiries) only work when app.py is running locally.
 * On static hosting (GitHub Pages, file://) these calls will fail gracefully
 * and fall back to a demo-mode message — no silent errors.
 */
document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav ul');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mainNav.style.display === 'flex') {
                mainNav.style.display = 'none';
            } else {
                mainNav.style.display = 'flex';
            }
        });

        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 992 && mainNav.style.display === 'flex') {
                if (!mainNav.contains(e.target) && e.target !== mobileMenuBtn) {
                    mainNav.style.display = 'none';
                }
            }
        });
    }
    
    // --- Highlight Active Page in Navigation Menu ---
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === pageName || (pageName === 'index.html' && linkHref === '#') || (pageName === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- B2B Inquiry Cart Drawer State Management ---
    let cart = JSON.parse(localStorage.getItem('anas_fabrics_cart')) || [];
    
    const cartCountBadge = document.querySelector('.cart-count');
    const cartDrawer = document.getElementById('cart-drawer');
    const drawerOverlay = document.getElementById('cart-drawer-overlay');
    const cartBody = document.querySelector('.cart-drawer-body');
    const cartSubtotalEl = document.getElementById('cart-subtotal-val');
    const closeDrawerBtn = document.getElementById('close-drawer');
    const cartIconLink = document.querySelector('.cart-icon-wrapper a');

    // Open & Close Drawer functions
    function openDrawer() {
        if (cartDrawer && drawerOverlay) {
            cartDrawer.classList.add('open');
            drawerOverlay.classList.add('open');
        }
    }

    function closeDrawer() {
        if (cartDrawer && drawerOverlay) {
            cartDrawer.classList.remove('open');
            drawerOverlay.classList.remove('open');
        }
    }

    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeDrawer);
    }
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeDrawer);
    }
    if (cartIconLink) {
        cartIconLink.addEventListener('click', function(e) {
            e.preventDefault();
            openDrawer();
        });
    }

    // Update Cart Badge & Store in LocalStorage
    function updateCartUI() {
        if (cartCountBadge) {
            cartCountBadge.textContent = cart.reduce((total, item) => total + 1, 0);
        }
        localStorage.setItem('anas_fabrics_cart', JSON.stringify(cart));
        renderCartItems();
    }

    // Add Item to Cart
    function addToInquiryCart(id, name, price, moq, image, category) {
        const existingItemIndex = cart.findIndex(item => item.id === id);
        
        if (existingItemIndex > -1) {
            // Already in cart, do nothing or open drawer
        } else {
            // Add as new item, quantity initialized to MOQ
            cart.push({
                id: id,
                name: name,
                price: parseFloat(price),
                moq: parseInt(moq),
                qty: parseInt(moq),
                image: image,
                category: category
            });
        }
        updateCartUI();
        openDrawer();
    }

    // Render Cart Items List
    function renderCartItems() {
        if (!cartBody) return;
        
        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty-msg">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your Inquiry list is empty.</p>
                    <p style="font-size: 0.8rem; margin-top: 8px;">Add fabrics from our Catalog to build a bulk quote request.</p>
                </div>
            `;
            if (cartSubtotalEl) cartSubtotalEl.textContent = "$0.00";
            return;
        }

        let cartHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemCost = item.price * item.qty;
            subtotal += itemCost;

            cartHTML += `
                <div class="cart-item-row" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="category">${item.category}</p>
                        <div class="cart-item-qty-row">
                            <div class="cart-item-qty-input-wrapper">
                                <button class="cart-item-qty-btn decrease-qty" data-index="${index}"><i class="fas fa-minus"></i></button>
                                <input type="text" class="cart-item-qty-val" value="${item.qty}" data-index="${index}" readonly>
                                <button class="cart-item-qty-btn increase-qty" data-index="${index}"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                    <div class="cart-item-price-col">
                        <button class="remove-cart-item-btn" data-index="${index}"><i class="fas fa-trash-alt"></i> Remove</button>
                        <span class="cart-item-price">$${itemCost.toFixed(2)}</span>
                    </div>
                </div>
            `;
        });

        cartBody.innerHTML = cartHTML;
        if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;

        // Attach listeners to items controls
        attachItemEventListeners();
    }

    function attachItemEventListeners() {
        // Decrease quantity (cannot go below MOQ)
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                const item = cart[idx];
                if (item.qty > item.moq) {
                    item.qty -= 10; // Decrease in increments of 10 yards
                    if (item.qty < item.moq) item.qty = item.moq;
                    updateCartUI();
                } else {
                    alert(`Wholesale Minimum Order Quantity (MOQ) for ${item.name} is ${item.moq} yards.`);
                }
            });
        });

        // Increase quantity
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                cart[idx].qty += 10; // Increase in increments of 10 yards
                updateCartUI();
            });
        });

        // Remove item
        document.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    }

    // Attach Sourcing "Add to Cart" hooks via Event Delegation (handles dynamic product rendering)
    const productGridContainer = document.querySelector('.product-grid');
    if (productGridContainer) {
        productGridContainer.addEventListener('click', function(e) {
            const button = e.target.closest('.product-card button, .product-card .btn');
            if (!button) return;
            
            // Avoid conflict with Quick View triggers
            if (button.classList.contains('quickview-trigger')) return;

            e.preventDefault();
            const card = button.closest('.product-card');
            if (!card) return;

            const name = card.querySelector('h3').textContent;
            const priceText = card.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace('$', '').replace('/ yd', '').trim());
            const image = card.querySelector('img').src;
            const category = card.getAttribute('data-category') || 'fabric';
            
            // Extract MOQ from wholesale-price text
            const wholesaleText = card.querySelector('.wholesale-price').textContent;
            const moqMatch = wholesaleText.match(/MOQ:\s*(\d+)/i) || wholesaleText.match(/(\d+)\+\s*yds/i);
            const moq = moqMatch ? parseInt(moqMatch[1]) : 50;

            const id = name.toLowerCase().replace(/\s+/g, '-');

            addToInquiryCart(id, name, price, moq, image, category);
        });
    }

    // Checkout / Sourcing submission
    const submitInquiryBtn = document.getElementById('submit-inquiry-list');
    if (submitInquiryBtn) {
        submitInquiryBtn.addEventListener('click', function() {
            if (cart.length === 0) return;
            
            // Format inquiry list for contact form or WhatsApp
            let inquiryDetails = "Inquiry Sourcing List:\n";
            cart.forEach(item => {
                inquiryDetails += `- ${item.name} (${item.qty} yards)\n`;
            });

            // Redirect to contact page and fill details or directly open WhatsApp
            const confirmChoice = confirm("Would you like to send this sourcing list directly to our team via WhatsApp for an immediate quote?");
            if (confirmChoice) {
                const whatsappMessage = `Assalam-o-Alaikum! I want to request a wholesale quote for:\n${inquiryDetails}`;
                window.open(`https://wa.me/923224269499?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
                cart = [];
                updateCartUI();
                closeDrawer();
            } else {
                // Store in sessionStorage to populate on Contact page form
                sessionStorage.setItem('anas_inquiry_text', inquiryDetails);
                window.location.href = 'contact.html';
            }
        });
    }

    // Prefill Contact Form if query/session data exists
    const contactMsgInput = document.getElementById('biz-msg');
    if (contactMsgInput) {
        const storedInquiry = sessionStorage.getItem('anas_inquiry_text');
        if (storedInquiry) {
            contactMsgInput.value = `Assalam-o-Alaikum! We are interested in obtaining a price quotation for the following bulk items:\n\n${storedInquiry}\nPlease confirm delivery options and bulk discount rates.`;
            sessionStorage.removeItem('anas_inquiry_text'); // Clear
        }
    }

    // Initialize Cart rendering on page load
    updateCartUI();


    // --- Real-time Catalog Search (for products.html) ---
    const searchInput = document.getElementById('catalog-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const productGrid = document.querySelector('.product-grid');
    const catalogCards = document.querySelectorAll('.product-grid .product-card');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length > 0) {
                if (clearSearchBtn) clearSearchBtn.style.display = 'block';
            } else {
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            }

            filterProducts(query);
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            this.style.display = 'none';
            filterProducts('');
        });
    }

    function filterProducts(query) {
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

        let visibleCount = 0;

        catalogCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const categoryAttr = card.getAttribute('data-category') || '';
            const meta = card.querySelector('.product-meta').textContent.toLowerCase();
            
            const matchesQuery = title.includes(query) || meta.includes(query) || categoryAttr.includes(query);
            const matchesCategory = activeCategory === 'all' || categoryAttr === activeCategory;

            if (matchesQuery && matchesCategory) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Toggle "No Products Found" message
        const existingNoMatch = document.getElementById('no-match-msg');
        if (visibleCount === 0) {
            if (!existingNoMatch && productGrid) {
                const noMatchDiv = document.createElement('div');
                noMatchDiv.id = 'no-match-msg';
                noMatchDiv.style.gridColumn = '1 / -1';
                noMatchDiv.style.textAlign = 'center';
                noMatchDiv.style.padding = '40px 20px';
                noMatchDiv.style.color = 'var(--text-light)';
                noMatchDiv.innerHTML = `
                    <i class="fas fa-search-minus" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--border-focus);"></i>
                    <p>No fabrics match your search term.</p>
                `;
                productGrid.appendChild(noMatchDiv);
            }
        } else {
            if (existingNoMatch) {
                existingNoMatch.remove();
            }
        }
    }

    // Sync search with category filter tabs
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0 && catalogCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
                filterProducts(searchQuery);
            });
        });
    }


    // --- Fabric Quantity Estimator Calculator ---
    const calcProjType = document.getElementById('calc-project-type');
    const calcQty = document.getElementById('calc-item-qty');
    const calcWidth = document.getElementById('calc-fabric-width');
    const calcResultVal = document.getElementById('calc-result-yards');

    if (calcProjType && calcQty && calcWidth && calcResultVal) {
        const yardages = {
            dress: 2.5,
            suit: 4.5,
            cushion: 0.75,
            curtain: 3.5
        };

        const widthFactors = {
            '36': 1.25, // Narrower requires more yards
            '44': 1.0,  // Standard
            '60': 0.8   // Wider requires fewer yards
        };

        function calculateEstimates() {
            const project = calcProjType.value;
            const items = parseInt(calcQty.value) || 0;
            const fabricWidth = calcWidth.value;

            if (items <= 0) {
                calcResultVal.textContent = "0 yds";
                return;
            }

            const baseYardage = yardages[project] || 2.0;
            const factor = widthFactors[fabricWidth] || 1.0;

            const totalYards = items * baseYardage * factor;
            
            // Round to nearest whole yard
            calcResultVal.textContent = `${Math.ceil(totalYards)} yds`;
        }

        calcProjType.addEventListener('change', calculateEstimates);
        calcQty.addEventListener('input', calculateEstimates);
        calcWidth.addEventListener('change', calculateEstimates);
        
        // Run initial calculation
        calculateEstimates();
    }


    // --- FAQ Accordion Toggle ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const item = this.parentElement;
            
            item.classList.toggle('active');
            
            const allItems = document.querySelectorAll('.faq-item');
            allItems.forEach(i => {
                if (i !== item) {
                    i.classList.remove('active');
                }
            });
        });
    });

    // --- Floating WhatsApp Widget Click Simulation ---
    const whatsappWidget = document.querySelector('.whatsapp-widget');
    if (whatsappWidget) {
        whatsappWidget.addEventListener('click', function() {
            window.open("https://wa.me/923224269499?text=Assalam-o-Alaikum,%20I%20am%20interested%20in%20wholesale%20fabrics.", "_blank");
        });
    }

    // Handle Resize to clean up mobile styles
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && mainNav) {
            mainNav.style.display = '';
        }
    });

    // ==========================================
    // --- PRODUCTION READY & UX ENHANCEMENTS ---
    // ==========================================

    const productDetailsDb = {
        'premium-cotton-fabric': {
            desc: "Our Egyptian cotton is renowned for its extra-long staple fibers, creating an incredibly soft yet durable weave. Sourced directly from certified growers, it undergoes double combed processing to ensure uniform thread consistency and pristine finish.",
            gsm: "140 GSM",
            width: "44 inches",
            origin: "Egypt (Nile Delta)"
        },
        'luxury-silk-fabric': {
            desc: "Woven from 100% pure Mulberry silk fibers, this fabric offers an exquisite natural sheen and unparalleled drape. Crucial for high-fashion evening wear, bridal couture, and custom luxury linings.",
            gsm: "80 GSM (19 Momme)",
            width: "44 inches",
            origin: "China (Mulberry Valley)"
        },
        'heavy-linen-fabric': {
            desc: "Crafted from organically grown Irish flax, this premium linen features a rich, characteristic texture and exceptional thermal regulation. Ideal for lightweight summer suiting and home drapery.",
            gsm: "210 GSM",
            width: "58 inches",
            origin: "Ireland (Belfast)"
        },
        'soft-wool-fabric': {
            desc: "Sourced from pure Australian Merino virgin wool. This heavy weave provides exceptional warmth, breathability, and wrinkle resistance, making it the perfect selection for bespoke winter overcoats.",
            gsm: "380 GSM",
            width: "60 inches",
            origin: "Australia (Victoria)"
        },
        'organic-slub-cotton': {
            desc: "100% GOTS certified organic slub cotton. The irregular slub yarns create a beautiful textured depth that feels comfortable against the skin. Great for designer shirts and casual apparel lines.",
            gsm: "160 GSM",
            width: "44 inches",
            origin: "Pakistan (Multan)"
        },
        'royal-velvet-fabric': {
            desc: "A plush, double-pile heavy velvet that offers a deep, rich color profile and smooth tactile feedback. Perfect for luxury winter collections, statement blazers, and high-end upholstery projects.",
            gsm: "320 GSM",
            width: "55 inches",
            origin: "Turkey (Bursa)"
        },
        'golden-brocade-fabric': {
            desc: "Exquisite Zari relief weaving with metallic gold thread patterns. A heavy, structured jacquard designed for bridal sherwanis, formal jackets, and high-end wedding wear collections.",
            gsm: "240 GSM",
            width: "48 inches",
            origin: "India (Banaras)"
        },
        'satin-silk-chiffon': {
            desc: "A featherlight satin-faced silk chiffon offering a subtle luster and delicate translucency. Highly breathable and flowing, ideal for scarves, bridal overlays, and layered boutique dresses.",
            gsm: "60 GSM (16 Momme)",
            width: "44 inches",
            origin: "South Korea (Seoul)"
        }
    };

    // --- Skip to Content link behavior ---
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // --- Breadcrumbs Logic ---
    const breadcrumbsContainer = document.querySelector('.breadcrumbs');
    if (breadcrumbsContainer) {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        
        let breadcrumbsHTML = '<ul><li><a href="index.html">Home</a></li>';
        
        if (page === 'products.html') {
            breadcrumbsHTML += '<li class="current">Products</li>';
        } else if (page === 'categories.html') {
            breadcrumbsHTML += '<li class="current">Categories</li>';
        } else if (page === 'about.html') {
            breadcrumbsHTML += '<li class="current">About Us</li>';
        } else if (page === 'contact.html') {
            breadcrumbsHTML += '<li class="current">Contact</li>';
        }
        
        breadcrumbsHTML += '</ul>';
        breadcrumbsContainer.innerHTML = `<div class="container">${breadcrumbsHTML}</div>`;
    }

    // --- Sticky Mobile Cart Update ---
    function updateStickyMobileCart() {
        let stickyCart = document.getElementById('sticky-mobile-cart');
        if (!stickyCart) {
            stickyCart = document.createElement('div');
            stickyCart.id = 'sticky-mobile-cart';
            stickyCart.className = 'sticky-mobile-cart';
            stickyCart.innerHTML = `
                <div class="sticky-mobile-cart-info">
                    <i class="fas fa-shopping-cart"></i>
                    <div>
                        <span class="qty">0</span> items in Inquiry
                    </div>
                </div>
                <div>
                    <span class="sticky-mobile-cart-total">$0.00</span>
                    <button class="btn btn-accent" id="open-sticky-drawer">View list</button>
                </div>
            `;
            document.body.appendChild(stickyCart);
            
            document.getElementById('open-sticky-drawer').addEventListener('click', function() {
                openDrawer();
            });
        }
        
        const count = cart.length;
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        stickyCart.querySelector('.qty').textContent = count;
        stickyCart.querySelector('.sticky-mobile-cart-total').textContent = `$${subtotal.toFixed(2)}`;
        
        if (count > 0) {
            stickyCart.classList.add('visible');
        } else {
            stickyCart.classList.remove('visible');
        }
    }

    // Inject cart update callback hook
    const originalUpdateCartUI = updateCartUI;
    updateCartUI = function() {
        originalUpdateCartUI();
        updateStickyMobileCart();
    };
    updateStickyMobileCart(); // Initial load check

    // --- URL Search Params Router & Search Sync ---
    const urlParams = new URLSearchParams(window.location.search);
    
    // Category router
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        const filterBtn = document.querySelector(`.filter-btn[data-filter="${categoryParam}"]`);
        if (filterBtn) {
            // Remove active classes
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            filterBtn.classList.add('active');
            
            // Mock a loading skeleton before showing products
            const pGrid = document.querySelector('.product-grid');
            if (pGrid) {
                const originalHTML = pGrid.innerHTML;
                let skeletonsHTML = '';
                for (let i = 0; i < 4; i++) {
                    skeletonsHTML += `
                        <div class="product-card skeleton-card">
                            <div class="skeleton skeleton-img"></div>
                            <div class="product-info">
                                <div class="skeleton skeleton-title"></div>
                                <div class="skeleton skeleton-text"></div>
                                <div class="skeleton skeleton-text short"></div>
                                <div class="skeleton skeleton-btn"></div>
                            </div>
                        </div>
                    `;
                }
                pGrid.innerHTML = skeletonsHTML;
                
                setTimeout(() => {
                    pGrid.innerHTML = originalHTML;
                    // Re-trigger cards injections & filter
                    injectCardButtons();
                    filterProducts('');
                    
                    // Smooth scroll to catalog
                    const catalogSection = document.querySelector('.featured-products');
                    if (catalogSection) {
                        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 400);
            }
        }
    }

    // Search focus router
    const focusParam = urlParams.get('focus');
    if (focusParam === 'search') {
        const searchBar = document.getElementById('catalog-search');
        if (searchBar) {
            setTimeout(() => {
                searchBar.focus();
                searchBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Apply flash animation highlight
                searchBar.style.borderColor = 'var(--accent)';
                searchBar.style.boxShadow = '0 0 0 5px rgba(180, 83, 9, 0.25)';
                setTimeout(() => {
                    searchBar.style.borderColor = '';
                    searchBar.style.boxShadow = '';
                }, 1500);
            }, 300);
        }
    }

    // Header search icon click handler
    const headerSearchLink = document.querySelector('.main-nav a i.fa-search')?.closest('a');
    if (headerSearchLink) {
        headerSearchLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.location.pathname.includes('products.html')) {
                const searchBar = document.getElementById('catalog-search');
                if (searchBar) {
                    searchBar.focus();
                    searchBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                window.location.href = 'products.html?focus=search';
            }
        });
    }

    // Tab filter load animation mock
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const pGrid = document.querySelector('.product-grid');
            if (pGrid && !categoryParam) { // Only animate if not first URL load
                const originalCardsDisplay = Array.from(pGrid.children).map(c => ({el: c, display: c.style.display}));
                
                // Show skeleton layouts briefly
                const originalHTML = pGrid.innerHTML;
                let skeletonsHTML = '';
                for (let i = 0; i < 4; i++) {
                    skeletonsHTML += `
                        <div class="product-card skeleton-card">
                            <div class="skeleton skeleton-img"></div>
                            <div class="product-info">
                                <div class="skeleton skeleton-title"></div>
                                <div class="skeleton skeleton-text"></div>
                                <div class="skeleton skeleton-text short"></div>
                                <div class="skeleton skeleton-btn"></div>
                            </div>
                        </div>
                    `;
                }
                pGrid.innerHTML = skeletonsHTML;
                
                setTimeout(() => {
                    pGrid.innerHTML = originalHTML;
                    injectCardButtons();
                    
                    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
                    filterProducts(query);
                }, 400);
            }
        });
    });


    // --- Accessible B2B Wholesale Authentication Modal ---
    let authModalOverlay = document.getElementById('auth-modal-overlay');
    if (!authModalOverlay) {
        authModalOverlay = document.createElement('div');
        authModalOverlay.id = 'auth-modal-overlay';
        authModalOverlay.className = 'auth-modal-overlay';
        authModalOverlay.setAttribute('role', 'dialog');
        authModalOverlay.setAttribute('aria-modal', 'true');
        authModalOverlay.setAttribute('aria-labelledby', 'auth-modal-title');
        authModalOverlay.innerHTML = `
            <div class="auth-modal" id="auth-modal">
                <div class="auth-modal-header">
                    <div class="auth-tabs" role="tablist">
                        <button class="auth-tab-btn active" id="tab-login" role="tab" aria-selected="true" aria-controls="panel-login">Sign In</button>
                        <button class="auth-tab-btn" id="tab-register" role="tab" aria-selected="false" aria-controls="panel-register">Register B2B</button>
                    </div>
                    <button class="close-auth-btn" id="close-auth-modal" aria-label="Close authentication modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="auth-modal-body">
                    <!-- Login Panel -->
                    <div class="auth-panel active" id="panel-login" role="tabpanel" aria-labelledby="tab-login">
                        <form id="b2b-login-form">
                            <div class="form-group">
                                <label for="login-email">Business Email</label>
                                <input type="email" id="login-email" required placeholder="name@yourcompany.com">
                                <span class="form-error-msg">Please enter a valid business email.</span>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Password</label>
                                <div class="password-input-wrapper">
                                    <input type="password" id="login-password" required placeholder="Enter password">
                                    <button type="button" class="password-toggle-btn" aria-label="Toggle password visibility"><i class="far fa-eye"></i></button>
                                </div>
                                <span class="form-error-msg">Incorrect password.</span>
                            </div>
                            <button type="submit" class="btn btn-accent" style="width: 100%;">Sign In to B2B Account</button>
                        </form>
                    </div>
                    
                    <!-- Register Panel -->
                    <div class="auth-panel" id="panel-register" role="tabpanel" aria-labelledby="tab-register">
                        <form id="b2b-register-form">
                            <div class="form-group">
                                <label for="reg-company">Company / Brand Name</label>
                                <input type="text" id="reg-company" required placeholder="E.g., Premium Boutique Ltd">
                            </div>
                            <div class="form-group">
                                <label for="reg-email">Business Email</label>
                                <input type="email" id="reg-email" required placeholder="sourcing@yourcompany.com">
                            </div>
                            <div class="form-group">
                                <label for="reg-password">Create Password</label>
                                <div class="password-input-wrapper">
                                    <input type="password" id="reg-password" required placeholder="Min 6 characters">
                                    <button type="button" class="password-toggle-btn" aria-label="Toggle password visibility"><i class="far fa-eye"></i></button>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-accent" style="width: 100%;">Create Wholesale Account</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(authModalOverlay);
    }

    const authModal = document.getElementById('auth-modal');
    const userIconLink = document.querySelector('.main-nav a i.fa-user')?.closest('a');
    let activeFocusElement = null;

    // Focus Trap Helper
    function trapFocus(modalEl, e) {
        const focusables = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    }

    function openAuthModal() {
        activeFocusElement = document.activeElement;
        authModalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = authModal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);

        // Escape Key close listener
        document.addEventListener('keydown', handleAuthEsc);
        authModalOverlay.addEventListener('keydown', handleAuthTab);
    }

    function closeAuthModal() {
        authModalOverlay.classList.remove('open');
        document.body.style.overflow = '';
        
        document.removeEventListener('keydown', handleAuthEsc);
        authModalOverlay.removeEventListener('keydown', handleAuthTab);
        
        if (activeFocusElement) {
            activeFocusElement.focus();
        }
    }

    function handleAuthEsc(e) {
        if (e.key === 'Escape') {
            closeAuthModal();
        }
    }

    function handleAuthTab(e) {
        trapFocus(authModal, e);
    }

    if (userIconLink) {
        userIconLink.addEventListener('click', function(e) {
            e.preventDefault();
            const loggedUser = JSON.parse(localStorage.getItem('anas_b2b_user'));
            if (loggedUser) {
                // Already logged in, display sign out confirmation
                const confirmLog = confirm(`You are currently logged in as ${loggedUser.company}.\nWould you like to sign out?`);
                if (confirmLog) {
                    localStorage.removeItem('anas_b2b_user');
                    updateAuthUI();
                }
            } else {
                openAuthModal();
            }
        });
    }

    document.getElementById('close-auth-modal').addEventListener('click', closeAuthModal);
    authModalOverlay.addEventListener('click', function(e) {
        if (e.target === authModalOverlay) {
            closeAuthModal();
        }
    });

    // Tab switching
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const panelLogin = document.getElementById('panel-login');
    const panelRegister = document.getElementById('panel-register');

    function switchAuthTab(activeTab, activePanel, inactiveTab, inactivePanel) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        activePanel.classList.add('active');
        
        inactiveTab.classList.remove('active');
        inactiveTab.setAttribute('aria-selected', 'false');
        inactivePanel.classList.remove('active');
        
        // Focus first field in active panel
        const input = activePanel.querySelector('input');
        if (input) input.focus();
    }

    tabLogin.addEventListener('click', () => switchAuthTab(tabLogin, panelLogin, tabRegister, panelRegister));
    tabRegister.addEventListener('click', () => switchAuthTab(tabRegister, panelRegister, tabLogin, panelLogin));

    // Password visibility toggle
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="far fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="far fa-eye"></i>';
            }
        });
    });

    // Handle Forms Submit & Server Authentication Integration
    const loginForm = document.getElementById('b2b-login-form');
    const registerForm = document.getElementById('b2b-register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const company = document.getElementById('reg-company').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            if (password.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
            }

            // Try the Flask backend; fall back gracefully on static hosting
            fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, email, password })
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Registration failed') });
                }
                return res.json();
            })
            .then(data => {
                localStorage.setItem('anas_b2b_user', JSON.stringify(data.user));
                renderAuthSuccess(data.user.company);
            })
            .catch(() => {
                // Backend unavailable (static hosting / GitHub Pages)
                // Store a demo session locally so the UI still responds
                const demoUser = { company: company, email: email, tier: 'Demo Account' };
                localStorage.setItem('anas_b2b_user', JSON.stringify(demoUser));
                const modalBody = document.querySelector('#auth-modal .auth-modal-body');
                if (modalBody) {
                    modalBody.innerHTML = `
                        <div class="auth-success-state" style="text-align:center; padding: 24px 16px;">
                            <i class="fas fa-info-circle" style="font-size:2.5rem; color: var(--accent); margin-bottom:12px;"></i>
                            <h2>Demo Mode</h2>
                            <p style="margin-top:12px;">The backend (app.py) is not running. Your session has been saved locally for demo purposes.</p>
                            <p style="font-size:0.85rem; color:var(--text-light); margin-top:8px;">To enable full B2B accounts, run <strong>app.py</strong> locally.</p>
                            <button class="btn btn-accent" id="dismiss-auth-success" style="margin-top:24px; width:100%;">Continue Browsing</button>
                        </div>
                    `;
                    document.getElementById('dismiss-auth-success').addEventListener('click', function() {
                        closeAuthModal();
                        updateAuthUI();
                    });
                }
            });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Try the Flask backend; fall back gracefully on static hosting
            fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Login failed') });
                }
                return res.json();
            })
            .then(data => {
                localStorage.setItem('anas_b2b_user', JSON.stringify(data.user));
                renderAuthSuccess(data.user.company);
            })
            .catch(() => {
                // Backend unavailable — show a clear demo-mode notice instead of a silent failure
                const modalBody = document.querySelector('#auth-modal .auth-modal-body');
                if (modalBody) {
                    modalBody.innerHTML = `
                        <div style="text-align:center; padding: 24px 16px;">
                            <i class="fas fa-server" style="font-size:2.5rem; color: var(--accent); margin-bottom:12px;"></i>
                            <h2>Backend Not Running</h2>
                            <p style="margin-top:12px;">B2B account login requires the <strong>app.py</strong> Flask server to be running locally.</p>
                            <p style="font-size:0.85rem; color:var(--text-light); margin-top:8px;">This is a demo/static version. See <strong>README.md</strong> for setup instructions.</p>
                            <button class="btn btn-accent" id="dismiss-login-notice" style="margin-top:24px; width:100%;">Got It</button>
                        </div>
                    `;
                    document.getElementById('dismiss-login-notice').addEventListener('click', closeAuthModal);
                }
            });
        });
    }

    function renderAuthSuccess(companyName) {
        const modalBody = authModal.querySelector('.auth-modal-body');
        modalBody.innerHTML = `
            <div class="auth-success-state">
                <i class="fas fa-check-circle"></i>
                <h2>Welcome back!</h2>
                <p style="margin-top: 12px; font-weight: 500;">Successfully authenticated as <strong>${companyName}</strong>.</p>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 4px;">Tier pricing discounts have been applied to your catalog.</p>
                <button class="btn btn-accent" id="dismiss-auth-success" style="margin-top: 24px; width: 100%;">Continue Sourcing</button>
            </div>
        `;
        document.getElementById('dismiss-auth-success').addEventListener('click', function() {
            closeAuthModal();
            location.reload(); // Reload to refresh catalog prices
        });
        updateAuthUI();
    }

    function updateAuthUI() {
        const user = JSON.parse(localStorage.getItem('anas_b2b_user'));
        const navUl = document.querySelector('.main-nav ul');
        const userNavLi = document.querySelector('.main-nav a i.fa-user')?.closest('li');
        
        if (user && userNavLi) {
            userNavLi.innerHTML = `
                <a href="#" class="b2b-badge-nav" style="color: var(--accent); font-weight: 700; font-size: 0.85rem; border: 1px solid var(--accent); padding: 4px 10px; border-radius: var(--radius-full); background: var(--accent-light);">
                    <i class="fas fa-gem"></i> ${user.company}
                </a>
            `;
            // Attach signout trigger
            userNavLi.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
                const confirmLog = confirm(`You are currently logged in as ${user.company}.\nWould you like to sign out?`);
                if (confirmLog) {
                    localStorage.removeItem('anas_b2b_user');
                    location.reload();
                }
            });
        }
    }
    updateAuthUI();


    // --- Wholesale Inquiry Contact Form Submission Integration ---
    const contactForm = document.getElementById('wholesale-inquiry-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const bizName = document.getElementById('biz-name').value;
            const bizContact = document.getElementById('biz-contact').value;
            const bizEmail = document.getElementById('biz-email').value;
            const bizPhone = document.getElementById('biz-phone').value;
            const fabric = document.getElementById('fabric-type').value;
            const volume = document.getElementById('order-volume').value;
            const msg = document.getElementById('biz-msg').value;

            // Basic validation
            if (!bizEmail.includes('@') || bizPhone.length < 7) {
                alert('Please enter a valid email address and phone number.');
                return;
            }

            const cartItems = JSON.parse(localStorage.getItem('anas_fabrics_cart')) || [];
            const subtotalVal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

            // Helper: show success state in the form column
            function showInquirySuccess(refNumber) {
                localStorage.removeItem('anas_fabrics_cart');
                cart = [];
                if (typeof updateCartUI === 'function') updateCartUI();

                const formColumn = document.querySelector('.contact-form-column');
                if (formColumn) {
                    formColumn.style.transition = 'all 0.3s ease';
                    formColumn.style.opacity = '0';
                    setTimeout(() => {
                        formColumn.innerHTML = `
                            <div class="success-card">
                                <div class="success-card-icon"><i class="fas fa-check"></i></div>
                                <h3>Inquiry Received!</h3>
                                <p>Assalam-o-Alaikum, ${bizContact}. Thank you for getting in touch with Anas Ahmad Fabrics. We will review your request and contact you within 1–2 business hours.</p>
                                <div class="ref-number-box">REF: ${refNumber}</div>
                                <button class="btn btn-accent" id="return-catalog-btn" style="margin-top:16px; width:100%;">Back to Catalog</button>
                            </div>
                        `;
                        formColumn.style.opacity = '1';
                        document.getElementById('return-catalog-btn').addEventListener('click', () => {
                            window.location.href = 'products.html';
                        });
                    }, 300);
                }
            }

            // Try the Flask backend first; fall back gracefully on static hosting
            fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: bizName,
                    contact: bizContact,
                    email: bizEmail,
                    phone: bizPhone,
                    fabric: fabric,
                    volume: volume,
                    message: msg,
                    items: cartItems,
                    subtotal: subtotalVal
                })
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Submission failed') });
                }
                return res.json();
            })
            .then(data => {
                showInquirySuccess(data.ref);
            })
            .catch(() => {
                // Backend unavailable (static hosting) — generate a local reference
                // and offer WhatsApp as an alternative channel
                const localRef = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
                const whatsappMsg = `Assalam-o-Alaikum! Inquiry from ${bizName} (${bizContact}).\nFabric: ${fabric}\nVolume: ${volume}\nMessage: ${msg}`;
                const formColumn = document.querySelector('.contact-form-column');
                if (formColumn) {
                    formColumn.style.transition = 'all 0.3s ease';
                    formColumn.style.opacity = '0';
                    setTimeout(() => {
                        formColumn.innerHTML = `
                            <div class="success-card">
                                <div class="success-card-icon" style="background: var(--accent-light);">
                                    <i class="fas fa-info" style="color:var(--accent);"></i>
                                </div>
                                <h3>Demo Mode — Backend Not Running</h3>
                                <p>Your inquiry could not be saved to the server because <strong>app.py</strong> is not running. To submit your inquiry directly, use the WhatsApp button below.</p>
                                <a href="https://wa.me/923224269499?text=${encodeURIComponent(whatsappMsg)}" target="_blank" rel="noopener noreferrer" class="btn btn-accent" style="display:block; margin-top:16px; text-align:center; text-decoration:none;">
                                    <i class="fab fa-whatsapp"></i> Send via WhatsApp
                                </a>
                                <p style="font-size:0.8rem; color:var(--text-light); margin-top:12px;">See <strong>README.md</strong> for instructions on running the Flask backend.</p>
                            </div>
                        `;
                        formColumn.style.opacity = '1';
                    }, 300);
                }
            });
        });
    }


    // --- Recently Viewed Fabrics (LocalStorage Stack) ---
    function addRecentlyViewed(id, name, price, img) {
        let list = JSON.parse(localStorage.getItem('anas_recently_viewed')) || [];
        // Prevent duplicate items
        list = list.filter(item => item.id !== id);
        list.unshift({ id, name, price, img });
        
        // Cap stack at 4 items
        if (list.length > 4) list.pop();
        localStorage.setItem('anas_recently_viewed', JSON.stringify(list));
    }

    function renderRecentlyViewed() {
        const container = document.getElementById('recently-viewed-placeholder');
        if (!container) return;

        const list = JSON.parse(localStorage.getItem('anas_recently_viewed')) || [];
        if (list.length === 0) {
            container.closest('.recently-viewed-section').style.display = 'none';
            return;
        }

        let cardsHTML = '';
        list.forEach(item => {
            cardsHTML += `
                <div class="recently-viewed-card" data-id="${item.id}">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="recently-viewed-card-info">
                        <h4>${item.name}</h4>
                        <p>${item.price}</p>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = cardsHTML;
        
        // Attach click listeners to cards to quick view on click
        container.querySelectorAll('.recently-viewed-card').forEach(card => {
            card.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                // Find matching card in grid to trigger its quickview
                const gridCard = document.querySelector(`.product-card h3`)?.closest('.product-card');
                if (gridCard) {
                    openQuickView(gridCard);
                }
            });
        });
    }


    // --- Quick View Modal Handler ---
    let qvModalOverlay = document.getElementById('quickview-modal-overlay');
    if (!qvModalOverlay) {
        qvModalOverlay = document.createElement('div');
        qvModalOverlay.id = 'quickview-modal-overlay';
        qvModalOverlay.className = 'quickview-modal-overlay';
        qvModalOverlay.setAttribute('role', 'dialog');
        qvModalOverlay.setAttribute('aria-modal', 'true');
        qvModalOverlay.setAttribute('aria-labelledby', 'qv-title');
        qvModalOverlay.innerHTML = `
            <div class="quickview-modal" id="quickview-modal">
                <button class="quickview-close" id="close-qv-modal" aria-label="Close product quick view dialog"><i class="fas fa-times"></i></button>
                <div class="quickview-img-wrapper">
                    <img src="" id="qv-img" alt="">
                </div>
                <div class="quickview-details">
                    <span class="quickview-category" id="qv-cat">Fabric</span>
                    <h2 id="qv-title">Premium Fabric</h2>
                    <div class="rating" style="margin: 8px 0 12px;">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                        <span>(4.8)</span>
                    </div>
                    <p class="price" id="qv-price">$0.00 <span class="unit">/ yd</span></p>
                    <span class="wholesale-price" id="qv-wholesale">Wholesale: $0.00/yd</span>
                    <p class="quickview-desc" id="qv-desc">Loading details...</p>
                    <div class="quickview-specs">
                        <span>
                            <strong>Weight Density</strong>
                            <span id="qv-spec-gsm">150 GSM</span>
                        </span>
                        <span>
                            <strong>Standard Width</strong>
                            <span id="qv-spec-width">44 inches</span>
                        </span>
                        <span>
                            <strong>Thread Origin</strong>
                            <span id="qv-spec-origin">Imported</span>
                        </span>
                        <span>
                            <strong>Sourcing MOQ</strong>
                            <span id="qv-spec-moq">50 yards</span>
                        </span>
                    </div>
                    <button class="btn btn-accent" id="qv-add-cart-btn">Add to Sourcing list</button>
                </div>
            </div>
        `;
        document.body.appendChild(qvModalOverlay);
    }

    const qvModal = document.getElementById('quickview-modal');

    function openQuickView(card) {
        const title = card.querySelector('h3').textContent;
        const price = card.querySelector('.price').textContent;
        const img = card.querySelector('img').src;
        const cat = card.getAttribute('data-category') || 'Fabric weave';
        const wholesaleText = card.querySelector('.wholesale-price').textContent;
        const moqMatch = wholesaleText.match(/MOQ:\s*(\d+)/i) || wholesaleText.match(/(\d+)\+\s*yds/i);
        const moq = moqMatch ? moqMatch[1] : '50';
        const id = title.toLowerCase().replace(/\s+/g, '-');

        // Fetch description details from DB
        const details = productDetailsDb[id] || {
            desc: "Premium wholesale weave manufactured to professional quality standards. Sourced directly for high-volume commercial designers and tailoring shops.",
            gsm: "160 GSM",
            width: "44 inches",
            origin: "Pakistan"
        };

        // Populate fields
        document.getElementById('qv-title').textContent = title;
        document.getElementById('qv-cat').textContent = cat + " collection";
        document.getElementById('qv-price').innerHTML = price;
        document.getElementById('qv-wholesale').textContent = wholesaleText;
        document.getElementById('qv-img').src = img;
        document.getElementById('qv-img').alt = title;
        document.getElementById('qv-desc').textContent = details.desc;
        document.getElementById('qv-spec-gsm').textContent = details.gsm;
        document.getElementById('qv-spec-width').textContent = details.width;
        document.getElementById('qv-spec-origin').textContent = details.origin;
        document.getElementById('qv-spec-moq').textContent = `${moq} yards`;

        // Save active trigger focus
        activeFocusElement = document.activeElement;

        qvModalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Add to Cart action binder
        const addBtn = document.getElementById('qv-add-cart-btn');
        // Clear previous event listener
        const newAddBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAddBtn, addBtn);
        
        newAddBtn.addEventListener('click', function() {
            const parsedPrice = parseFloat(price.replace('$', '').replace('/ yd', '').trim());
            addToInquiryCart(id, title, parsedPrice, moq, img, cat);
            closeQuickView();
        });

        // Add to Recently Viewed local storage stack
        addRecentlyViewed(id, title, price, img);
        renderRecentlyViewed();

        document.addEventListener('keydown', handleQvEsc);
        qvModalOverlay.addEventListener('keydown', handleQvTab);
    }

    function closeQuickView() {
        qvModalOverlay.classList.remove('open');
        document.body.style.overflow = '';
        
        document.removeEventListener('keydown', handleQvEsc);
        qvModalOverlay.removeEventListener('keydown', handleQvTab);
        
        if (activeFocusElement) activeFocusElement.focus();
    }

    function handleQvEsc(e) {
        if (e.key === 'Escape') closeQuickView();
    }

    function handleQvTab(e) {
        trapFocus(qvModal, e);
    }

    document.getElementById('close-qv-modal').addEventListener('click', closeQuickView);
    qvModalOverlay.addEventListener('click', function(e) {
        if (e.target === qvModalOverlay) {
            closeQuickView();
        }
    });


    // --- Product Comparison Tool Drawer & Modal Renders ---
    let compareList = [];

    function injectCardButtons() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const imgWrapper = card.querySelector('.product-img-wrapper');
            const infoWrapper = card.querySelector('.product-info');
            
            if (imgWrapper && !imgWrapper.querySelector('.quickview-trigger')) {
                const qvBtn = document.createElement('button');
                qvBtn.className = 'quickview-trigger';
                qvBtn.innerHTML = '<i class="fas fa-eye"></i> Quick View';
                qvBtn.setAttribute('aria-label', `Quick view details for ${card.querySelector('h3').textContent}`);
                
                // Style inline overlay
                qvBtn.style.position = 'absolute';
                qvBtn.style.bottom = '12px';
                qvBtn.style.left = '50%';
                qvBtn.style.transform = 'translateX(-50%) translateY(10px)';
                qvBtn.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                qvBtn.style.color = '#ffffff';
                qvBtn.style.border = 'none';
                qvBtn.style.padding = '8px 16px';
                qvBtn.style.fontSize = '0.8rem';
                qvBtn.style.fontWeight = '600';
                qvBtn.style.borderRadius = 'var(--radius-full)';
                qvBtn.style.cursor = 'pointer';
                qvBtn.style.opacity = '0';
                qvBtn.style.transition = 'all 0.3s ease';
                qvBtn.style.zIndex = '5';
                
                imgWrapper.appendChild(qvBtn);
                
                imgWrapper.addEventListener('mouseenter', () => {
                    qvBtn.style.opacity = '1';
                    qvBtn.style.transform = 'translateX(-50%) translateY(0)';
                });
                imgWrapper.addEventListener('mouseleave', () => {
                    qvBtn.style.opacity = '0';
                    qvBtn.style.transform = 'translateX(-50%) translateY(10px)';
                });
                
                qvBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openQuickView(card);
                });
            }
            
            if (infoWrapper && !infoWrapper.querySelector('.compare-card-btn-wrapper')) {
                const compareWrapper = document.createElement('div');
                compareWrapper.className = 'compare-card-btn-wrapper';
                
                const title = card.querySelector('h3').textContent;
                const price = card.querySelector('.price').textContent;
                const img = card.querySelector('img').src;
                const id = title.toLowerCase().replace(/\s+/g, '-');
                
                compareWrapper.innerHTML = `
                    <label class="compare-checkbox-label">
                        <input type="checkbox" class="compare-checkbox" data-id="${id}" data-name="${title}" data-price="${price}" data-img="${img}">
                        <span><i class="fas fa-balance-scale"></i> Compare Fabric</span>
                    </label>
                `;
                
                const actionBtn = infoWrapper.querySelector('button, .btn');
                if (actionBtn) {
                    infoWrapper.insertBefore(compareWrapper, actionBtn);
                } else {
                    infoWrapper.appendChild(compareWrapper);
                }
            }
        });
    }
    injectCardButtons();

    // Checkbox dynamic listener
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('compare-checkbox')) {
            const checkbox = e.target;
            const item = {
                id: checkbox.getAttribute('data-id'),
                name: checkbox.getAttribute('data-name'),
                price: checkbox.getAttribute('data-price'),
                img: checkbox.getAttribute('data-img')
            };
            
            if (checkbox.checked) {
                if (compareList.length >= 3) {
                    alert('You can compare a maximum of 3 fabrics at a time.');
                    checkbox.checked = false;
                    return;
                }
                compareList.push(item);
            } else {
                compareList = compareList.filter(i => i.id !== item.id);
            }
            
            updateCompareDrawer();
        }
    });

    function updateCompareDrawer() {
        let drawer = document.getElementById('compare-drawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'compare-drawer';
            drawer.className = 'compare-drawer';
            drawer.innerHTML = `
                <div class="container">
                    <div class="compare-container">
                        <div class="compare-slots"></div>
                        <div class="compare-actions">
                            <button class="btn btn-accent" id="start-compare-btn" disabled>Compare (0/3)</button>
                            <button class="btn btn-outline" id="clear-compare-btn">Clear All</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(drawer);
            
            document.getElementById('clear-compare-btn').addEventListener('click', clearComparison);
            document.getElementById('start-compare-btn').addEventListener('click', showComparisonModal);
        }
        
        const slotsContainer = drawer.querySelector('.compare-slots');
        const compareBtn = drawer.querySelector('#start-compare-btn');
        
        let slotsHTML = '';
        for (let i = 0; i < 3; i++) {
            const item = compareList[i];
            if (item) {
                slotsHTML += `
                    <div class="compare-slot" data-id="${item.id}">
                        <img src="${item.img}" alt="${item.name}">
                        <div class="compare-slot-info">
                            <h4>${item.name}</h4>
                            <p>${item.price}</p>
                        </div>
                        <button class="remove-compare-btn" aria-label="Remove ${item.name} from comparison"><i class="fas fa-times"></i></button>
                    </div>
                `;
            } else {
                slotsHTML += `
                    <div class="compare-slot compare-slot-empty">
                        <span><i class="fas fa-plus"></i> Slot ${i + 1}</span>
                    </div>
                `;
            }
        }
        slotsContainer.innerHTML = slotsHTML;
        
        // Sync checkmarks
        document.querySelectorAll('.compare-checkbox').forEach(cb => {
            cb.checked = compareList.some(item => item.id === cb.getAttribute('data-id'));
        });
        
        // Sync actions
        if (compareList.length > 0) {
            drawer.classList.add('open');
            compareBtn.textContent = `Compare (${compareList.length}/3)`;
            compareBtn.disabled = compareList.length < 2;
        } else {
            drawer.classList.remove('open');
        }
        
        // Slot buttons click
        slotsContainer.querySelectorAll('.remove-compare-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.compare-slot').getAttribute('data-id');
                compareList = compareList.filter(i => i.id !== id);
                updateCompareDrawer();
            });
        });
    }

    function clearComparison() {
        compareList = [];
        updateCompareDrawer();
    }

    // Comparison modal popup
    let compareModalOverlay = document.getElementById('compare-modal-overlay');
    if (!compareModalOverlay) {
        compareModalOverlay = document.createElement('div');
        compareModalOverlay.id = 'compare-modal-overlay';
        compareModalOverlay.className = 'compare-modal-overlay';
        compareModalOverlay.setAttribute('role', 'dialog');
        compareModalOverlay.setAttribute('aria-modal', 'true');
        compareModalOverlay.setAttribute('aria-labelledby', 'compare-modal-title');
        compareModalOverlay.innerHTML = `
            <div class="compare-modal" id="compare-modal">
                <div class="compare-modal-header">
                    <h3 id="compare-modal-title">Fabric Weaves Comparison</h3>
                    <button class="close-auth-btn" id="close-compare-modal" aria-label="Close comparison dialog"><i class="fas fa-times"></i></button>
                </div>
                <div class="compare-table-wrapper">
                    <table class="compare-table">
                        <thead>
                            <tr id="compare-row-header">
                                <th>Specification</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr id="compare-row-img">
                                <th>Preview</th>
                            </tr>
                            <tr id="compare-row-price">
                                <th>Sample Cost</th>
                            </tr>
                            <tr id="compare-row-gsm">
                                <th>Density (GSM)</th>
                            </tr>
                            <tr id="compare-row-width">
                                <th>Standard Width</th>
                            </tr>
                            <tr id="compare-row-origin">
                                <th>Origin</th>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(compareModalOverlay);
        
        document.getElementById('close-compare-modal').addEventListener('click', function() {
            compareModalOverlay.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    function showComparisonModal() {
        if (compareList.length < 2) return;
        
        const headerRow = document.getElementById('compare-row-header');
        const imgRow = document.getElementById('compare-row-img');
        const priceRow = document.getElementById('compare-row-price');
        const gsmRow = document.getElementById('compare-row-gsm');
        const widthRow = document.getElementById('compare-row-width');
        const originRow = document.getElementById('compare-row-origin');
        
        // Reset rows
        headerRow.innerHTML = '<th>Specification</th>';
        imgRow.innerHTML = '<th>Preview</th>';
        priceRow.innerHTML = '<th>Sample Cost</th>';
        gsmRow.innerHTML = '<th>Density (GSM)</th>';
        widthRow.innerHTML = '<th>Standard Width</th>';
        originRow.innerHTML = '<th>Origin</th>';
        
        compareList.forEach(item => {
            const details = productDetailsDb[item.id] || {
                gsm: '150 GSM',
                width: '44 inches',
                origin: 'Imported'
            };
            
            headerRow.innerHTML += `<td><strong>${item.name}</strong></td>`;
            imgRow.innerHTML += `<td class="img-cell"><img src="${item.img}" alt="${item.name}"></td>`;
            priceRow.innerHTML += `<td>${item.price} <span style="font-size: 0.8rem; color: var(--text-light);">/ yard</span></td>`;
            gsmRow.innerHTML += `<td>${details.gsm}</td>`;
            widthRow.innerHTML += `<td>${details.width}</td>`;
            originRow.innerHTML += `<td>${details.origin}</td>`;
        });
        
        compareModalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }


    // --- Back to Top Button ---
    let bttBtn = document.getElementById('back-to-top');
    if (!bttBtn) {
        bttBtn = document.createElement('button');
        bttBtn.id = 'back-to-top';
        bttBtn.className = 'back-to-top';
        bttBtn.setAttribute('aria-label', 'Back to top of page');
        bttBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        document.body.appendChild(bttBtn);
        
        bttBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            bttBtn.classList.add('visible');
        } else {
            bttBtn.classList.remove('visible');
        }
    });


    // --- Stats Count-Up IntersectionObserver Animation ---
    const numberItems = document.querySelectorAll('.counter-item .number');
    if (numberItems.length > 0 && 'IntersectionObserver' in window) {
        const countUp = (el) => {
            const targetAttr = el.getAttribute('data-target');
            const target = Number(targetAttr);
            const suffix = el.getAttribute('data-suffix') || '';

            if (!Number.isFinite(target) || target < 0) {
                return;
            }

            let current = 0;
            const duration = 1200; // ms

            if (target === 0) {
                el.textContent = '0' + suffix;
                return;
            }

            const stepTime = Math.max(Math.floor(duration / Math.max(target, 1)), 15);
            const increment = Math.max(1, Math.ceil(target / (duration / stepTime)));
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    el.textContent = current + suffix;
                }
            }, stepTime);
        };

        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        numberItems.forEach(item => statsObserver.observe(item));
    }

    // --- Fetch & Dynamic Render of Products ---
    async function fetchAndRenderProducts() {
        const grid = document.querySelector('.product-grid');
        if (!grid) return;

        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to load products');
            const products = await response.json();

            grid.innerHTML = '';
            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.setAttribute('data-category', p.category);

                const badgeHTML = p.badge ? `<span class="product-badge ${p.badge_type === 'accent' ? 'product-badge-accent' : ''}">${p.badge}</span>` : '';
                
                let starsHTML = '';
                const floorRating = Math.floor(p.rating);
                for (let i = 0; i < 5; i++) {
                    if (i < floorRating) {
                        starsHTML += '<i class="fas fa-star"></i>';
                    } else if (i === floorRating && p.rating % 1 !== 0) {
                        starsHTML += '<i class="fas fa-star-half-alt"></i>';
                    } else {
                        starsHTML += '<i class="far fa-star"></i>';
                    }
                }

                card.innerHTML = `
                    <div class="product-img-wrapper">
                        ${badgeHTML}
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-meta">
                            <span>${p.material}</span>
                            <span>${p.stock}</span>
                        </div>
                        <h3>${p.name}</h3>
                        <p class="price">$${p.price.toFixed(2)} <span class="unit">/ yd</span></p>
                        <span class="wholesale-price">Wholesale: $${p.wholesale_price.toFixed(2)}/yd (MOQ: ${p.moq} yds)</span>
                        <div class="rating">
                            ${starsHTML}
                            <span>(${p.rating})</span>
                        </div>
                        <button class="btn btn-accent">Add to Cart</button>
                    </div>
                `;
                grid.appendChild(card);
            });

            // Re-inject quick view and compare checkbox handlers
            injectCardButtons();

            // Re-apply filter based on search or category
            const searchInput = document.getElementById('catalog-search');
            const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
            filterProducts(query);
        } catch (err) {
            console.error('Failed to load products from API:', err);
        }
    }

    // Initialize recently viewed lists
    renderRecentlyViewed();

    // Fetch and dynamically render products catalog from API
    fetchAndRenderProducts();
});