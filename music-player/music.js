const radio   = document.getElementById('radio');
const rdAudio = document.getElementById('rdAudio');
const rdList  = document.getElementById('rdList');
const rdName  = document.getElementById('rdName');
const rdSub   = document.getElementById('rdSub');
const rdPlay  = document.getElementById('rdPlay');
const rdNext  = document.getElementById('rdNext');
const rdFav   = document.getElementById('rdFav');
const rdShuf  = document.getElementById('rdShuf');
const rdSleep = document.getElementById('rdSleep');
const rdVol   = document.getElementById('rdVol');
const rdSeek  = document.getElementById('rdSeek');
const rdChips = document.getElementById('rdChips');
const rdQ     = document.getElementById('rdQ');

const RB  = ['https://de1.api.radio-browser.info', 'https://nl1.api.radio-browser.info', 'https://at1.api.radio-browser.info'];

const AUD = ['https://discoveryprovider.audius.co', 'https://api.audius.co'];
const APP = 'OGGY_OS';

const rdStore = {
    get(k, d) { 
        try { 
            const v = JSON.parse(localStorage.getItem('oggyos.radio.' + k)); 
            return v == null ? d : v; 
        } catch (e) { 
            return d; 
        } 
    },
    set(k, v) { 
        try { 
            localStorage.setItem('oggyos.radio.' + k, JSON.stringify(v)); 
        } catch (e) {} 
    }
};
const rd = {
    mode: rdStore.get('mode', 'radio'),          
    cur: rdStore.get('last2', null),
    list: [], idx: -1, view: '', req: 0, errs: 0, loaded: false,
    shuffle: rdStore.get('shuffle', false),
    favs: rdStore.get('favs2', { radio: [], song: [] })
};

const rdEnc = encodeURIComponent;
const rdHttps = (u) => (u || '').startsWith('https://');
const rdFmt = (s) => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
const rdLocal = () => (typeof region !== 'undefined' ? region : 'IN');


const fromStation = (s) => ({ 
    kind: 'radio', id: s.stationuuid, name: s.name,
    sub: [s.country, s.codec, s.bitrate ? s.bitrate + 'k' : ''].filter(Boolean).join(' · ') || 'Live',
    art: s.favicon, url: s.url_resolved 
});
const fromAudius = (t) => {
    const a = t.artwork || {};
    return { 
        kind: 'song', id: 'a' + t.id, name: t.title,
        sub: ((t.user && t.user.name) || 'Unknown artist') + ' · full track',
        art: a['150x150'] || a['480x480'] || '', url: `${AUD[0]}/v1/tracks/${t.id}/stream?app_name=${APP}` 
    };
};
const fromItunes = (t) => ({ 
    kind: 'song', id: 'i' + t.trackId, name: t.trackName,
    sub: t.artistName + ' · 30s preview', art: (t.artworkUrl100 || '').replace('100x100', '200x200'), url: t.previewUrl 
});

async function rbGet(path) {
    for (const base of RB) {
        try { 
            const r = await fetch(base + path); if (r.ok) return await r.json(); 
        } catch (e) {}
    }
    throw new Error('radio directory unavailable');
}
const rbSearch = (p) => rbGet('/json/stations/search?' + new URLSearchParams(
    { 
        hidebroken: 'true', is_https: 'true', order: 'clickcount', reverse: 'true', limit: '30', ...p 
    }));
function rdClean(data) {
    const seen = new Set();
    return data.filter(s => {
        const n = (s.name || '').trim().toLowerCase();
        if (!n || !rdHttps(s.url_resolved) || s.hls || seen.has(n)) return false;
        seen.add(n); return true;
    }).slice(0, 25);
}
async function loadRadio(spec) {
    if (spec.text) {
        const [a, b] = await Promise.all([rbSearch({ name: spec.text }), rbSearch({ tag: spec.text }).catch(() => [])]);
        return rdClean([...a, ...b]).map(fromStation);
    }
    return rdClean(await rbSearch(spec.cc ? { countrycode: rdLocal() } : { tag: spec.tag })).map(fromStation);
}

