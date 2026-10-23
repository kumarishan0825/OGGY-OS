
const REGIONS = {
    IN: { hl: 'en-IN', ceid: 'IN:en', cur: 'inr', sym: '₹' },
    US: { hl: 'en-US', ceid: 'US:en', cur: 'usd', sym: '$' },
    GB: { hl: 'en-GB', ceid: 'GB:en', cur: 'gbp', sym: '£' },
    AU: { hl: 'en-AU', ceid: 'AU:en', cur: 'aud', sym: 'A$' },
    CA: { hl: 'en-CA', ceid: 'CA:en', cur: 'cad', sym: 'C$' }
};
const COINS = [['bitcoin', 'Bitcoin', 'BTC'], ['ethereum', 'Ethereum', 'ETH'], ['solana', 'Solana', 'SOL'], ['dogecoin', 'Dogecoin', 'DOGE']];
const CACHE_MS = 15 * 60 * 1000;     

const newsPanel  = document.getElementById('newsPanel');
const newsHandle = document.getElementById('newsHandle');
const newsList   = document.getElementById('newsList');
const marketList = document.getElementById('marketList');
const newsRegion = document.getElementById('newsRegion');
let newsTab = 'news';

function guessRegion() {
    const saved = localStorage.getItem('oggyos.region');
    if (REGIONS[saved]) return saved;
    const fromLang = ((navigator.language || '').split('-')[1] || '').toUpperCase();
    if (REGIONS[fromLang]) return fromLang;
    return (Intl.DateTimeFormat().resolvedOptions().timeZone || '').includes('Kolkata') ? 'IN' : 'US';
}
let region = guessRegion();
newsRegion.value = region;
document.getElementById('newsDate').textContent =
    new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });

/* open / close */
function setNews(open) {
    newsPanel.classList.toggle('open', open);
    newsHandle.classList.toggle('open', open);
    newsPanel.setAttribute('aria-hidden', String(!open));
    newsHandle.setAttribute('aria-expanded', String(open));
    newsHandle.textContent = open ? '\u00AB' : '\u00BB';
    if (open) refreshActive(false);
}
newsHandle.addEventListener('click', () => setNews(!newsPanel.classList.contains('open')));
document.getElementById('newsClose').addEventListener('click', () => setNews(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNews(false); });


let sx = 0, sy = 0, startedInPanel = false, tracking = false;
document.addEventListener('pointerdown', (e) => {
    sx = e.clientX; sy = e.clientY; tracking = true;
    startedInPanel = newsPanel.contains(e.target);
});
document.addEventListener('pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - sx, dy = Math.abs(e.clientY - sy);
    if (dy > 60) return;                               
    if (sx <= 28 && dx > 70) setNews(true);
    else if (startedInPanel && dx < -70) setNews(false);
});

/* helpers */
function readCache(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}
function writeCache(key, items) {
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), items })); } catch (e) {}
}
function timeAgo(d) {
    const t = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(d) ? new Date(d.replace(' ', 'T') + 'Z') : new Date(d);
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + 'm ago';
    const h = Math.round(m / 60);
    return h < 24 ? h + 'h ago' : Math.round(h / 24) + 'd ago';
}
const skeleton = '<div class="news-skel"></div>'.repeat(6);
const note = (txt) => `<div class="news-note">${txt}</div>`;

const GDELT_NAMES = { IN: 'india', US: 'unitedstates', GB: 'unitedkingdom', AU: 'australia', CA: 'canada' };

async function fromGdelt() {
    const q = `(news OR government OR economy OR sports OR technology) sourcecountry:${GDELT_NAMES[region]} sourcelang:english`;
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&format=json&maxrecords=25&sort=datedesc&timespan=24h&query=' + encodeURIComponent(q);
    const res = await fetch(url);
    const data = JSON.parse(await res.text());            // GDELT sometimes answers with plain-text errors
    if (!data.articles || !data.articles.length) throw new Error('no articles');
    const seen = new Set();
    return data.articles
        .filter(a => a.title && !seen.has(a.title) && seen.add(a.title))   // remove duplicates
        .slice(0, 15)
        .map(a => ({
            title: a.title,
            link: a.url,
            src: a.domain || 'News',
            date: a.seendate.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/, '$1-$2-$3T$4:$5:$6Z')
        }));
}

