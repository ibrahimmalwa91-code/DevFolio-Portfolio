(function () {
    'use strict';

    var nav = document.getElementById('mainNav');
    var backToTop = document.getElementById('backToTop');
    var navLinks = document.querySelectorAll('#mainNav .nav-link');
    var sections = [];

    navLinks.forEach(function (link) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) sections.push({ link: link, el: target });
    });

    
    function onScroll() {
        var y = window.scrollY || window.pageYOffset;

        nav.classList.toggle('navbar-scrolled', y > 50);
        backToTop.classList.toggle('show', y > 400);

        var current = sections[0];
        sections.forEach(function (s) {
            if (s.el.getBoundingClientRect().top <= 120) current = s;
        });
        
        if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) {
            current = sections[sections.length - 1];
        }
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        if (current) current.link.classList.add('active');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
    onScroll();

    
    var menu = document.getElementById('navbarNav');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (menu.classList.contains('show') && window.bootstrap) {
                window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
            }
        });
    });

    
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var bars = document.querySelectorAll('.skill .progress-bar');
    var counters = document.querySelectorAll('.count');

    function countUp(el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        if (reduceMotion || target === 0) { el.textContent = target; return; }
        var duration = 1200;
        var start = null;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            el.textContent = Math.floor(p * target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
        }
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && !reduceMotion) {
        
        bars.forEach(function (bar) {
            bar.setAttribute('data-width', bar.style.width);
            bar.style.width = '0';
        });

        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                if (el.classList.contains('progress-bar')) {
                    el.style.width = el.getAttribute('data-width');
                } else {
                    countUp(el);
                }
                obs.unobserve(el);
            });
        }, { threshold: 0.4 });

        bars.forEach(function (b) { io.observe(b); });
        counters.forEach(function (c) { io.observe(c); });
    } else {
        counters.forEach(function (c) { c.textContent = c.getAttribute('data-count'); });
    }

    
    var form = document.getElementById('contactForm');
    var statusBox = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');
    var ENDPOINT = 'https://formsubmit.co/ajax/ibrahimmalwa91@gmail.com';

    function setStatus(type, text) {
        statusBox.className = 'form-status ' + type;
        statusBox.textContent = text;
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            // honeypot: bots fill this hidden field, humans don't
            if (form.elements['_honey'].value) return;

            var payload = {
                name: form.elements['name'].value.trim(),
                email: form.elements['email'].value.trim(),
                subject: form.elements['subject'].value.trim(),
                message: form.elements['message'].value.trim(),
                _subject: 'Portfolio message: ' + form.elements['subject'].value.trim(),
                _template: 'table',
                _captcha: 'false'
            };

            submitBtn.disabled = true;
            setStatus('loading', 'Sending your message...');

            fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
                .then(function (r) {
                    if (r.ok && (r.data.success === true || r.data.success === 'true')) {
                        setStatus('success', 'Your message has been sent. Thank you!');
                        form.reset();
                        form.classList.remove('was-validated');
                    } else {
                        throw new Error('Request failed');
                    }
                })
                .catch(function () {
                    setStatus('error', 'Sorry, something went wrong. Please email me directly at ibrahimmalwa91@gmail.com.');
                })
                .finally(function () {
                    submitBtn.disabled = false;
                });
        });
    }
})();