/* ----- data: songs (Audius full tracks + iTunes 30s previews) ----- */
async function audGet(path) {
    for (const h of AUD) {
        try {
            const r = await fetch(h + path + (path.includes('?') ? '&' : '?') + 'app_name=' + APP);
            if (r.ok) { const j = await r.json(); return j.data || []; }
        } catch (e) { console.warn('[music] Audius host failed:', h); }
    }
    throw new Error('audius unavailable');
}
const audOk = (t) => t.is_streamable !== false && !t.is_stream_gated;
async function loadSongs(spec) {
    if (spec.trend || spec.surprise) {
        return (await audGet('/v1/tracks/trending')).filter(audOk).slice(0, 30).map(fromAudius);
    }
    const q = spec.q || spec.text;
    const [a, b] = await Promise.all([
        audGet('/v1/tracks/search?query=' + rdEnc(q)).catch(() => []),
        fetch(`https://itunes.apple.com/search?term=${rdEnc(q)}&media=music&entity=song&limit=15&country=${rdLocal()}`)
            .then(r => r.json()).then(d => d.results || []).catch(() => [])
    ]);
    return [...a.filter(audOk).slice(0, 15).map(fromAudius), ...b.filter(t => t.previewUrl).map(fromItunes)];
}

/* ----- list + chips ----- */
const CHIPS = {
    radio: [['📍 Local', { cc: 1 }], ['Lo-fi', { tag: 'lofi' }], ['Bollywood', { tag: 'bollywood' }], ['Jazz', { tag: 'jazz' }],
            ['Rock', { tag: 'rock' }], ['Classical', { tag: 'classical' }], ['News', { tag: 'news' }], ['♥ Favorites', { fav: 1 }]],
    song:  [['🔥 Trending', { trend: 1 }], ['🎲 Surprise me', { surprise: 1 }], ['Bollywood', { q: 'bollywood' }], ['Lo-fi', { q: 'lofi' }],
            ['Electronic', { q: 'electronic' }], ['Hip-hop', { q: 'hip hop' }], ['Chill', { q: 'chill' }], ['♥ Favorites', { fav: 1 }]]
};
function rdDrawChips() {
    rdChips.innerHTML = '';
    CHIPS[rd.mode].forEach(([label], i) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.dataset.i = i; rdChips.append(b);
    });
}
function rdSetList(items, emptyMsg) {
    rd.list = items;
    rd.idx = rd.cur ? items.findIndex(x => x.id === rd.cur.id) : -1;
    rdList.innerHTML = '';
    if (!items.length) { rdList.innerHTML = `<div class="rd-msg">${emptyMsg}</div>`; return; }
    items.forEach((it, i) => {
        const row = document.createElement('button');
        row.type = 'button'; row.className = 'rd-row'; row.dataset.id = it.id;
        row.style.setProperty('--i', Math.min(i, 12));
        if (rd.cur && rd.cur.id === it.id) row.classList.add('on');
        const logo = document.createElement('span'); logo.className = 'rd-logo'; logo.textContent = it.kind === 'radio' ? '📻' : '🎵';
        if (rdHttps(it.art)) {
            const im = new Image(); im.referrerPolicy = 'no-referrer'; im.alt = '';
            im.onload = () => { logo.textContent = ''; logo.append(im); };
            im.src = it.art;
        }
        const info = document.createElement('span'); info.className = 'rd-info';
        const b = document.createElement('b'); b.textContent = it.name;
        const m = document.createElement('span'); m.textContent = it.sub;
        info.append(b, m); row.append(logo, info);
        row.addEventListener('click', () => rdPlayItem(it));
        rdList.append(row);
    });
}
async function rdRun(spec) {
    const mine = ++rd.req;                                  
    rd.view = spec.fav ? 'fav' : '';
    if (spec.fav) { rdSetList([...rd.favs[rd.mode]], 'No favorites yet. Tap ♡ on something you like.'); return; }
    rdList.innerHTML = `<div class="rd-msg">${rd.mode === 'radio' ? 'Tuning in…' : 'Searching…'}</div>`;
    try {
        const items = rd.mode === 'radio' ? await loadRadio(spec) : await loadSongs(spec);
        if (mine !== rd.req) return;
        rdSetList(items, 'Nothing found. Try another search.');
        if (spec.surprise && items.length) { rd.shuffle = true; rdShufUI(); rdStep(1); }
    } catch (e) {
        if (mine !== rd.req) return;
        rdList.innerHTML = `<div class="rd-msg">The ${rd.mode === 'radio' ? 'radio directory' : 'music service'} is unreachable. Try again in a moment.</div>`;
    }
}
function rdDefault() {
    rdRun(rd.mode === 'radio' ? { cc: 1 } : { trend: 1 });
    if (rdChips.firstChild) rdChips.firstChild.classList.add('on');
}


