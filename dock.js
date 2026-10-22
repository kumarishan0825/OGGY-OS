(() => {
    const APPS = [
        ['googlewindow', 'Google', 'icons8-google-logo-48.png'],
        ['noteswindow', 'Notes' , 'icons8-notes-100.png'],
        ['calculatorwindow','Calculator', 'icons8-calculator-100.png'],
        ['cmdWindow', 'Terminal', 'icons8-command-prompt-100.png'],
        ['oggywindow', 'Oggy Game', 'icons8-oggy-48.png'],
    ];


    const hide_desk_icons = true;
    const CSS = `

    #oggy-dock{
    position: fixed;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    z-index: 9999;
    display:flex;
    align-items:flex-end;
    gap:24px;
    padding:14px 28px;
    border-radius:26px;
    background:rgba(255,255,255,.16);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
    border: 1px solid rgba(255,255,255,.28);
    box-shadow: 0 10px 30px rgba(0,0,0,.35)
    }

    #oggy-dock button{
    position:relative;
    width:52px;
    height:52px;
    padding:0;
    background:none;
    border:0;
    cursor:pointer;
    transition:transform .12s ease;
    transform-origin:50% 100%
    }

    #oggy-dock img{
    width:100%;
    height:100%;
    object-fit:contain;
    pointer-events:none;
    filter:drop-shadow(0 3px 5px rgba(0,0,0,.4))
    }

    #oggy-dock button.run::after{
    content:"";
    position:absolute;
    left: 50%;
    top: -30px;
    transform: translateX(-50%);
    padding:2px 9px;
    border-radius:6px;
    background:rgba(0,0,0,.8);
    color:fff;
    ont-size:12px;
    white-space:nowrap
    }

    .windowpanel{
    animation:oggyPop .22s cubic-bezier(.2, 1.3, .4, 1)
    }

    @keyframes oggyPop{
    from{
    opacity:0;
    transform:scale(.85)
    }}

    ${hide_desk_icons ? '#mydiv,#mydiv2,#mydiv3,#mydiv4,#mydiv5{display:none!important}' : ''}`;

  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const dock = document.createElement('nav');
    dock.id = 'oggy-dock';
    APPS.forEach(([id, title, img]) => {
      const b = document.createElement('button');
      b.dataset.win = id; b.title = title;
      b.innerHTML = `<img src="${img}" alt="${title}">`;
      dock.appendChild(b);
    });
        document.body.appendChild(dock);
        const btns = [...dock.children];
        let z = 100;
        const winOf = b => document.getElementById(b.dataset.win);
        const isOpen = w => getComputedStyle(w).display !== 'none';
        const sync = () => btns.forEach(b => {
            const w = winOf(b); b.classList.toggle('run', !!w && isOpen(w));
        });

        dock.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            const w = winOf(b);
            if(!w) return console.warn('[dock] no element with id', b.dataset.win);
            if(isOpen(w)) w.style.display = 'none';
            else {w.style.display = 'block'; w.style.zIndex = ++z; }
            sync();
        });

        document.querySelectorAll('.windowpanel').forEach(w => {
            new MutationObserver(sync).observe(w, { attributes: true, attributeFilter: ['style'] });
            w.addEventListener('mousedown', () => w.style.zIndex = ++z);
        });
        dock.addEventListener('mousemove', e => btns.forEach(b => {
            const r = b.getBoundingClientRect();
            const d = Math.abs(e.clientX - (r.left + r.width / 2));
            const s = 1 + Math.max(0, 1 - d / 150) * 0.6;
            b.style.transform = `translateY(${-(s - 1) * 14}px) scale(${s}) `;
        }));
        dock.addEventListener('mouseleave', () => btns.forEach(b => b.style.transform = ''));
        sync();
        console.log('[dock] ready');
    }
    document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
})();