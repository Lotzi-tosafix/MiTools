/* 
  קובץ הרישום המרכזי.
  כדי להוסיף פיצ'ר חדש:
  1. צור תיקייה ב-modules
  2. ייבא את קובץ ה-config שלו לכאן
  3. הוסף אותו למערך modules
*/

import * as DemoDarkMode from '../modules/demo-dark-mode/config.js';

export const availableModules = [
    DemoDarkMode
];

export function getModuleById(id) {
    return availableModules.find(m => m.config.id === id);
}