function rdSetMode(m) {
    rd.mode = m; rdStore.set('mode', m);
    radio.dataset.mode = m;
    document.querySelectorAll('#rdModes button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
    rdQ.placeholder = m === 'radio' ? 'Search stations, genres...' : 'Search any song or artist...';
    rdDrawChips(); rd.list = []; rd.view = '';
    if (rd.loaded) rdDefault();
}
document.getElementById('rdModes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && b.dataset.mode !== rd.mode) rdSetMode(b.dataset.mode);
});
rdChips.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    rdChips.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    rdRun(CHIPS[rd.mode][b.dataset.i][1]);
});
document.getElementById('rdForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = rdQ.value.trim(); if (!t) return;
    rdChips.querySelectorAll('button').forEach(x => x.classList.remove('on'));
    rdRun({ text: t });
});


function rdUI() {
    if (!rd.cur) return;
    rdName.textContent = rd.cur.name;
    rdFav.textContent = rd.favs[rd.cur.kind === 'radio' ? 'radio' : 'song'].some(f => f.id === rd.cur.id) ? '♥' : '♡';
    rdList.querySelectorAll('.rd-row').forEach(r => r.classList.toggle('on', r.dataset.id === rd.cur.id));
}
function rdPlayItem(it) {
    rd.cur = it; rd.idx = rd.list.findIndex(x => x.id === it.id);
    rdStore.set('last2', it);
    rdAudio.src = it.url;
    rdName.textContent = it.name; rdSub.textContent = 'Connecting…';
    rdAudio.play().catch(() => { rdSub.textContent = 'Press play to start'; });
    if (it.kind === 'radio') fetch(RB[0] + '/json/url/' + it.id).catch(() => {});    
    rdUI();
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: it.name, artist: it.sub,
            artwork: rdHttps(it.art) ? [{ src: it.art }] : [] });
        navigator.mediaSession.setActionHandler('play', () => rdPlay.click());
        navigator.mediaSession.setActionHandler('pause', () => rdAudio.pause());
        navigator.mediaSession.setActionHandler('nexttrack', () => rdStep(1));
        navigator.mediaSession.setActionHandler('previoustrack', () => rdStep(-1));
    }
}
async function rdStep(dir) {                                  
    if (!rd.list.length) {
        try { rdSetList(await loadSongs({ trend: 1 }), 'Nothing found.'); }
        catch (e) { rdSub.textContent = 'Could not load songs'; return; }
    }
    if (!rd.list.length) return;
    let i;
    if (rd.shuffle && rd.list.length > 1) { do { i = Math.floor(Math.random() * rd.list.length); } while (i === rd.idx); }
    else i = (rd.idx + dir + rd.list.length) % rd.list.length;
    rdPlayItem(rd.list[i]);
}
rdNext.addEventListener('click', () => rdStep(1));
function rdShufUI() { rdShuf.classList.toggle('on', rd.shuffle); rdShuf.setAttribute('aria-pressed', String(rd.shuffle)); rdStore.set('shuffle', rd.shuffle); }
rdShuf.addEventListener('click', () => { rd.shuffle = !rd.shuffle; rdShufUI(); });

