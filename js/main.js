console.log("Sua Chua Co Mai - Main JS Loaded");

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const header = document.querySelector('header');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            document.body.classList.toggle('mobile-menu-open');
            header.classList.toggle('mobile-open');
        });
    }

    // Scroll Spy for Sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.menu-category');

    function highlightSidebar() {
        let scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150; // Offset for header
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                let targetId = sectionId;

                // The banner (#best-seller) is one tall scrubbed section: its
                // first half is the assembly (Best Seller), its second half is
                // the mì cay price page (#micay). Pick the matching tab.
                if (sectionId === 'best-seller') {
                    const scroller = section.querySelector('.scroller');
                    if (scroller) {
                        const total = scroller.offsetHeight - window.innerHeight;
                        const p = total > 0 ? (-scroller.getBoundingClientRect().top) / total : 0;
                        targetId = p >= 0.5 ? 'micay' : 'best-seller';
                    }
                }

                sidebarLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + targetId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightSidebar);

    // Roll down a card's price list inline. Keyboard-accessible via the button,
    // and clicking anywhere on the card also toggles it.
    document.querySelectorAll('.standard-grid .menu-item').forEach((item, i) => {
        const button = item.querySelector('.see-more-btn');
        const priceList = item.querySelector('.price-list');
        if (!priceList) return;

        if (!priceList.id) priceList.id = 'price-list-' + i;
        const toggle = () => {
            const open = priceList.style.display === 'block';
            priceList.style.display = open ? 'none' : 'block';
            if (button) {
                button.textContent = open ? 'Xem Món' : 'Ẩn Món';
                button.setAttribute('aria-expanded', String(!open));
            }
        };

        if (button) {
            button.setAttribute('type', 'button');
            button.setAttribute('aria-controls', priceList.id);
            button.setAttribute('aria-expanded', 'false');
            button.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
        }
        // Flexibility: clicking anywhere on the card toggles it; clicks inside the
        // open list don't close it.
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            if (e.target.closest('.see-more-btn')) return;
            if (e.target.closest('.price-list')) return;
            toggle();
        });
    });

    // Contact Modal Logic
    const modal = document.getElementById('contactModal');
    const contactBtns = document.querySelectorAll('.contact-btn, .footer-btn');
    const closeBtn = document.querySelector('.close-modal');

    // Open modal
    contactBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior if applicable
            modal.style.display = 'flex';
        });
    });

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });

    // Notification Modal Logic
    const notificationModal = document.getElementById('notificationModal');
    const closeNotificationBtns = document.querySelectorAll('.close-notification, .close-notification-btn');

    if (notificationModal) {
        const NOTICE_KEY = 'scm-notice-dismissed';

        const dismissNotification = () => {
            notificationModal.style.display = 'none';
            try { sessionStorage.setItem(NOTICE_KEY, '1'); } catch (e) { /* private mode */ }
        };

        // Show once per session — skip if already dismissed
        let dismissed = false;
        try { dismissed = sessionStorage.getItem(NOTICE_KEY) === '1'; } catch (e) { /* ignore */ }
        if (!dismissed) {
            notificationModal.style.display = 'flex';
        }

        // Close when clicking the "x" or the "Đã Hiểu" button
        if (closeNotificationBtns) {
            closeNotificationBtns.forEach(btn => {
                btn.addEventListener('click', dismissNotification);
            });
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target == notificationModal) {
                dismissNotification();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && notificationModal.style.display === 'flex') {
                dismissNotification();
            }
        });
    }
});

/* Auto-hide top chrome on scroll down, reveal on scroll up. */
(function () {
    var lastY = window.scrollY || 0;
    var ticking = false;
    var SHOW_FROM_TOP = 80;   // always show near the top of the page
    var DELTA = 6;            // ignore tiny scroll jitters

    function update() {
        ticking = false;
        var y = window.scrollY || 0;
        if (Math.abs(y - lastY) < DELTA) return;
        if (y > lastY && y > SHOW_FROM_TOP) {
            document.body.classList.add('nav-hidden');   // scrolling down
        } else {
            document.body.classList.remove('nav-hidden'); // scrolling up
        }
        lastY = y;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
})();
