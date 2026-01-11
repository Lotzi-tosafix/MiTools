export const config = {
    id: "nodebb_dashboard",
    name: "מרכז הפורומים (Dashboard)",
    description: "מאחד את כל הפורומים שלך למקום אחד. מציג נושאים שלא נקראו מכולם.",
    dir: "nodebb-dashboard",
    matches: ["<all_urls>"], // צריך לרוץ בכל מקום כדי לזהות פורומים
    jsFiles: ["content.js"],
    enabledByDefault: false // זה כבד, ניתן למשתמש להפעיל
};