rdPlay.addEventListener('click', () => {
    if (!rd.cur) {
        if (rd.mode === 'song') rdStep(1);
        else if (rd.list.length) rdPlayItem(rd.list[0]);
        else rdSub.textContent = 'Pick a station first';
        return;
    }
    if (rdAudio.paused) {
        if (rd.cur.kind === 'radio' || !rdAudio.getAttribute('src')) rdAudio.src = rd.cur.url;  
        rdAudio.play().catch(() => {});
    } else rdAudio.pause();
});
rdAudio.addEventListener('playing', () => {
    rd.errs = 0; radio.classList.add('playing'); rdPlay.innerHTML = '&#10074;&#10074;';
    rdSub.textContent = rd.cur.sub;
});
rdAudio.addEventListener('pause', () => { radio.classList.remove('playing'); rdPlay.innerHTML = '&#9654;'; });
rdAudio.addEventListener('waiting', () => { rdSub.textContent = 'Buffering…'; });
rdAudio.addEventListener('ended', () => { if (rd.cur && rd.cur.kind === 'song') rdStep(1); });
rdAudio.addEventListener('error', () => {
    if (!rdAudio.getAttribute('src')) return;
    radio.classList.remove('playing'); rdPlay.innerHTML = '&#9654;';
    if (rd.cur && rd.cur.kind === 'song' && rd.errs < 3 && rd.list.length > 1) {
        rd.errs++; rdSub.textContent = 'Skipping a track that would not load…'; setTimeout(() => rdStep(1), 800);
    } else rdSub.textContent = "This one won't play. Try another.";
});
rdAudio.addEventListener('timeupdate', () => {
    if (!rd.cur || rd.cur.kind !== 'song' || !isFinite(rdAudio.duration)) return;
    rdSeek.max = rdAudio.duration; rdSeek.value = rdAudio.currentTime;
    document.getElementById('rdT').textContent = rdFmt(rdAudio.currentTime);
    document.getElementById('rdD').textContent = rdFmt(rdAudio.duration);
});
rdSeek.addEventListener('input', () => { rdAudio.currentTime = Number(rdSeek.value); });


rdAudio.volume = rdStore.get('vol', 0.7);
rdVol.value = rdAudio.volume;
rdVol.addEventListener('input', () => { rdAudio.volume = Number(rdVol.value); rdStore.set('vol', rdAudio.volume); });

rdFav.addEventListener('click', () => {
    if (!rd.cur) return;
    const list = rd.favs[rd.cur.kind === 'radio' ? 'radio' : 'song'];
    const i = list.findIndex(f => f.id === rd.cur.id);
    if (i >= 0) list.splice(i, 1); else list.push(rd.cur);
    rdStore.set('favs2', rd.favs);
    rdUI();
    if (rd.view === 'fav') rdSetList([...rd.favs[rd.mode]], 'No favorites yet. Tap ♡ on something you like.');
});
const RD_SLEEP = [0, 15, 30, 60];
let rdSleepI = 0, rdSleepT = null;
rdSleep.addEventListener('click', () => {
    rdSleepI = (rdSleepI + 1) % RD_SLEEP.length;
    clearTimeout(rdSleepT);
    const m = RD_SLEEP[rdSleepI];
    rdSleep.textContent = m ? `⏾ ${m}m` : '⏾ Off';
    if (m) rdSleepT = setTimeout(() => {
        rdAudio.pause(); rdSleepI = 0; rdSleep.textContent = '⏾ Off'; rdSub.textContent = 'Sleep timer ended';
    }, m * 60000);
});

