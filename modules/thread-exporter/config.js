export const config = {
    id: "thread_exporter",
    name: "ייצוא שרשורים (NodeBB)",
    description: "ייצוא שרשורים לקובץ JSON והעתקת קוד Markdown בקליק.",
    dir: "thread-exporter",
    matches: ["*://*/topic/*"], // רץ רק בתוך שרשורים
    jsFiles: ["content.js"],
    enabledByDefault: true
};