import { availableModules } from '../core/registry.js';

// DOM Elements
const modulesList = document.getElementById('modules-list');
const backBtn = document.getElementById('back-btn');
const searchInput = document.getElementById('search-input');
const settingsTitle = document.getElementById('settings-title');
const settingsForm = document.getElementById('settings-form');
const themeBtn = document.getElementById('theme-btn');

// State
let allModules = availableModules;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. טעינת הגדרות שמורות
    const savedData = await chrome.storage.sync.get(null);
    
    // 2. ניהול מצב כהה (Dark Mode)
    // בדיקה אם המשתמש שמר מצב כהה בעבר
    const isDark = (savedData.theme === 'dark'); 
    updateThemeUI(isDark);

    // 3. בניית רשימת המודולים
    renderModulesList(savedData);
    
    // 4. האזנה לחיפוש
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.module-item');
        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });

    // 5. כפתור חזור
    backBtn.addEventListener('click', closeSettings);

    // 6. כפתור החלפת ערכת נושא
    themeBtn.addEventListener('click', () => {
        const isCurrentlyDark = document.body.classList.contains('dark-mode');
        const newMode = !isCurrentlyDark;
        
        updateThemeUI(newMode);
        
        // שמירה בזיכרון
        chrome.storage.sync.set({ theme: newMode ? 'dark' : 'light' });
    });
});

// פונקציה לעדכון המראה (UI) של מצב כהה/בהיר
function updateThemeUI(isDark) {
    // הוספה או הסרה של הקלאס ב-body
    document.body.classList.toggle('dark-mode', isDark);
    
    // שינוי האייקון בכפתור
    if (isDark) {
        // אייקון שמש (למצב כהה)
        themeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
        // אייקון ירח (למצב בהיר)
        themeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
}

function renderModulesList(storageData) {
    modulesList.innerHTML = '';
    
    allModules.forEach(mod => {
        const config = mod.config;
        const isEnabled = storageData[`${config.id}_enabled`] ?? config.enabledByDefault;

        const li = document.createElement('li');
        li.className = 'module-item';
        
        // יצירת אלמנט הרשימה
        li.innerHTML = `
            <div class="module-info">
                <div class="module-name">${config.name}</div>
                <div class="module-desc">${config.description}</div>
            </div>
            <div class="module-actions">
                ${config.settings && config.settings.length > 0 ? `
                    <button class="icon-btn settings-btn" ${!isEnabled ? 'disabled style="opacity:0.3"' : ''}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                ` : ''}
                <label class="switch">
                    <input type="checkbox" class="toggle-feature" ${isEnabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `;

        // הוספת לוגיקה לאלמנטים שנוצרו
        const toggle = li.querySelector('.toggle-feature');
        const settingsBtn = li.querySelector('.settings-btn');

        // שינוי מצב הפעלה
        toggle.addEventListener('change', async (e) => {
            const newState = e.target.checked;
            await chrome.storage.sync.set({ [`${config.id}_enabled`]: newState });
            
            // עדכון כפתור ההגדרות (אם קיים)
            if(settingsBtn) {
                if(newState) {
                    settingsBtn.removeAttribute('disabled');
                    settingsBtn.style.opacity = '1';
                } else {
                    settingsBtn.setAttribute('disabled', 'true');
                    settingsBtn.style.opacity = '0.3';
                }
            }
            
            // רענון הטאב הפעיל כדי שהשינויים יחולו מיד (אופציונלי)
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if(tabs[0]) chrome.tabs.reload(tabs[0].id);
            });
        });

        // כניסה להגדרות
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                openSettings(mod, storageData);
            });
        }

        modulesList.appendChild(li);
    });
}

function openSettings(module, storageData) {
    settingsTitle.innerText = `הגדרות: ${module.config.name}`;
    settingsForm.innerHTML = ''; // ניקוי טופס ישן
    
    // יצירת שדות טופס דינמית
    if (module.config.settings) {
        module.config.settings.forEach(field => {
            const container = document.createElement('div');
            container.className = 'form-group';
            
            const label = document.createElement('label');
            label.className = 'form-label';
            label.innerText = field.label;
            
            let input;
            const storageKey = `${module.config.id}_${field.key}`;
            // שימוש בערך השמור או בברירת המחדל
            const value = storageData[storageKey] !== undefined ? storageData[storageKey] : field.default;

            if (field.type === 'text' || field.type === 'number') {
                input = document.createElement('input');
                input.type = field.type;
                input.className = 'form-input-text';
                input.value = value;
            } else if (field.type === 'color') {
                input = document.createElement('input');
                input.type = 'color';
                input.className = 'form-input-color';
                input.value = value;
            } else if (field.type === 'range') {
                input = document.createElement('input');
                input.type = 'range';
                input.className = 'form-input-range';
                input.min = field.min || 0;
                input.max = field.max || 100;
                input.value = value;
            } else if (field.type === 'select') {
                input = document.createElement('select');
                input.className = 'form-select';
                field.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.innerText = opt.text;
                    if (opt.value === value) option.selected = true;
                    input.appendChild(option);
                });
            }

            // שמירה אוטומטית בשינוי
            input.addEventListener('change', (e) => {
                chrome.storage.sync.set({ [storageKey]: e.target.value });
                // עדכון האובייקט המקומי כדי שההגדרות ישמרו במעבר בין מסכים ללא רענון
                storageData[storageKey] = e.target.value;
            });

            container.appendChild(label);
            container.appendChild(input);
            settingsForm.appendChild(container);
        });
    }

    // אנימציה
    document.body.classList.add('in-settings');
    backBtn.classList.remove('hidden');
}

function closeSettings() {
    document.body.classList.remove('in-settings');
    setTimeout(() => {
        backBtn.classList.add('hidden');
    }, 300); // המתנה לסיום האנימציה
}