let rdDir = 'up';                                    


function rdPin() {
    const r = radio.getBoundingClientRect();
    radio.style.left = r.left + 'px';
    radio.style.right = 'auto';
    if (rdDir === 'up') { radio.style.top = 'auto'; radio.style.bottom = (window.innerHeight - r.bottom) + 'px'; }
    else { radio.style.bottom = 'auto'; radio.style.top = r.top + 'px'; }
}
function rdAnchor(dir) {
    rdDir = dir;
    radio.classList.toggle('up', dir === 'up');
    rdPin();
}
function rdChooseDir() {                          
    const r = radio.getBoundingClientRect();
    return (r.top - 84) > (window.innerHeight - r.bottom - 8) ? 'up' : 'down';
}
document.getElementById('rdFold').addEventListener('click', () => {
    const opening = !radio.classList.contains('open');
    if (opening) rdAnchor(rdChooseDir());           
    radio.classList.toggle('open', opening);
    rdStore.set('open', opening);
    if (opening && !rd.loaded) { rd.loaded = true; rdDefault(); }
});


const rdGrip = document.getElementById('rdGrip');
let rdDrag = false, rdDX = 0, rdDY = 0;
function rdPlace(x, y) {
    x = Math.max(8, Math.min(window.innerWidth - radio.offsetWidth - 8, x));
    y = Math.max(84, Math.min(window.innerHeight - radio.offsetHeight - 8, y));
    radio.style.left = x + 'px'; radio.style.top = y + 'px';
    radio.style.right = 'auto'; radio.style.bottom = 'auto';
}
rdGrip.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    e.stopPropagation();                            
    const r = radio.getBoundingClientRect();
    rdDrag = true; rdDX = e.clientX - r.left; rdDY = e.clientY - r.top;
    rdGrip.setPointerCapture(e.pointerId); radio.classList.add('dragging');
});
rdGrip.addEventListener('pointermove', (e) => { if (rdDrag) rdPlace(e.clientX - rdDX, e.clientY - rdDY); });
rdGrip.addEventListener('pointerup', () => {
    if (!rdDrag) return;
    rdDrag = false; radio.classList.remove('dragging');
    rdPin();                                        
    rdStore.set('pos', { x: parseFloat(radio.style.left), v: rdDir,
                         y: parseFloat(rdDir === 'up' ? radio.style.bottom : radio.style.top) });
});
function rdClamp() {                            
    const w = radio.offsetWidth, h = radio.offsetHeight;
    if (radio.style.left) radio.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, parseFloat(radio.style.left))) + 'px';
    if (rdDir === 'up' && radio.style.bottom && radio.style.bottom !== 'auto')
        radio.style.bottom = Math.max(8, Math.min(window.innerHeight - h - 84, parseFloat(radio.style.bottom))) + 'px';
    if (rdDir === 'down' && radio.style.top && radio.style.top !== 'auto')
        radio.style.top = Math.max(84, Math.min(window.innerHeight - h - 8, parseFloat(radio.style.top))) + 'px';
}
window.addEventListener('resize', rdClamp);

rdSetMode(rd.mode);
rdShufUI();
const rdPos = rdStore.get('pos', null);
if (rdPos && rdPos.v) {                          
    rdDir = rdPos.v;
    radio.classList.toggle('up', rdDir === 'up');
    radio.style.left = rdPos.x + 'px'; radio.style.right = 'auto';
    if (rdDir === 'up') { radio.style.top = 'auto'; radio.style.bottom = rdPos.y + 'px'; }
    else { radio.style.bottom = 'auto'; radio.style.top = rdPos.y + 'px'; }
    rdClamp();
}
if (rd.cur) { rdName.textContent = rd.cur.name; rdSub.textContent = 'Press play to resume'; rdUI(); }
if (rdStore.get('open', false)) document.getElementById('rdFold').click();
