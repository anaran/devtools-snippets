// snippet autosaveParent.js exported by devtools_import_export.js from
// Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1738.0 Safari/537.36
// at Sun Dec 15 2013 16:57:42 GMT+0100 (Westeuropäische Normalzeit)
/*jslint browser: true*/
/*globals Cc: false, Ci: false, Components: false, Cu: false, content: false, gBrowser:false, FileUtils: false,
NetUtil: false, URL: false, console: false */
    'use strict';
// Normalize comments because Format JS cannot do that yet.
// From:^(\s*//\s)(\s+):To:$1:
(function() {
    var r, s, myDocument, popup, popupFeatures = '', // width=250,height=120',
        come, text, autosaveInterval = 5000,
        supportedProtocolRegExp = /^https?:$/;
    var /*localStorage.*/
    autosaveElementText, /*localStorage.*/
    autosaveElementPath, /*localStorage.*/
    autosaveElementTime, autosaveElementFileText, autosaveElementBlob, firefoxAutosaveFile;
    var getElementPath = function getElementPath(element, path) {
        if (!path) {
            path = "";
        }
        // console.trace();
        if (!element) {
            return path;
        } else {
            var elementSelector = element.localName + (element.id ? '#' + element.id : "") + (element.className.length ? '.' + element.className.replace(/ /g, '.') : "");
            return getElementPath(element.parentElement, elementSelector + " " + path);
        }
    };
    // TODO firefox hud outputNode has three children per line:
    // timestamp, icon (in, out, error, warning, log), message
    var getText = function(node) {
        if (node.nodeType === document.TEXT_NODE) {
            return node.data;
        }
        var txt = '';
        if (node.nodeType === document.ELEMENT_NODE) {
            if (node = node.firstChild) do {
                var cs;
                try {
                    cs = window.getComputedStyle(node);
                } catch (exception) {
                    //                     console.log(exception.stack);
                }
                txt += getText(node);
                if (cs && cs.display === 'block') {
                    // console.log(cs.display);
                    txt += '\n';
                }
            } while (node = node.nextSibling);
        }
        return txt;
    };
    // When Scratchpad is in Browser Context:
    // "location.protocol" "chrome:"
    // In webconsole.js
    // execute: function JST_execute(aExecuteString, aCallback)
    // {
    // I find in this.history:
    // 1:"window.querySelector('div#output-container')"
    var gDevTools = window.hasOwnProperty('Cu') && Cu.import("resource:///modules/devtools/gDevTools.jsm", {}).gDevTools;
    var tools = window.hasOwnProperty('Cu') && Cu.import("resource://gre/modules/devtools/Loader.jsm", {}).devtools;
    var target = tools && tools.TargetFactory.forTab(gBrowser.selectedTab);
    var toolbox = target && gDevTools.getToolbox(target);
    var panel = toolbox && toolbox.getPanel("webconsole");
    if (panel) {
        var getLocalDirectory = function(directory) {
            let directoryService = Cc["@mozilla.org/file/directory_service;1"].
            getService(Ci.nsIProperties);
            // this is a reference to the profile dir (ProfD) now.
            let localDir = directoryService.get("ProfD", Ci.nsIFile);

            localDir.append(directory);

            if (!localDir.exists() || !localDir.isDirectory()) {
                // read and write permissions to owner and group, read-only for others.
                localDir.create(Ci.nsIFile.DIRECTORY_TYPE, /*0774*/ 508);
            }

            return localDir;
        };
        var getFile = function(file, directory) {
            let myFile = getLocalDirectory(directory);

            myFile.append(file);
            // do stuff with the file.
            if (!myFile.exists()) {
                // read and write permissions to owner and group, read-only for others.
                myFile.create(Ci.nsIFile.NORMAL_FILE_TYPE, /*0664*/ 436);
            }
            return myFile;
        };

        var readFile = function(file, callback) {
            Components.utils.import("resource://gre/modules/NetUtil.jsm");
            // See https://developer.mozilla.org/en-US/Add-ons/Code_snippets/File_I_O?redirectlocale=en-US&redirectslug=Code_snippets%2FFile_I_O
            // for Read with content type hint, which I don't use yet.
            //var channel = NetUtil.newChannel(file);
            //channel.contentType = "application/json";
            //
            //NetUtil.asyncFetch(channel, function(inputStream, status) {
            NetUtil.asyncFetch(file, callback);
        };

        var writeFile = function(file, data) {
            Components.utils.import("resource://gre/modules/NetUtil.jsm");
            Components.utils.import("resource://gre/modules/FileUtils.jsm");

            // file is nsIFile, data is a string

            // You can also optionally pass a flags parameter here. It defaults to
            // FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE;
            var ostream = FileUtils.openSafeFileOutputStream(file);

            var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
            createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
            converter.charset = "UTF-8";
            var istream = converter.convertToInputStream(data);

            // The last argument (the callback) is optional.
            NetUtil.asyncCopy(istream, ostream, function(status) {
                if (!Components.isSuccessCode(status)) {
                    // Handle error!
                    return;
                }

                // Data has been written to the file.
            });
        };
        come = panel.hud.outputNode;
        // console.log(panel);
        //         var dd = document.createNode('div');
        //         dd.textContent = "HELLO WORLD!";
        //         come.appendChild(dd);
        firefoxAutosaveFile = getFile('consoleAutosave.txt', 'consoleAutosave');
    } else if (supportedProtocolRegExp.test(location.protocol)) {
        while ((s = window.getSelection()) && window.confirm('Select parentElement of current selection?\n\nCancel to select current selection.\n')) {
            if (s.rangeCount) {
                r = document.createRange();
                r.selectNodeContents(s.getRangeAt(0).commonAncestorContainer.parentElement);
                s.removeAllRanges();
                s.addRange(r);
            }
        }
        if (!window.confirm('Enable autosaving selected element every ' + Number(autosaveInterval / 1000).toFixed(1) + ' seconds?\n\nSee [Previous autosave] [autosave] [x]\nat bottom right of page to download or quit autosaves.\n')) {
            return;
        }
        come = s.getRangeAt(0).commonAncestorContainer;
    } else if (location.protocol === "chrome-devtools:") {
        come = document.getElementById('console-messages');
    } else {
        window.alert('Can only autosave nodes in\nFirefox or Google Chrome Console\nor pages matching\n' + supportedProtocolRegExp + '\nGiving up on ' + location.href);
    }
    if (come) {
        if (firefoxAutosaveFile) {
            popup = content;
            myDocument = popup.document;
        } else if (location.protocol === "chrome-devtools:") {
            popup = window.open('', '', popupFeatures);
            myDocument = popup.document;
        } else {
            myDocument = document;
        }
        var autosaveIndicator = myDocument.createElement('span');
        autosaveIndicator.style.position = 'fixed';
        autosaveIndicator.style.bottom = '1em';
        autosaveIndicator.style.right = '1em';
        autosaveIndicator.style.backgroundColor = 'white';
        autosaveIndicator.style.border = '1px dashed';
        autosaveIndicator.style.transition = 'opacity 1s 0s';

        var downloadLink = myDocument.createElement('a');
        downloadLink.style.margin = '6px 3px';
        downloadLink.innerHTML = '&DoubleDownArrow; autosave';
        autosaveIndicator.appendChild(downloadLink);

        var close = autosaveIndicator.appendChild(myDocument.createElement('span'));
        close.style.margin = '6px 3px';
        // TODO See http://dev.w3.org/html5/html-author/charref
        close.innerHTML = "&Cross;";
        myDocument.body.appendChild(autosaveIndicator);
        //        console.log(getElementPath(come, location.href));
        if (firefoxAutosaveFile || localStorage.autosaveElementFileText) {
            //        if (false) {
            var downloadOldLink = myDocument.createElement('a');
            downloadOldLink.style.margin = '6px 3px';
            downloadOldLink.innerHTML = '&DoubleDownArrow; Previous autosave';
            autosaveIndicator.insertBefore(downloadOldLink, downloadLink);
            if (firefoxAutosaveFile) {
                readFile(firefoxAutosaveFile, function(inputStream, status) {
                    if (!Components.isSuccessCode(status)) {
                        // Handle error!
                        return;
                    }
                    // The file data is contained within inputStream.
                    // You can read it into a string with
                    var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
                    autosaveElementBlob = new Blob([data], {
                        'type': 'text/plain;charset=utf-8'
                    });
                    //                    console.log(data);
                    downloadOldLink.href = popup.URL.createObjectURL(autosaveElementBlob);
                    //                     var locationDiv = myDocument.createElement('div');
                    //                     locationDiv.textContent = firefoxAutosaveFile.path;
                    //                     autosaveIndicator.appendChild(locationDiv);
                    //                     console.log(firefoxAutosaveFile.path);
                    //                     console.log(downloadOldLink.href);
                    //                     console.log(downloadOldLink);
                    // window.prompt('consoleAutosave Location', firefoxAutosaveFile.path);
                });
            } else {
                autosaveElementBlob = new Blob([localStorage.autosaveElementFileText], {
                    'type': 'text/plain;charset=utf-8'
                });
                downloadOldLink.href = window.URL.createObjectURL(autosaveElementBlob);
            }
            // FIXME We lost our ability to know when the autosave data was actually saved, but it is inside the file.
            downloadOldLink.download = 'autosaveElement' + Date.now() + '.txt';
            downloadOldLink.addEventListener('click', function(event) {
                // event.preventDefault();
                autosaveIndicator.removeChild(downloadOldLink);
            }, false);
            // var pre = div.appendChild(myDocument.createElement('pre'));
            // pre.textContent = localStorage.autosaveElementFileText;
        }
        /*localStorage.*/
        autosaveElementText = '';
        /*localStorage.*/
        autosaveElementPath = getElementPath(come, location.href);
        /*localStorage.*/
        autosaveElementTime = Date.now();
        var timerID = window.setInterval(function() {
            text = getText(come);
            if (text.length - /*localStorage.*/ autosaveElementText.length > 20) {
                autosaveIndicator.style.opacity = 1;
                /*localStorage.*/
                autosaveElementTime = Date.now();
                /*localStorage.*/
                autosaveElementText = text;
                autosaveElementFileText =
                    'autosaveElement\n' + /*localStorage.*/
                autosaveElementPath + '\nfrom ' + (new Date(Number( /*localStorage.*/ autosaveElementTime))) + '\n\n' + /*localStorage.*/
                autosaveElementText;
                if (firefoxAutosaveFile) {
                    writeFile(firefoxAutosaveFile, autosaveElementFileText);
                } else {
                    localStorage.autosaveElementFileText = autosaveElementFileText;
                }
                autosaveElementBlob = new Blob([autosaveElementFileText], {
                    'type': 'text/plain;charset=utf-8'
                });
                downloadLink.title = autosaveElementText.length + ' characters saved at ' + new Date(Number(autosaveElementTime)).toString();
                downloadLink.href = popup.URL.createObjectURL(autosaveElementBlob);
                downloadLink.download = 'autosaveElement' + autosaveElementTime + '.txt';
                //                 downloadLink.setAttribute('title', /*localStorage.*/
                //                 autosaveElementText.length + ' characters saved at ' + new Date(Number( /*localStorage.*/ autosaveElementTime)).toString());
                //                 downloadLink.setAttribute('href', window.URL.createObjectURL(autosaveElementBlob));
                //                 downloadLink.setAttribute('download', 'autosaveElement' + /*localStorage.*/
                //                 autosaveElementTime + '.txt');
                //                 window.setTimeout(function() {
                //                     autosaveIndicator.style.opacity = 0.3;
                //                 }, 2000);
            }
        }, autosaveInterval);
        close.addEventListener('click', function(event) {
            window.clearInterval(timerID);
            if (firefoxAutosaveFile || location.protocol === "chrome-devtools:") {
                popup.close();
                // window.open(window.URL.createObjectURL(autosaveElementBlob), '');
            } else {
                document.body.removeChild(autosaveIndicator);
            }
        }, false);
    } else {
        console.error(come);
    }
})();
