import { availableModules } from './core/registry.js';

// אתחול
chrome.runtime.onInstalled.addListener(async () => {
    const defaults = { theme: 'light' }; // ברירת מחדל בהירה
    availableModules.forEach(mod => {
        defaults[`${mod.config.id}_enabled`] = mod.config.enabledByDefault || false;
        if (mod.config.settings) {
            mod.config.settings.forEach(setting => {
                defaults[`${mod.config.id}_${setting.key}`] = setting.default;
            });
        }
    });

    const current = await chrome.storage.sync.get(null);
    const final = { ...defaults, ...current };
    await chrome.storage.sync.set(final);
    console.log('MiTools Initialized');
});

// מאזין להודעות (עבור Dashboard Fetch)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_URL') {
        fetch(request.url, { method: 'GET', headers: { "Content-Type": "application/json" } })
            .then(response => {
                if(request.responseType === 'blob') return response.blob();
                return response.text();
            })
            .then(data => {
                if(request.responseType === 'blob') {
                    // המרה ל-DataURL כדי להעביר חזרה לתוכן
                    const reader = new FileReader();
                    reader.onloadend = () => sendResponse({ success: true, data: reader.result, isBlob: true });
                    reader.readAsDataURL(data);
                } else {
                    sendResponse({ success: true, data: data });
                }
            })
            .catch(error => sendResponse({ success: false, error: error.toString() }));
        return true; // נדרש עבור תגובה אסינכרונית
    }
});

// מאזין לטעינת דפים
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        await injectActiveModules(tabId, tab.url);
    }
});

async function injectActiveModules(tabId, url) {
    const storage = await chrome.storage.sync.get(null);
    
    for (const mod of availableModules) {
        if (storage[`${mod.config.id}_enabled`] && isUrlMatch(url, mod.config.matches)) {
            try {
                if (mod.config.cssFiles) {
                    await chrome.scripting.insertCSS({
                        target: { tabId: tabId },
                        files: mod.config.cssFiles.map(f => `modules/${mod.config.dir}/${f}`)
                    });
                }
                if (mod.config.jsFiles) {
                    // הזרקת הגדרות
                    const moduleSettings = {};
                    if (mod.config.settings) {
                        mod.config.settings.forEach(s => {
                            moduleSettings[s.key] = storage[`${mod.config.id}_${s.key}`];
                        });
                    }
                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: (id, settings) => { window[`SUPER_EXT_${id}_SETTINGS`] = settings; },
                        args: [mod.config.id, moduleSettings]
                    });
                    // הזרקת הקוד
                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: mod.config.jsFiles.map(f => `modules/${mod.config.dir}/${f}`)
                    });
                }
            } catch (err) { console.error(`Inject Error ${mod.config.id}:`, err); }
        }
    }
}

function isUrlMatch(url, patterns) {
    if (!patterns || patterns.includes('<all_urls>')) return true;
    return patterns.some(pattern => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(url);
    });
}