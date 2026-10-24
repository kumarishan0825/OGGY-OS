
const earthPanel  = document.getElementById('earthPanel');
const earthHandle = document.getElementById('earthHandle');
const earthSub    = document.getElementById('earthSub');
const EARTH_START = { IN: [22.6, 79.0, 4], US: [39.8, -98.6, 4], GB: [54.3, -2.5, 5], AU: [-25.3, 134.5, 4], CA: [56.1, -106.3, 3] };
let earthMap = null, earthPin = null, earthCur = null, earthSat = true, earthLoading = null;
const earthLayers = {};

function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (earthLoading) return earthLoading;
    earthLoading = new Promise((resolve, reject) => {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(css);
        const js = document.createElement('script');
        js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        js.onload = resolve;
        js.onerror = () => { earthLoading = null; reject(new Error('Leaflet failed to load')); };
        document.head.appendChild(js);
    });
    return earthLoading;
}

const fmtCoord = (n) => n.toFixed(5) + '°';
function paintCoords(lat, lng) {
    document.getElementById('eLat').textContent = fmtCoord(lat);
    document.getElementById('eLng').textContent = fmtCoord(lng);
}

function setPin(lat, lng, zoomTo) {
    lat = Math.max(-90, Math.min(90, lat));
    lng = ((lng + 540) % 360) - 180;                  
    earthCur = { lat, lng };
    paintCoords(lat, lng);
    document.getElementById('eEarth').href = `https://earth.google.com/web/@${lat},${lng},0a,1500d,35y,0h,0t,0r`;
    document.getElementById('eMaps').href  = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    if (earthPin) earthPin.setLatLng([lat, lng]);
    else earthPin = L.marker([lat, lng], { icon: L.divIcon({ className: 'earth-pin', html: '<i></i>', iconSize: [22, 22] }) }).addTo(earthMap);
    if (zoomTo) earthMap.flyTo([lat, lng], Math.max(earthMap.getZoom(), zoomTo), { duration: 1.4 });
    try { localStorage.setItem('oggyos.earth', JSON.stringify(earthCur)); } catch (e) {}
}

async function initEarth() {
    if (earthMap) { setTimeout(() => earthMap.invalidateSize(), 750); return; }
    try { await loadLeaflet(); }
    catch (e) { earthSub.textContent = 'Map could not load. Check your internet.'; return; }

    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('oggyos.earth')); } catch (e) {}
    const reg = (typeof region !== 'undefined' && EARTH_START[region]) ? region : 'IN';
    const start = saved ? [saved.lat, saved.lng, 8] : EARTH_START[reg];

    earthMap = L.map('earthMap', { zoomControl: false, worldCopyJump: true }).setView([start[0], start[1]], start[2]);
    L.control.zoom({ position: 'bottomleft' }).addTo(earthMap);
    earthLayers.sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, attribution: 'Tiles © Esri, Maxar, Earthstar Geographics' });
    earthLayers.street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap contributors' });
    earthLayers.sat.addTo(earthMap);

    earthMap.on('click', (e) => { setPin(e.latlng.lat, e.latlng.lng, 0); earthSub.textContent = 'Pin dropped'; });
    earthMap.on('mousemove', (e) => paintCoords(e.latlng.lat, e.latlng.lng));       // live cursor coordinates
    earthMap.on('mouseout', () => { if (earthCur) paintCoords(earthCur.lat, earthCur.lng); });
    if (saved) setPin(saved.lat, saved.lng, 0);
    setTimeout(() => earthMap.invalidateSize(), 750);
}

/* open / close */
function setEarth(open) {
    earthPanel.classList.toggle('open', open);
    earthHandle.classList.toggle('open', open);
    earthPanel.setAttribute('aria-hidden', String(!open));
    earthHandle.setAttribute('aria-expanded', String(open));
    if (open) initEarth();
}
earthHandle.addEventListener('click', () => setEarth(!earthPanel.classList.contains('open')));
document.getElementById('earthClose').addEventListener('click', () => setEarth(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setEarth(false); });

let ex = 0, ey = 0, eTrack = false, eInPanel = false;
document.addEventListener('pointerdown', (e) => {
    ex = e.clientX; ey = e.clientY; eTrack = true;
    eInPanel = earthPanel.contains(e.target) && !e.target.closest('#earthMap');
});
document.addEventListener('pointerup', (e) => {
    if (!eTrack) return;
    eTrack = false;
    const dx = e.clientX - ex, dy = Math.abs(e.clientY - ey);
    if (dy > 60) return;
    if (ex >= window.innerWidth - 28 && dx < -70) setEarth(true);
    else if (eInPanel && dx > 70) setEarth(false);
});


async function earthSearch(q) {
    const m = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) {
        const lat = Number(m[1]), lng = Number(m[2]);
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) { earthSub.textContent = 'Latitude is -90 to 90, longitude is -180 to 180'; return; }
        setPin(lat, lng, 10); earthSub.textContent = 'Jumped to coordinates'; return;
    }
    earthSub.textContent = 'Searching…';
    try {
        const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q));
        const d = await res.json();
        if (!d.length) throw new Error('none');
        setPin(Number(d[0].lat), Number(d[0].lon), 11);
        earthSub.textContent = d[0].display_name.split(',').slice(0, 2).join(',');
    } catch (err) { earthSub.textContent = 'Place not found'; }
}
document.getElementById('earthSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('earthQ').value.trim();
    if (q && earthMap) earthSearch(q);
});


document.getElementById('earthLocate').addEventListener('click', () => {
    if (!earthMap || !navigator.geolocation) { earthSub.textContent = 'Location is not available'; return; }
    earthSub.textContent = 'Finding you…';
    navigator.geolocation.getCurrentPosition(
        (p) => { setPin(p.coords.latitude, p.coords.longitude, 13); earthSub.textContent = 'You are here'; },
        () => { earthSub.textContent = 'Location permission was denied'; },
        { timeout: 10000 }
    );
});
document.getElementById('earthLayer').addEventListener('click', (e) => {
    if (!earthMap) return;
    earthMap.removeLayer(earthSat ? earthLayers.sat : earthLayers.street);
    earthSat = !earthSat;
    (earthSat ? earthLayers.sat : earthLayers.street).addTo(earthMap);
    e.currentTarget.textContent = earthSat ? '🗺' : '🛰';
});
document.getElementById('eCopy').addEventListener('click', (e) => {
    if (!earthCur) return;
    navigator.clipboard.writeText(`${earthCur.lat.toFixed(6)}, ${earthCur.lng.toFixed(6)}`).then(() => {
        e.currentTarget.textContent = 'Copied ✓';
        setTimeout(() => e.currentTarget.textContent = 'Copy', 1200);
    });
})