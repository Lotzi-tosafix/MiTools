(function() {
    // 1. קבלת ההגדרות שהוזרקו על ידי המערכת
    // השם מורכב מ: SUPER_EXT + ID + SETTINGS
    const settings = window['SUPER_EXT_demo_dark_mode_SETTINGS'];

    if (!settings) {
        console.error('Settings not loaded for Dark Mode');
        return;
    }

    console.log('Dark Mode initialized with settings:', settings);

    // 2. ביצוע הפעולה (למשל, שינוי CSS)
    function applyStyles() {
        document.body.style.backgroundColor = settings.bgColor;
        document.body.style.color = settings.textColor;
        
        // סימון ויזואלי שהתוסף עובד
        const badge = document.createElement('div');
        badge.innerText = 'מצב לילה פעיל';
        badge.style.position = 'fixed';
        badge.style.bottom = '10px';
        badge.style.left = '10px';
        badge.style.background = settings.bgColor;
        badge.style.color = settings.textColor;
        badge.style.border = '1px solid white';
        badge.style.padding = '5px 10px';
        badge.style.zIndex = 999999;
        document.body.appendChild(badge);
    }

    // הפעלה
    applyStyles();

})();