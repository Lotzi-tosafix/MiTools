export const config = {
    id: "demo_dark_mode", // חייב להיות ייחודי באנגלית ללא רווחים
    name: "מצב לילה להדגמה",
    description: "צובע את הרקע והטקסט בצבעים מותאמים אישית",
    dir: "demo-dark-mode", // שם התיקייה בדיוק
    
    // באילו אתרים זה יפעל?
    matches: ["<all_urls>"],
    
    // קבצים לטעינה
    jsFiles: ["content.js"],
    // cssFiles: ["style.css"], // אפשר גם CSS
    
    enabledByDefault: false,

    // סכמת ההגדרות (JSON Schema)
    settings: [
        {
            key: "bgColor",
            type: "color",
            label: "צבע רקע",
            default: "#333333"
        },
        {
            key: "textColor",
            type: "color",
            label: "צבע טקסט",
            default: "#ffffff"
        },
        {
            key: "intensity",
            type: "range",
            label: "עוצמת כהות (דמה)",
            min: 10,
            max: 100,
            default: 80
        }
    ]
};