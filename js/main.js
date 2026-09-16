(() => {
    'use strict';

    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- Custom cursor ---------- */
    if (hasFinePointer) {
        const dot = document.querySelector('[data-cursor-dot]');
        const ring = document.querySelector('[data-cursor-ring]');
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        });

        function raf() {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(raf);
        }
        raf();

        function bindHoverTargets() {
            document.querySelectorAll('[data-hover], a, button').forEach((el) => {
                if (el.dataset.cursorBound) return;
                el.dataset.cursorBound = 'true';
                el.addEventListener('mouseenter', () => ring.classList.add('cursor-ring--active'));
                el.addEventListener('mouseleave', () => ring.classList.remove('cursor-ring--active'));
            });
        }
        bindHoverTargets();
        document.addEventListener('languagechange', bindHoverTargets);
    }

    /* ---------- Header scroll state ---------- */
    const header = document.querySelector('[data-site-header]');
    if (header) {
        const onScroll = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 40);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- Active nav link on scroll ---------- */
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const sections = Array.from(navLinks)
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (sections.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = `#${entry.target.id}`;
                navLinks.forEach((link) => {
                    link.classList.toggle('site-header__link--active', link.getAttribute('href') === id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach((section) => spy.observe(section));
    }

    /* ---------- Mobile drawer ---------- */
    const drawer = document.querySelector('[data-drawer]');
    const drawerBackdrop = document.querySelector('[data-drawer-backdrop]');
    const drawerToggle = document.querySelector('[data-drawer-toggle]');
    const drawerClose = document.querySelector('[data-drawer-close]');

    function openDrawer() {
        drawer.classList.add('is-open');
        drawerBackdrop.classList.add('is-open');
        drawerToggle?.setAttribute('aria-expanded', 'true');
    }
    function closeDrawer() {
        drawer.classList.remove('is-open');
        drawerBackdrop.classList.remove('is-open');
        drawerToggle?.setAttribute('aria-expanded', 'false');
    }

    drawerToggle?.addEventListener('click', openDrawer);
    drawerClose?.addEventListener('click', closeDrawer);
    drawerBackdrop?.addEventListener('click', closeDrawer);
    document.querySelectorAll('[data-drawer-link]').forEach((link) => link.addEventListener('click', closeDrawer));

    /* ---------- Magnetic buttons ---------- */
    if (hasFinePointer) {
        document.querySelectorAll('[data-magnetic]').forEach((wrap) => {
            const max = parseFloat(wrap.dataset.magneticMax || '14');
            const child = wrap.firstElementChild;

            wrap.addEventListener('mousemove', (e) => {
                const rect = wrap.getBoundingClientRect();
                const relX = e.clientX - rect.left - rect.width / 2;
                const relY = e.clientY - rect.top - rect.height / 2;
                const x = Math.max(-max, Math.min(max, relX * 0.28));
                const y = Math.max(-max, Math.min(max, relY * 0.28));
                child.style.transform = `translate(${x}px, ${y}px)`;
            });

            wrap.addEventListener('mouseleave', () => {
                child.style.transform = 'translate(0, 0)';
            });
        });
    }

    /* ---------- Liquid glass hover glow position ---------- */
    document.querySelectorAll('[data-liquid-glass], .liquid-glass').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--glass-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
            el.style.setProperty('--glass-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
        });
    });

    /* ---------- Accordion ---------- */
    document.querySelectorAll('[data-accordion-item]').forEach((item) => {
        const trigger = item.querySelector('[data-accordion-trigger]');
        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('accordion__item--active');
            item.closest('[data-accordion]').querySelectorAll('[data-accordion-item]').forEach((el) => {
                el.classList.remove('accordion__item--active');
                el.querySelector('[data-accordion-trigger]').setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('accordion__item--active');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---------- Scroll reveal ---------- */
    const revealTargets = document.querySelectorAll('[data-reveal]');
    if (revealTargets.length) {
        const groups = document.querySelectorAll('[data-reveal-group]');
        groups.forEach((group) => {
            Array.from(group.children).forEach((child, i) => child.style.setProperty('--reveal-index', i));
        });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealTargets.forEach((el) => revealObserver.observe(el));
    }

    /* ---------- Hero parallax ---------- */
    const heroBg = document.querySelector('[data-parallax-bg]');
    const heroMark = document.querySelector('[data-parallax-mark]');
    if (heroBg || heroMark) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (heroBg) heroBg.style.transform = `translateY(${y * 0.18}px)`;
            if (heroMark) heroMark.style.transform = `translateY(${y * 0.08}px) rotate(${y * 0.01}deg)`;
        }, { passive: true });
    }

    /* ---------- Generic draggable tracks (team, feature slider) ---------- */
    function makeDraggable(track) {
        if (!track) return;
        let isDown = false, startX, scrollLeft, moved = false;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            moved = false;
            track.classList.add('is-dragging');
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });
        ['mouseleave', 'mouseup'].forEach((evt) => track.addEventListener(evt, () => {
            isDown = false;
            track.classList.remove('is-dragging');
        }));
        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = x - startX;
            if (Math.abs(walk) > 5) moved = true;
            track.scrollLeft = scrollLeft - walk * 1.4;
        });
        track.addEventListener('click', (e) => {
            if (moved) { e.preventDefault(); e.stopPropagation(); }
        }, true);
    }

    document.querySelectorAll('[data-drag-track]').forEach(makeDraggable);

    /* ---------- Feature slider ---------- */
    const featureTrack = document.querySelector('[data-feature-track]');
    if (featureTrack) {
        makeDraggable(featureTrack);
        const slides = Array.from(featureTrack.querySelectorAll('[data-feature-slide]'));
        const dotsWrap = document.querySelector('[data-feature-dots]');
        const prevBtn = document.querySelector('[data-feature-prev]');
        const nextBtn = document.querySelector('[data-feature-next]');

        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsWrap.appendChild(dot);
        });
        const dots = Array.from(dotsWrap.children);

        let activeIndex = 0;
        let userIsDragging = false;

        function setActive(index) {
            activeIndex = index;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        }

        function goToSlide(index) {
            const clamped = Math.max(0, Math.min(slides.length - 1, index));
            const slide = slides[clamped];
            const maxScrollLeft = featureTrack.scrollWidth - featureTrack.clientWidth;
            const target = slide.offsetLeft - (featureTrack.clientWidth - slide.clientWidth) / 2;
            featureTrack.scrollTo({
                left: Math.max(0, Math.min(maxScrollLeft, target)),
                behavior: 'smooth'
            });
            setActive(clamped);
        }

        function currentIndexFromScroll() {
            const maxScrollLeft = featureTrack.scrollWidth - featureTrack.clientWidth;
            if (featureTrack.scrollLeft <= 2) return 0;
            if (featureTrack.scrollLeft >= maxScrollLeft - 2) return slides.length - 1;
            const center = featureTrack.scrollLeft + featureTrack.clientWidth / 2;
            let closest = 0, minDist = Infinity;
            slides.forEach((slide, i) => {
                const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
                const dist = Math.abs(slideCenter - center);
                if (dist < minDist) { minDist = dist; closest = i; }
            });
            return closest;
        }

        let scrollRaf;
        featureTrack.addEventListener('scroll', () => {
            // Solo re-derivamos el índice activo a partir del scroll cuando el usuario
            // está arrastrando manualmente; los botones/puntos ya fijan el índice exacto
            // en goToSlide, evitando que el cálculo por posición (ambiguo en pantallas anchas) los pise.
            if (!userIsDragging) return;
            cancelAnimationFrame(scrollRaf);
            scrollRaf = requestAnimationFrame(() => setActive(currentIndexFromScroll()));
        }, { passive: true });

        featureTrack.addEventListener('mousedown', () => { userIsDragging = true; });
        window.addEventListener('mouseup', () => { userIsDragging = false; });
        featureTrack.addEventListener('touchstart', () => { userIsDragging = true; }, { passive: true });
        featureTrack.addEventListener('touchend', () => { userIsDragging = false; });

        prevBtn?.addEventListener('click', () => goToSlide(activeIndex - 1));
        nextBtn?.addEventListener('click', () => goToSlide(activeIndex + 1));

        setActive(0);
        window.addEventListener('resize', () => setActive(currentIndexFromScroll()));
    }

    /* ---------- Segments pager (vertical slide) ---------- */
    const segmentsPager = document.querySelector('[data-segments-pager]');
    if (segmentsPager) {
        const slides = Array.from(segmentsPager.querySelectorAll('[data-segments-slide]'));
        const currentLabel = segmentsPager.querySelector('[data-segments-current]');
        const totalLabel = segmentsPager.querySelector('[data-segments-total]');
        const prevBtn = segmentsPager.querySelector('[data-segments-prev]');
        const nextBtn = segmentsPager.querySelector('[data-segments-next]');
        let index = 0;
        let autoTimer;

        totalLabel.textContent = String(slides.length).padStart(2, '0');

        function render(newIndex, direction) {
            const clamped = (newIndex + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                slide.classList.toggle('is-active', i === clamped);
            });
            currentLabel.textContent = String(clamped + 1).padStart(2, '0');
            index = clamped;
        }

        function next() { render(index + 1, 1); resetAuto(); }
        function prev() { render(index - 1, -1); resetAuto(); }

        function resetAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => render(index + 1, 1), 6000);
        }

        nextBtn.addEventListener('click', next);
        prevBtn.addEventListener('click', prev);

        render(0);
        resetAuto();

        segmentsPager.addEventListener('mouseenter', () => clearInterval(autoTimer));
        segmentsPager.addEventListener('mouseleave', resetAuto);
    }

    /* ---------- Legal drawer ---------- */
    const legalDrawer = document.querySelector('[data-legal-drawer]');
    if (legalDrawer) {
        document.querySelectorAll('[data-legal]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const kind = link.dataset.legal;
                legalDrawer.querySelectorAll('[data-legal-content]').forEach((c) => {
                    c.hidden = c.dataset.legalContent !== kind;
                });
                legalDrawer.hidden = false;
            });
        });
        legalDrawer.querySelectorAll('[data-legal-close]').forEach((btn) => {
            btn.addEventListener('click', () => { legalDrawer.hidden = true; });
        });
    }

    /* ---------- Smooth anchor scrolling offset for fixed header ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 88;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();
