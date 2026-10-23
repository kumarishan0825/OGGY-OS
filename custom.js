
const DEFAULTS = { wall: 'oggy', accent: '#4285F4', blur: 10, clock: '12', seconds: false };
let settings = { ...DEFAULTS };
try {
     Object.assign(settings, JSON.parse(localStorage.getItem('oggyos.settings')));
     }
      catch (e) {}

const customBtn   = document.getElementById('customBtn');
const customPanel = document.getElementById('customPanel');

function saveSettings() {
    try {
         localStorage.setItem('oggyos.settings', JSON.stringify(settings)); 
        }
         catch (e) {}
}

function applySettings() {


    const root = document.documentElement.style;
    root.setProperty('--accent', settings.accent);
    root.setProperty('--blur', settings.blur + 'px');

    let wall = settings.wall;
    const mine = localStorage.getItem('oggyos.customWall');
    if (wall === 'custom' && !mine) wall = settings.wall = 'oggy';
    document.body.dataset.wall = wall;
    document.body.style.backgroundImage = wall === 'custom' ? 'url(' + mine + ')' : '';

    // keep the panel controls in sync
    customPanel.querySelectorAll('[data-wall]').forEach(b => b.classList.toggle('on', b.dataset.wall === wall));
    customPanel.querySelectorAll('[data-clock]').forEach(b => b.classList.toggle('on', b.dataset.clock === settings.clock));



    document.getElementById('accentPick').value = settings.accent;
    document.getElementById('blurRange').value = settings.blur;
    if (typeof updateTime === 'function') updateTime(); 
}


customBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    customPanel.classList.toggle('open');



});
document.addEventListener('click', (e) => {
    if (!customPanel.contains(e.target)) customPanel.classList.remove('open');
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') customPanel.classList.remove('open');
});


customPanel.addEventListener('click', (e) => {
    const w = e.target.closest('[data-wall]');
    const c = e.target.closest('[data-clock]');
    if (w) settings.wall = w.dataset.wall;
    if (c) settings.clock = c.dataset.clock;
    if (w || c) { applySettings(); saveSettings(); }
});


document.getElementById('accentPick').addEventListener('input', (e) => {
    settings.accent = e.target.value; applySettings(); saveSettings();
});
document.getElementById('blurRange').addEventListener('input', (e) => {
    settings.blur = Number(e.target.value); applySettings(); saveSettings();
});



document.getElementById('wallFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
             localStorage.setItem('oggyos.customWall', reader.result); 
            }
        catch (err) {
             alert('That image is too big to save. Try a smaller one.');
              return;
             }
        settings.wall = 'custom'; applySettings(); saveSettings();
    };
    reader.readAsDataURL(file);
});


document.getElementById('resetCustom').addEventListener('click', () => {
    settings = { ...DEFAULTS };
    localStorage.removeItem('oggyos.settings');
    localStorage.removeItem('oggyos.customWall');
    localStorage.removeItem('oggyos.seconds');
document.getElementById('secToggle').checked = false;
updateTime();
    applySettings();
});

applySettings();

const secBox = document.getElementById('secToggle');
secBox.checked = localStorage.getItem('oggyos.seconds') === '1';   

secBox.addEventListener('change', () => {
    localStorage.setItem('oggyos.seconds', secBox.checked ? '1' : '0');
    updateTime();                                                 
});