async function fromGoogleNews() {
    const r = REGIONS[region];
    const feed = `https://news.google.com/rss?hl=${r.hl}&gl=${region}&ceid=${r.ceid}`;
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed));
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'feed error');
    return data.items.slice(0, 15).map(i => {
        const cut = i.title.lastIndexOf(' - ');
        return {
            title: cut > 0 ? i.title.slice(0, cut) : i.title,
            link: i.link,
            src: cut > 0 ? i.title.slice(cut + 3) : 'News',
            date: i.pubDate
        };
    });
}

function renderNews(items) {
    newsList.innerHTML = '';
    items.forEach((it, i) => {
        const a = document.createElement('a');
        a.className = 'news-card'; a.href = it.link; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.style.setProperty('--i', i);
        const h = document.createElement('h3'); h.textContent = it.title;
        const meta = document.createElement('div'); meta.className = 'news-meta';
        const s = document.createElement('span'); s.className = 'news-src'; s.textContent = it.src || 'News';
        const t = document.createElement('span'); t.textContent = timeAgo(it.date);
        meta.append(s, t); a.append(h, meta); newsList.append(a);
    });
}

async function loadNews(force) {
    const key = 'oggyos.news2.' + region, cached = readCache(key);
    if (!force && cached && Date.now() - cached.t < CACHE_MS) return renderNews(cached.items);
    newsList.innerHTML = skeleton;

    let items = null;
    for (const source of [fromGdelt, fromGoogleNews]) {
        try { items = await source(); if (items && items.length) break; }
        catch (err) { console.warn('[news]', source.name, 'failed:', err.message); }
    }

    if (items && items.length) { writeCache(key, items); renderNews(items); }
    else if (cached) renderNews(cached.items);            // show older news instead of nothing
    else newsList.innerHTML = note('Could not load news right now. Wait a few seconds and press ↻.');
}

async function loadMarkets() {
    const r = REGIONS[region];
    marketList.innerHTML = skeleton;
    try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINS.map(c => c[0]).join(',')}&vs_currencies=${r.cur}&include_24hr_change=true`;
        const data = await (await fetch(url)).json();
        marketList.innerHTML = '';
        COINS.forEach(([id, name, sym], i) => {
            const price = data[id] && data[id][r.cur], chg = data[id] && data[id][r.cur + '_24h_change'];
            if (price == null) return;
            const card = document.createElement('div');
            card.className = 'news-card mkt-card'; card.style.setProperty('--i', i);
            const up = chg >= 0;
            card.innerHTML = `<div class="mkt-name"><b></b><span></span></div>
                <div class="mkt-price"><div></div><span class="mkt-chg ${up ? 'up' : 'down'}"></span></div>`;
            card.querySelector('b').textContent = name;
            card.querySelector('.mkt-name span').textContent = sym;
            card.querySelector('.mkt-price div').textContent = r.sym + price.toLocaleString(undefined, { maximumFractionDigits: 2 });
            card.querySelector('.mkt-chg').textContent = (up ? '▲ ' : '▼ ') + Math.abs(chg).toFixed(2) + '%';
            marketList.append(card);
        });
        if (!marketList.children.length) throw new Error('empty');
        marketList.insertAdjacentHTML('beforeend', note('Crypto prices by CoinGecko · 24h change'));
    } catch (err) {
        marketList.innerHTML = note('Prices are unavailable right now (rate limit or offline). Try again in a minute.');
    }
}

function refreshActive(force) { newsTab === 'news' ? loadNews(force) : loadMarkets(); }

document.querySelectorAll('[data-ntab]').forEach(b => b.addEventListener('click', () => {
    newsTab = b.dataset.ntab;
    document.querySelectorAll('[data-ntab]').forEach(x => x.classList.toggle('on', x === b));
    newsList.hidden = newsTab !== 'news';
    marketList.hidden = newsTab !== 'markets';
    refreshActive(false);
}));
newsRegion.addEventListener('change', () => {
    region = newsRegion.value;
    localStorage.setItem('oggyos.region', region);
    refreshActive(false); 
});
document.getElementById('newsRefresh').addEventListener('click', () => refreshActive(true));



