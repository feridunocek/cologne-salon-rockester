/**
 * Cookie Consent – Cologne Salon Rockester
 *
 * Konfigürasyon: GA Tracking ID veya FB Pixel ID eklenince buraya yaz.
 * Boş bırakılırsa o script yüklenmez.
 */
var CSR_COOKIE_CONFIG = {
    ga4Id:      '',   // z.B. 'G-XXXXXXXXXX'
    fbPixelId:  '',   // z.B. '1234567890123456'
    storageKey: 'csr_cookie_consent',
    version:    '1'
};

(function () {
    'use strict';

    var KEY = CSR_COOKIE_CONFIG.storageKey;

    /* ── Gespeicherte Einwilligung lesen ── */
    function getConsent() {
        try {
            var raw = localStorage.getItem(KEY);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            return (obj.v === CSR_COOKIE_CONFIG.version) ? obj.choice : null;
        } catch (e) { return null; }
    }

    function saveConsent(choice) {
        try {
            localStorage.setItem(KEY, JSON.stringify({
                choice: choice,
                v: CSR_COOKIE_CONFIG.version,
                ts: Date.now()
            }));
        } catch (e) {}
    }

    /* ── Tracking-Skripte laden ── */
    function loadGA4() {
        var id = CSR_COOKIE_CONFIG.ga4Id;
        if (!id) return;
        var s = document.createElement('script');
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
        s.async = true;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', id);
    }

    function loadFBPixel() {
        var id = CSR_COOKIE_CONFIG.fbPixelId;
        if (!id) return;
        !function(f,b,e,v,n,t,s){
            if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)
        }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', id);
        fbq('track', 'PageView');
    }

    function activateTracking() {
        loadGA4();
        loadFBPixel();
    }

    /* ── Banner-HTML injizieren ── */
    function injectBanner() {
        var css = [
            '#csr-cookie-banner{',
                'position:fixed;bottom:0;left:0;right:0;z-index:99999;',
                'background:#141009;border-top:1px solid rgba(201,168,76,0.25);',
                'padding:1.4rem 2rem;',
                'display:flex;align-items:center;justify-content:space-between;',
                'gap:1.5rem;flex-wrap:wrap;',
                'font-family:"Libre Baskerville",Georgia,serif;',
                'font-size:0.82rem;color:#9a8e7e;line-height:1.6;',
                'transform:translateY(100%);',
                'transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);',
            '}',
            '#csr-cookie-banner.visible{transform:translateY(0);}',
            '#csr-cookie-banner strong{color:#f0e8d8;font-style:normal;}',
            '#csr-cookie-banner a{color:#c9a84c;text-decoration:none;}',
            '#csr-cookie-banner a:hover{color:#e0c060;}',
            '.csr-cookie-actions{display:flex;gap:0.6rem;flex-shrink:0;flex-wrap:wrap;}',
            '.csr-cookie-btn{',
                'font-family:"Bebas Neue",sans-serif;font-size:0.78rem;',
                'letter-spacing:0.18em;text-transform:uppercase;',
                'padding:0.5rem 1.2rem;border:1px solid rgba(201,168,76,0.3);',
                'background:transparent;cursor:pointer;transition:background 0.3s,border-color 0.3s;',
            '}',
            '.csr-cookie-btn.accept{',
                'background:rgba(201,168,76,0.12);border-color:#c9a84c;color:#c9a84c;',
            '}',
            '.csr-cookie-btn.accept:hover{background:rgba(201,168,76,0.22);}',
            '.csr-cookie-btn.decline{color:#9a8e7e;}',
            '.csr-cookie-btn.decline:hover{border-color:rgba(201,168,76,0.3);color:#f0e8d8;}'
        ].join('');

        var styleEl = document.createElement('style');
        styleEl.textContent = css;
        document.head.appendChild(styleEl);

        var banner = document.createElement('div');
        banner.id = 'csr-cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie-Einwilligung');
        banner.innerHTML = [
            '<p>',
                '<strong>Cookie-Hinweis</strong> &mdash; ',
                'Wir möchten Analyse- und Marketing-Cookies (Google Analytics, Meta Pixel) einsetzen, ',
                'um unsere Reichweite zu verstehen. Weitere Infos in der ',
                '<a href="datenschutz.html">Datenschutzerklärung</a>.',
            '</p>',
            '<div class="csr-cookie-actions">',
                '<button class="csr-cookie-btn decline" id="csr-decline">Nur notwendige</button>',
                '<button class="csr-cookie-btn accept" id="csr-accept">Alle akzeptieren</button>',
            '</div>'
        ].join('');

        document.body.appendChild(banner);

        /* Animation starten */
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                banner.classList.add('visible');
            });
        });

        document.getElementById('csr-accept').addEventListener('click', function () {
            saveConsent('all');
            hideBanner();
            activateTracking();
        });

        document.getElementById('csr-decline').addEventListener('click', function () {
            saveConsent('necessary');
            hideBanner();
        });
    }

    function hideBanner() {
        var banner = document.getElementById('csr-cookie-banner');
        if (!banner) return;
        banner.classList.remove('visible');
        setTimeout(function () { banner.remove(); }, 450);
    }

    /* ── Cookie-Einstellungen-Link aktivieren ── */
    function bindSettingsLinks() {
        document.querySelectorAll('.csr-cookie-settings').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem(KEY);
                injectBanner();
            });
        });
    }

    /* ── Init ── */
    function init() {
        var consent = getConsent();
        if (consent === 'all') {
            activateTracking();
        } else if (consent === null) {
            injectBanner();
        }
        bindSettingsLinks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
