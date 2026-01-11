(function() {
    if (window.hasRunNodeBBDash) return;
    window.hasRunNodeBBDash = true;

    const DASHBOARD_HASH = '#nodebb-dashboard';
    const DEFAULT_SITES = [{ name: 'מתמחים.טופ', url: 'https://mitmachim.top' }];

    // --- Helpers for Chrome Storage (Promisified) ---
    const storage = {
        get: (key) => new Promise(resolve => chrome.storage.local.get(key, r => resolve(r[key]))),
        set: (key, val) => chrome.storage.local.set({ [key]: val })
    };

    async function getSites() {
        const s = await storage.get('dash_sites');
        return s || DEFAULT_SITES;
    }

    async function addToIgnored(url) {
        const list = (await storage.get('dash_ignored')) || [];
        if (!list.includes(url)) {
            list.push(url);
            storage.set('dash_ignored', list);
        }
    }

    function isNodeBB() {
        // בדיקה בסיסית אם זה אתר NodeBB
        return document.querySelector('meta[name="generator"][content="NodeBB"]') !== null;
    }

    function getSiteName() {
        const parts = document.title.split('|');
        return parts.length > 1 ? parts.pop().trim() : document.title.trim();
    }

    // --- Main Logic ---
    async function init() {
        if (!isNodeBB()) return;

        if (window.location.hash === DASHBOARD_HASH) {
            injectDashboard();
        }

        window.addEventListener('hashchange', () => {
            if (window.location.hash === DASHBOARD_HASH) location.reload();
        });

        const currentUrl = window.location.origin;
        const sites = await getSites();
        const isMySite = sites.some(s => s.url === currentUrl);

        if (isMySite) {
            ensureMenuButton();
        } else {
            const ignored = (await storage.get('dash_ignored')) || [];
            if (!ignored.includes(currentUrl) && window.location.hash !== DASHBOARD_HASH) {
                showDiscoveryPopup(currentUrl);
            }
        }
    }

    function ensureMenuButton() {
        setInterval(() => {
            if (document.getElementById('nodebb-dash-link')) return;
            const nav = document.querySelector('#main-nav') || document.querySelector('.navbar-nav');
            if (nav) {
                const li = document.createElement('li');
                li.className = 'nav-item';
                li.innerHTML = `<a class="nav-link" href="${DASHBOARD_HASH}" id="nodebb-dash-link"><i class="fa fa-cubes"></i> מרכז הפורומים</a>`;
                nav.appendChild(li);
            }
        }, 1500);
    }

    function showDiscoveryPopup(url) {
        const div = document.createElement('div');
        div.style.cssText = `position:fixed; bottom:20px; right:20px; background:white; padding:15px; border:1px solid #ccc; box-shadow:0 5px 20px rgba(0,0,0,0.2); z-index:999999; direction:rtl; width:280px; border-radius:8px; font-family:sans-serif; text-align:right; color: #333;`;
        const title = getSiteName();
        div.innerHTML = `
            <div style="font-weight:bold; margin-bottom:10px;">זיהיתי פורום חדש!</div>
            <div style="font-size:13px; margin-bottom:10px;">להוסיף את <b>${title}</b> למרכז?</div>
            <div style="display:flex; gap:10px;">
                <button id="p-yes" style="flex:1; background:#28a745; color:white; border:none; padding:5px; border-radius:4px;">כן</button>
                <button id="p-no" style="flex:1; background:#dc3545; color:white; border:none; padding:5px; border-radius:4px;">לא</button>
            </div>`;
        document.body.appendChild(div);

        document.getElementById('p-yes').onclick = async () => {
            const s = await getSites();
            s.push({ name: title, url: url });
            await storage.set('dash_sites', s);
            div.remove();
            alert('נוסף!');
            location.reload();
        };
        document.getElementById('p-no').onclick = () => {
            addToIgnored(url);
            div.remove();
        };
    }

    function injectDashboard() {
        const contentDiv = document.getElementById('content');
        if (!contentDiv) { setTimeout(injectDashboard, 100); return; }
        document.title = "מרכז הפורומים";
        
        // CSS הזרקה
        const style = document.createElement('style');
        style.textContent = `
            #dash-wrapper { font-family: 'Assistant', sans-serif; direction: rtl; text-align: right; background: #fff; border-radius:4px; padding: 15px; min-height: 80vh; color: #333; }
            .dash-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px; }
            .d-topic { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #f0f0f0; }
            .d-topic:hover { background: #f9f9f9; }
            .d-link { font-weight: bold; color: #333; text-decoration: none; font-size: 16px; }
            .d-meta { font-size: 12px; color: #777; margin-top: 4px; }
            .d-btn { padding: 5px 10px; cursor: pointer; border: none; border-radius: 4px; margin-left:5px;}
            .bg-blue { background: #007bff; color: white; }
            .bg-gray { background: #eee; color: #333; }
            .d-badge { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
        `;
        document.head.appendChild(style);

        contentDiv.innerHTML = `
            <div id="dash-wrapper">
                <div class="dash-header">
                    <h2>מרכז הפורומים</h2>
                    <div>
                        <button class="d-btn bg-gray" id="dash-set-btn">הגדרות</button>
                        <button class="d-btn bg-blue" id="dash-ref-btn">רענן</button>
                    </div>
                </div>
                <div id="dash-list" style="padding: 20px; text-align: center;">טוען...</div>
            </div>
            <div id="dash-settings" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); align-items:center; justify-content:center; z-index:99999;">
                <div style="background:white; padding:20px; border-radius:8px; width:400px; max-height:80vh; overflow:auto;">
                    <h4>ניהול אתרים</h4>
                    <div id="site-list-ui"></div>
                    <button id="close-s" style="margin-top:10px;" class="d-btn bg-gray">סגור</button>
                </div>
            </div>
        `;

        loadDashboardContent();
        document.getElementById('dash-ref-btn').onclick = loadDashboardContent;
        document.getElementById('dash-set-btn').onclick = openSettings;
        document.getElementById('close-s').onclick = () => document.getElementById('dash-settings').style.display = 'none';
    }

    async function loadDashboardContent() {
        const container = document.getElementById('dash-list');
        const sites = await getSites();
        container.innerHTML = 'טוען נתונים...';
        
        const promises = sites.map(site => fetchUnread(site));
        const results = await Promise.all(promises);
        const all = [].concat(...results);
        
        all.sort((a,b) => new Date(b.lastposttimeISO) - new Date(a.lastposttimeISO));

        if (all.length === 0) {
            container.innerHTML = 'הכל נקרא! (או שיש שגיאת התחברות)';
            return;
        }

        container.innerHTML = '';
        all.forEach(t => {
            const row = document.createElement('div');
            row.className = 'd-topic';
            const iconUrl = `https://icons.duckduckgo.com/ip3/${new URL(t.origin.url).hostname}.ico`;
            
            row.innerHTML = `
                <div style="margin-left:15px;">
                    <img src="${iconUrl}" style="width:24px; height:24px;">
                </div>
                <div style="flex:1;">
                    <a href="${t.origin.url}/topic/${t.slug}" target="_blank" class="d-link">${t.title}</a>
                    <div class="d-meta">
                        <span class="d-badge">${t.origin.name}</span>
                        • ${t.user.username} • <i class="fa fa-eye"></i> ${t.viewcount}
                    </div>
                </div>
            `;
            container.appendChild(row);
        });
    }

    function fetchUnread(site) {
        return new Promise(resolve => {
            // שליחת הודעה ל-Background לביצוע ה-Fetch
            chrome.runtime.sendMessage({ 
                type: 'FETCH_URL', 
                url: site.url.replace(/\/$/, "") + '/api/unread' 
            }, response => {
                if (response && response.success) {
                    try {
                        const json = JSON.parse(response.data);
                        resolve((json.topics || []).map(t => ({ ...t, origin: site })));
                    } catch(e) { resolve([]); }
                } else {
                    resolve([]);
                }
            });
        });
    }

    async function openSettings() {
        const ui = document.getElementById('site-list-ui');
        ui.innerHTML = '';
        const sites = await getSites();
        sites.forEach((s, i) => {
            const row = document.createElement('div');
            row.style.cssText = "display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #eee;";
            row.innerHTML = `<span>${s.name}</span> <button class="d-btn bg-gray" style="color:red;">X</button>`;
            row.querySelector('button').onclick = async () => {
                sites.splice(i, 1);
                await storage.set('dash_sites', sites);
                openSettings();
            };
            ui.appendChild(row);
        });
        document.getElementById('dash-settings').style.display = 'flex';
    }

    init();
})();