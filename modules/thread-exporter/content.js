(function() {
    // מניעת הרצה כפולה
    if (window.hasRunThreadExporter) return;
    window.hasRunThreadExporter = true;

    // --- Turndown Library (Minified for brevity but functional) ---
    // (הוספתי כאן גרסה מקוצרת שעובדת, זה קריטי שזה יהיה באותו קובץ)
    var TurndownService=function(){"use strict";function e(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}function t(e,t){return Array(t+1).join(e)}function n(e){return e.replace(/^\n*/,"")}function r(e){var t=e.length;for(;t>0&&"\n"===e[t-1];)t--;return e.substring(0,t)}var i=["ADDRESS","ARTICLE","ASIDE","AUDIO","BLOCKQUOTE","BODY","CANVAS","CENTER","DD","DIR","DIV","DL","DT","FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","FRAMESET","H1","H2","H3","H4","H5","H6","HEADER","HGROUP","HR","HTML","ISINDEX","LI","MAIN","MENU","NAV","NOFRAMES","NOSCRIPT","OL","OUTPUT","P","PRE","SECTION","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","UL"],o=function(e){return u(e,i)},a=["AREA","BASE","BR","COL","COMMAND","EMBED","HR","IMG","INPUT","KEYGEN","LINK","META","PARAM","SOURCE","TRACK","WBR"],s=function(e){return u(e,a)},c=function(e){return l(e,a)},l=function(e,t){return e.getElementsByTagName&&t.some(function(t){return e.getElementsByTagName(t).length})},u=function(e,t){return t.indexOf(e.nodeName)>=0},h={paragraph:{filter:"p",replacement:function(e){return"\n\n"+e+"\n\n"}},lineBreak:{filter:"br",replacement:function(e,t,n){return n.br+"\n"}},heading:{filter:["h1","h2","h3","h4","h5","h6"],replacement:function(e,n,r){var i=Number(n.nodeName.charAt(1));return"setext"===r.headingStyle&&i<3?"\n\n"+e+"\n"+t(1===i?"=":"-",e.length)+"\n\n":"\n\n"+t("#",i)+" "+e+"\n\n"}},blockquote:{filter:"blockquote",replacement:function(e){return"\n\n"+(e=e.replace(/^\n+|\n+$/g,"")).replace(/^/gm,"> ")+"\n\n"}},list:{filter:["ul","ol"],replacement:function(e,t){var n=t.parentNode;return"LI"===n.nodeName&&n.lastElementChild===t?"\n"+e:"\n\n"+e+"\n\n"}},listItem:{filter:"li",replacement:function(e,t,n){e=e.replace(/^\n+/,"").replace(/\n+$/,"\n").replace(/\n/gm,"\n    ");var r=n.bulletListMarker+"   ",i=t.parentNode;if("OL"===i.nodeName){var o=i.getAttribute("start"),a=Array.prototype.indexOf.call(i.children,t);r=(o?Number(o)+a:a+1)+".  "}return r+e+(t.nextSibling&&!/\n$/.test(e)?"\n":"")}},indentedCodeBlock:{filter:function(e,t){return"indented"===t.codeBlockStyle&&"PRE"===e.nodeName&&e.firstChild&&"CODE"===e.firstChild.nodeName},replacement:function(e,t,n){return"\n\n    "+t.firstChild.textContent.replace(/\n/g,"\n    ")+"\n\n"}},fencedCodeBlock:{filter:function(e,t){return"fenced"===t.codeBlockStyle&&"PRE"===e.nodeName&&e.firstChild&&"CODE"===e.firstChild.nodeName},replacement:function(e,n,r){var i=n.firstChild.getAttribute("class")||"",o=(i.match(/language-(\S+)/)||[null,""])[1],a=n.firstChild.textContent,s=r.fence.charAt(0),c=3,l=new RegExp("^"+s+"{3,}","gm");var u;while(u=l.exec(a))u[0].length>=c&&(c=u[0].length+1);var h=t(s,c);return"\n\n"+h+o+"\n"+a.replace(/\n$/,"")+"\n"+h+"\n\n"}},horizontalRule:{filter:"hr",replacement:function(e,t,n){return"\n\n"+n.hr+"\n\n"}},inlineLink:{filter:function(e,t){return"inlined"===t.linkStyle&&"A"===e.nodeName&&e.getAttribute("href")},replacement:function(e,t){var n=t.getAttribute("href");n&&(n=n.replace(/([()])/g,"\\$1"));var r=t.getAttribute("title");return r&&(r=' "'+r.replace(/"/g,'\\"')+'"'),"["+e+"]("+n+(r||"")+")"}},referenceLink:{filter:function(e,t){return"referenced"===t.linkStyle&&"A"===e.nodeName&&e.getAttribute("href")},replacement:function(e,t,n){var r=t.getAttribute("href"),i=t.getAttribute("title");i&&(i=' "'+i+'"');var o,a;switch(n.linkReferenceStyle){case"collapsed":o="["+e+"][]",a="["+e+"]: "+r+i;break;case"shortcut":o="["+e+"]",a="["+e+"]: "+r+i;break;default:var s=this.references.length+1;o="["+e+"]["+s+"]",a="["+s+"]: "+r+i}return this.references.push(a),o},references:[],append:function(e){var t="";return this.references.length&&(t="\n\n"+this.references.join("\n")+"\n\n",this.references=[]),t}},emphasis:{filter:["em","i"],replacement:function(e,t,n){return e.trim()?n.emDelimiter+e+n.emDelimiter:""}},strong:{filter:["strong","b"],replacement:function(e,t,n){return e.trim()?n.strongDelimiter+e+n.strongDelimiter:""}},code:{filter:function(e){var t=e.previousSibling||e.nextSibling,n="PRE"===e.parentNode.nodeName&&!t;return"CODE"===e.nodeName&&!n},replacement:function(e){if(!e)return"";e=e.replace(/\r?\n|\r/g," ");var t=/^`|^ .*?[^ ].* $|`$/.test(e)?" ":"";return"`"+t+e+t+"`"}},image:{filter:"img",replacement:function(e,t){var n=t.getAttribute("alt"),r=t.getAttribute("src")||"",i=t.getAttribute("title");return r?"!["+n+"]("+r+(i?' "'+i+'"':"")+")":""}}};function p(e){this.options=e,this._keep=[],this._remove=[],this.blankRule={replacement:e.blankReplacement},this.keepReplacement=e.keepReplacement,this.defaultRule={replacement:e.defaultReplacement},this.array=[];for(var t in e.rules)this.array.push(e.rules[t])}p.prototype={add:function(e,t){this.array.unshift(t)},keep:function(e){this._keep.unshift({filter:e,replacement:this.keepReplacement})},remove:function(e){this._remove.unshift({filter:e,replacement:function(){return""}})},forNode:function(e){if(e.isBlank)return this.blankRule;var t;if(t=d(this.array,e,this.options))return t;if(t=d(this._keep,e,this.options))return t;if(t=d(this._remove,e,this.options))return t;return this.defaultRule},forEach:function(e){for(var t=0;t<this.array.length;t++)e(this.array[t],t)}};function d(e,t,n){for(var r=0;r<e.length;r++){var i=e[r];if(f(i,t,n))return i}return void 0}function f(e,t,n){var r=e.filter;if("string"==typeof r){if(r===t.nodeName.toLowerCase())return!0}else if(Array.isArray(r)){if(r.indexOf(t.nodeName.toLowerCase())>-1)return!0}else{if("function"!=typeof r)throw new TypeError("`filter` needs to be a string, array, or function");if(r.call(e,t,n))return!0}}function m(e){var t=e.element,n=e.isBlock,r=e.isVoid,i=e.isPre||function(e){return"PRE"===e.nodeName};if(t.firstChild&&!i(t)){var o=null,a=!1,s=null,c=v(s,t,i);while(c!==t)if(3===c.nodeType||4===c.nodeType){var l=c.data.replace(/[ \r\n\t]+/g," ");(!o||/ $/.test(o.data))&&!a&&" "===l[0]&&(l=l.substr(1)),l?(c.data=l,o=c):(c=g(c));continue}else if(1===c.nodeType)n(c)|| "BR"===c.nodeName?(o&&(o.data=o.data.replace(/ $/,"")),o=null,a=!1):r(c)||i(c)?(o=null,a=!0):o&&(a=!1);else{c=g(c);continue}var u=v(s,c,i);s=c,c=u;o&&(o.data=o.data.replace(/ $/,""),o.data||g(o))}}function g(e){var t=e.nextSibling||e.parentNode;return e.parentNode.removeChild(e),t}function v(e,t,n){return e&&e.parentNode===t||n(t)?t.nextSibling||t.parentNode:t.firstChild||t.nextSibling||t.parentNode}var y="undefined"!=typeof window?window:{};function b(){var e=y.DOMParser,t=!1;try{(new e).parseFromString("","text/html")&&(t=!0)}catch(n){}return t}function k(){var e=function(){};return function(){return e.prototype.parseFromString=function(e){var t=document.implementation.createHTMLDocument("");return t.open(),t.write(e),t.close(),t},e}(),e}var w=b()?y.DOMParser:k();function x(e,t){var n;if("string"==typeof e){n=(new w).parseFromString("<x-turndown id=\"turndown-root\">"+e+"</x-turndown>","text/html").getElementById("turndown-root")}else n=e.cloneNode(!0);return m({element:n,isBlock:o,isVoid:s,isPre:t.preformattedCode?N:null}),n}function N(e){return"PRE"===e.nodeName||"CODE"===e.nodeName}function S(e,t){return e.isBlock=o(e),e.isCode="CODE"===e.nodeName||e.parentNode.isCode,e.isBlank=E(e),e.flankingWhitespace=A(e,t),e}function E(e){return!s(e)&&!function(e){return u(e,["A","TABLE","THEAD","TBODY","TFOOT","TH","TD","IFRAME","SCRIPT","AUDIO","VIDEO"])}(e)&&/^\s*$/i.test(e.textContent)&&!c(e)&&!l(e,["A","TABLE","THEAD","TBODY","TFOOT","TH","TD","IFRAME","SCRIPT","AUDIO","VIDEO"])}function A(e,t){if(e.isBlock||t.preformattedCode&&e.isCode)return{leading:"",trailing:""};var n=function(e){var t=e.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);return{leading:t[1],leadingAscii:t[2],leadingNonAscii:t[3],trailing:t[4],trailingNonAscii:t[5],trailingAscii:t[6]}}(e.textContent);return n.leadingAscii&&C("left",e,t)&&(n.leading=n.leadingNonAscii),n.trailingAscii&&C("right",e,t)&&(n.trailing=n.trailingNonAscii),{leading:n.leading,trailing:n.trailing}}function C(e,t,n){var r,i,o;return"left"===e?(r=t.previousSibling,i=/ $/):(r=t.nextSibling,i=/^ /),!!r&&(3===r.nodeType?o=i.test(r.nodeValue):n.preformattedCode&&"CODE"===r.nodeName?o=!1:1===r.nodeType&&!u(r,["ADDRESS","ARTICLE","ASIDE","AUDIO","BLOCKQUOTE","BODY","CANVAS","CENTER","DD","DIR","DIV","DL","DT","FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","FRAMESET","H1","H2","H3","H4","H5","H6","HEADER","HGROUP","HR","HTML","ISINDEX","LI","MAIN","MENU","NAV","NOFRAMES","NOSCRIPT","OL","OUTPUT","P","PRE","SECTION","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","UL"])&&(o=i.test(r.textContent)),o)}var O=Array.prototype.reduce,L=[[/\\/g,"\\\\"],[/\*/g,"\\*"],[/^-/g,"\\-"],[/^\+ /g,"\\+ "],[/^(=+)/g,"\\$1"],[/^(#{1,6}) /g,"\\$1 "],[/`/g,"\\`"],[/^~~~/g,"\\~~~"],[/\[/g,"\\["],[/\]/g,"\\]"],[/^>/g,"\\>"],[/_/g,"\\_"],[/^(\d+)\. /g,"$1\\. "]];function T(n){if(!(this instanceof T))return new T(n);var r={rules:h,headingStyle:"setext",hr:"* * *",bulletListMarker:"*",codeBlockStyle:"indented",fence:"```",emDelimiter:"_",strongDelimiter:"**",linkStyle:"inlined",linkReferenceStyle:"full",br:"  ",preformattedCode:!1,blankReplacement:function(e,t){return t.isBlock?"\n\n":""},keepReplacement:function(e,t){return t.isBlock?"\n\n"+t.outerHTML+"\n\n":t.outerHTML},defaultReplacement:function(e,t){return t.isBlock?"\n\n"+e+"\n\n":e}};this.options=e({},r,n),this.rules=new p(this.options)}return T.prototype={turndown:function(e){if(!function(e){return null!=e&&("string"==typeof e||e.nodeType&&(1===e.nodeType||9===e.nodeType||11===e.nodeType))}(e))throw new TypeError(e+" is not a string, or an element/document/fragment node.");if(""===e)return"";var t=function(e){var t=this;return O.call(e.childNodes,function(e,n){return n=new S(n,t.options),""+(3===n.nodeType?n.isCode?n.nodeValue:t.escape(n.nodeValue):1===n.nodeType?function(e){var t=this.rules.forNode(e),n=function(e){var t=this;return O.call(e.childNodes,function(e,n){return n=new S(n,t.options),""+(3===n.nodeType?n.isCode?n.nodeValue:t.escape(n.nodeValue):1===n.nodeType?function(e){var t=this.rules.forNode(e),n=function(e){var t=this;return O.call(e.childNodes,function(e,n){return n=new S(n,t.options),""+(3===n.nodeType?n.isCode?n.nodeValue:t.escape(n.nodeValue):1===n.nodeType?function(e){var t=this.rules.forNode(e),n=M.call(this,e),r=e.flankingWhitespace;return r.leading||r.trailing&&(n=n.trim()),r.leading+t.replacement(n,e,this.options)+r.trailing}.call(t,n):M.call(t,n))},n)}return""}.call(this,e);var r=e.flankingWhitespace;return r.leading||r.trailing&&(n=n.trim()),r.leading+t.replacement(n,e,this.options)+r.trailing}.call(this,e):M.call(t,n))},n)}.call(this,n):M.call(t,n))},e)}(0);return t=function(e){var t=this;return this.rules.forEach(function(n){"function"==typeof n.append&&(e=j(e,n.append(t.options)))}),e.replace(/^[\t\r\n]+/,"").replace(/[\t\r\n\s]+$/,"")}.call(this,t)},use:function(e){if(Array.isArray(e))for(var t=0;t<e.length;t++)this.use(e[t]);else{if("function"!=typeof e)throw new TypeError("plugin must be a Function or an Array of Functions");e(this)}return this},addRule:function(e,t){return this.rules.add(e,t),this},keep:function(e){return this.rules.keep(e),this},remove:function(e){return this.rules.remove(e),this},escape:function(e){return L.reduce(function(e,t){return e.replace(t[0],t[1])},e)}},T}();
    function M(e){var t=this;return O.call(e.childNodes,function(e,n){return n=new S(n,t.options),j(e,3===n.nodeType?n.isCode?n.nodeValue:t.escape(n.nodeValue):1===n.nodeType?function(e){var t=this.rules.forNode(e),n=M.call(this,e),r=e.flankingWhitespace;return r.leading||r.trailing&&(n=n.trim()),r.leading+t.replacement(n,e,this.options)+r.trailing}.call(t,n):"")},"")}function j(e,t){var o=r(e),a=n(t),s=Math.max(e.length-o.length,t.length-a.length),c="\n\n".substring(0,s);return o+c+a}

    // --- הגדרות ---
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
    });
    
    turndownService.addRule('absoluteImages', {
        filter: 'img',
        replacement: function (content, node) {
            let src = node.getAttribute('src');
            if (src && !src.startsWith('http')) {
                try { src = new URL(src, location.origin).href; } catch (e) {}
            }
            const alt = node.alt || '';
            return `![${alt}](${src})`;
        }
    });

    turndownService.addRule('cleanBlockquotes', {
        filter: 'blockquote',
        replacement: function (content) {
            const cleanedContent = content.replace(/@\S+\s+כתב\s+ב.+:/, '').trim();
            const lines = cleanedContent.split('\n');
            return '\n' + lines.map(line => `> ${line}`).join('\n') + '\n\n';
        }
    });

    async function fetchAndProcessThread() {
        // ניסיון לשלוף נתונים מה-DOM אם ה-Window חסום
        let tid, title;
        
        // ננסה לקרוא מה-DOM או מה-URL
        const match = window.location.pathname.match(/topic\/(\d+)/);
        if (match) tid = match[1];
        
        const titleEl = document.querySelector('span[component="topic/title"]');
        title = titleEl ? titleEl.textContent.trim() : document.title;
        
        if (!tid) throw new Error("לא נמצא מזהה שרשור");

        // בקשות ל-API
        const paginationResponse = await fetch(`${location.origin}/api/topic/pagination/${tid}`);
        if (!paginationResponse.ok) throw new Error("שגיאה בקבלת נתונים");
        
        const paginationData = await paginationResponse.json();
        const pageCount = paginationData.pagination.pageCount;

        const pagePromises = [];
        for (let i = 1; i <= pageCount; i++) {
            pagePromises.push(
                fetch(`${location.origin}/api/topic/${tid}?page=${i}`).then(res => res.json())
            );
        }

        const allPagesData = await Promise.all(pagePromises);
        const allPosts = allPagesData.flatMap(pageData => pageData.posts);

        const processedPosts = allPosts
            .filter(post => post && !post.deleted)
            .map(post => {
                const contentMarkdown = turndownService.turndown(post.content || '').trim();
                return {
                    pid: post.pid,
                    author: post.user ? post.user.username : 'Unknown',
                    content: contentMarkdown
                };
            });

        return { posts: processedPosts, title: title };
    }

    // --- UI UI ---
    function createModal(title) {
        const existing = document.getElementById('nbe-modal-backdrop');
        if (existing) existing.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'nbe-modal-backdrop';
        backdrop.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; direction: rtl;`;

        backdrop.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; width: 400px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin-top:0;">ייצוא שרשור</h3>
                <p>${title}</p>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                    <button id="nbe-btn-copy" style="padding:10px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">העתק JSON</button>
                    <button id="nbe-btn-download" style="padding:10px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">הורד JSON</button>
                </div>
                <div id="nbe-status" style="margin-top:10px; font-size:12px;"></div>
                <button id="nbe-close" style="margin-top:15px; background:none; border:none; cursor:pointer; color:#666;">סגור</button>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.getElementById('nbe-close').onclick = () => backdrop.remove();
        backdrop.onclick = (e) => { if(e.target===backdrop) backdrop.remove(); };
        return backdrop;
    }

    function injectExportButton() {
        const container = document.querySelector('.sticky-tools .topic-main-buttons > div > div:first-child');
        if (!container || container.querySelector('.nbe-export-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost btn-sm ff-secondary d-flex gap-2 align-items-center nbe-export-btn';
        btn.innerHTML = `<i class="fa fa-fw fa-download text-primary"></i> <span class="d-none d-md-inline">ייצוא</span>`;
        
        btn.onclick = () => {
             const title = document.title;
             createModal(title);
             
             const handle = async (action) => {
                 const status = document.getElementById('nbe-status');
                 status.innerText = 'מעבד...';
                 try {
                     const data = await fetchAndProcessThread();
                     const json = JSON.stringify({ title: data.title, posts: data.posts }, null, 2);
                     
                     if (action === 'copy') {
                         await navigator.clipboard.writeText(json);
                         status.innerText = 'הועתק בהצלחה!';
                     } else {
                         const blob = new Blob([json], { type: 'application/json' });
                         const url = URL.createObjectURL(blob);
                         const a = document.createElement('a');
                         a.href = url;
                         a.download = (data.title.replace(/[^\w\u0590-\u05ff]/g, '_') || 'thread') + '.json';
                         a.click();
                         status.innerText = 'הורדה החלה!';
                     }
                 } catch(e) {
                     status.innerText = 'שגיאה: ' + e.message;
                     console.error(e);
                 }
             };

             document.getElementById('nbe-btn-copy').onclick = () => handle('copy');
             document.getElementById('nbe-btn-download').onclick = () => handle('download');
        };
        container.appendChild(btn);
    }

    function injectPostButtons() {
        const actionContainers = document.querySelectorAll('[component="post/actions"]:not(.nbe-processed)');
        actionContainers.forEach(container => {
            container.classList.add('nbe-processed');
            const btn = document.createElement('a');
            btn.href = '#';
            btn.className = 'btn btn-ghost btn-sm';
            btn.innerHTML = `<i class="fa fa-fw fa-clone text-primary"></i>`;
            btn.title = "העתק Markdown";
            btn.onclick = async (e) => {
                e.preventDefault();
                const postEl = container.closest('[component="post"]');
                const contentEl = postEl ? postEl.querySelector('[component="post/content"]') : null;
                if(contentEl) {
                    const md = turndownService.turndown(contentEl.innerHTML);
                    await navigator.clipboard.writeText(md);
                    const icon = btn.innerHTML;
                    btn.innerHTML = `<i class="fa fa-check text-success"></i>`;
                    setTimeout(() => btn.innerHTML = icon, 2000);
                }
            };
            container.appendChild(btn);
        });
    }

    const observer = new MutationObserver(() => {
        injectExportButton();
        injectPostButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    injectExportButton();
    injectPostButtons();
})();