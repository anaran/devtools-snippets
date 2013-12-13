// snippet consoleAutosave.js exported by devtools_import_export.js from
// Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1736.2 Safari/537.36
// at Fri Dec 13 2013 01:38:13 GMT+0100 (Westeuropäische Normalzeit)
/*jslint browser: true*/
/*globals URL: false, console: false */
    'use strict';
(function() {
    if (location.origin !== "chrome-devtools://devtools") {
        window.alert('To run devtools consoleAutosave snippet:\n\n* Undock Developer Tools into separate window\n* Press Ctrl+Shift+I to inspect it.\n* Run this snippet from there.');
    }
    if (localStorage.consoleAutosaveText && localStorage.consoleAutosaveTime) {
        var consoleAutosaveFileText =
            'chrome devtools autosave from ' + (new Date(Number(localStorage.consoleAutosaveTime))) + '\n\n' + localStorage.consoleAutosaveText;
        var consoleAutosaveBlob = new window.Blob([consoleAutosaveFileText], {
            'type': 'text/utf-8'
        });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(consoleAutosaveBlob);
        a.innerText = 'Download consoleAutosave';
        a.download = 'consoleAutosave' + Date.now() + '.txt';
        var popup = window.open();
        if (popup) {
            popup.document.title = "devtools console-messages autosave";
            popup.document.body.appendChild(a);
            popup.document.body.appendChild(document.createElement('pre')
                .appendChild(document.createTextNode(consoleAutosaveFileText)).parentElement);
        }
    }
    localStorage.consoleAutosaveText = '';
    var come = document.querySelectorAll('#console-messages');
    if (come.length === 1) {
        window.setInterval(function() {
            var come = document.querySelectorAll('#console-messages');
            if (come[0].innerText.length - localStorage.consoleAutosaveText.length > 20) {
                localStorage.consoleAutosaveTime = Date.now();
                localStorage.consoleAutosaveText = come[0].innerText;
            }
        }, 5000);
    } else {
        console.error(come);
    }
})();