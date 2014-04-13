### consoleAutosave.js

### Developer Tools console messages autosave Snippet for Google Chrome and Mozilla Firefox

Source
-------

**Release** https://raw.github.com/bgrins/devtools-snippets/master/snippets/consoleAutosave/consoleAutosave.js

**Development** https://raw.github.com/anaran/devtools-snippets/consoleAutosave/snippets/consoleAutosave/consoleAutosave.js

Documentation
-------

**Release** http://bgrins.github.io/devtools-snippets/#consoleAutosave

**Development** https://github.com/anaran/devtools-snippets/blob/consoleAutosave/snippets/consoleAutosave/README.md

### Features

-  Enable an interval timer to save console messages (commands and output)

    - Messages are checked every 5 seconds
    - Messages are saved, along with a timestamp, whenever text content has grown by more than 20 characters
    - Messages are saved  in devtools localStorage for Google Chrome
    - Messages are saved  under active Firefox profile for Mozilla Firefox

-  Download previously autosaved console messages

    - Whenever the snippet is run it checks for previous data

        - Present previous data, along with a timestamp, in a popup window
        - Provide a link in that popup window to download the autosaved data

Implementation by [anaran](https://github.com/anaran).

[![consoleAutosave](consoleAutosave.gif)](consoleAutosave.js)
