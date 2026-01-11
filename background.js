import { availableModules } from './core/registry.js';

// בעת התקנה ראשונית - אתחול הגדרות ברירת מחדל
chrome.runtime.onInstalled.addListener(async () => {
    const defaults = {};
    availableModules.forEach(mod => {
        // מצב פעיל/כבוי ברירת מחדל
        defaults[`${mod.config.id}_enabled`] = mod.config.enabledByDefault || false;
        
        // הגדרות פנימיות ברירת מחדל
        if (mod.config.settings) {
            mod.config.settings.forEach(setting => {
                defaults[`${mod.config.id}_${setting.key}`] = setting.default;
            });
        }
    });

    // שמירה רק של מה שטרם הוגדר
    const current = await chrome.storage.sync.get(null);
    const final = { ...defaults, ...current };
    await chrome.storage.sync.set(final);
    console.log('MiTools Initialized with:', final);
});

// מאזין לטעינת דפים כדי להזריק סקריפטים
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        await injectActiveModules(tabId, tab.url);
    }
});

async function injectActiveModules(tabId, url) {
    const storage = await chrome.storage.sync.get(null);
    
    for (const mod of availableModules) {
        const isEnabled = storage[`${mod.config.id}_enabled`];
        
        if (isEnabled) {
            if (isUrlMatch(url, mod.config.matches)) {
                console.log(`Injecting module: ${mod.config.id}`);
                
                try {
                    // הזרקת CSS
                    if (mod.config.cssFiles) {
                        await chrome.scripting.insertCSS({
                            target: { tabId: tabId },
                            files: mod.config.cssFiles.map(f => `modules/${mod.config.dir}/${f}`)
                        });
                    }

                    // הזרקת JS
                    if (mod.config.jsFiles) {
                        const moduleSettings = {};
                        if (mod.config.settings) {
                            mod.config.settings.forEach(s => {
                                moduleSettings[s.key] = storage[`${mod.config.id}_${s.key}`];
                            });
                        }

                        await chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            func: (id, settings) => {
                                window[`SUPER_EXT_${id}_SETTINGS`] = settings;
                            },
                            args: [mod.config.id, moduleSettings]
                        });

                        await chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: mod.config.jsFiles.map(f => `modules/${mod.config.dir}/${f}`)
                        });
                    }
                } catch (err) {
                    console.error(`Failed to inject ${mod.config.id}:`, err);
                }
            }
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

// === תוספת עבור NodeBB+ (טיפול בבקשות רשת חוצות דומיינים) ===
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'NODEBB_FETCH') {
        fetch(request.url, {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        })
        .then(response => {
            if (request.responseType === 'blob') {
                return response.blob().then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => sendResponse({ success: true, data: reader.result, isBlob: true });
                    reader.readAsDataURL(blob);
                });
            } else {
                return response.text().then(text => sendResponse({ success: true, data: text }));
            }
        })
        .catch(error => sendResponse({ success: false, error: error.toString() }));
        
        return true; // מסמן שהתשובה היא אסינכרונית
    }
});