import { availableModules } from '../core/registry.js';

// DOM Elements
const modulesList = document.getElementById('modules-list');
const backBtn = document.getElementById('back-btn');
const searchInput = document.getElementById('search-input');
const settingsTitle = document.getElementById('settings-title');
const settingsForm = document.getElementById('settings-form');

// State
let allModules = availableModules;

document.addEventListener('DOMContentLoaded', async () => {
    // טעינת הגדרות שמורות
    const savedData = await chrome.storage.sync.get(null);
    renderModulesList(savedData);
    
    // חיפוש
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.module-item');
        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });

    // כפתור חזור
    backBtn.addEventListener('click', closeSettings);
});

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

        // הוספת לוגיקה
        const toggle = li.querySelector('.toggle-feature');
        const settingsBtn = li.querySelector('.settings-btn');

        // שינוי מצב הפעלה
        toggle.addEventListener('change', async (e) => {
            const newState = e.target.checked;
            await chrome.storage.sync.set({ [`${config.id}_enabled`]: newState });
            
            // עדכון כפתור ההגדרות
            if(settingsBtn) {
                if(newState) {
                    settingsBtn.removeAttribute('disabled');
                    settingsBtn.style.opacity = '1';
                } else {
                    settingsBtn.setAttribute('disabled', 'true');
                    settingsBtn.style.opacity = '0.3';
                }
            }
            
            // הודעה לרקע לטעון מחדש (אופציונלי, לרוב רענון דף מספיק)
            chrome.runtime.sendMessage({ type: 'STATUS_CHANGED', id: config.id, active: newState });
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
    module.config.settings.forEach(field => {
        const container = document.createElement('div');
        container.className = 'form-group';
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.innerText = field.label;
        
        let input;
        const storageKey = `${module.config.id}_${field.key}`;
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
        });

        container.appendChild(label);
        container.appendChild(input);
        settingsForm.appendChild(container);
    });

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