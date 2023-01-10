// TODO: REWRITE THIS USING CRXJS EXAMPLES
// TODO: ADD MONACO EDITOR TO MODAL
// TODO: WHEN RESPONSE IS RETRUNED, SET THE VALUE OF THE MONACO EDITOR
// TODO: IF THE REQUEST IS EDIT, SHOW THE DIFF EDITOR
// Pages to add the script button to;
// import { contentModal } from './contentModal.js'; not needed as its included in manifest
//log({ function: "content.js", require: require });
let progressTimer;
let getFormData = (table) => {
    if (!table) { table = document.location.pathname.split('.')[0].split('/')[1]; }
    let data = {};
    const elements = document.querySelectorAll(`[id^=${table}]`)
    elements.forEach((element) => {
        //console.log({element})
        let field = element.id.split('.')[1];
        let displayName = (() => {
            try {
                let label = '';
                // most of the time the label is the previous element
                label = element.parentElement.parentElement?.querySelector('.label-text')?.innerHTML
                if (label) return label;
                // if not, try to find it
                label = element.parentElement.querySelector('.label-text')?.innerText
                if (label) return label;
                label = element.id.split('.')[1];
                return label;
            } catch (error) {
                console.log({ error })
                return element.id.split('.')[1];
            }

        })()

        let value = element.value;
        let display = document.getElementById(`sys_display.original.${table}.${field}`)?.value || value;
        let original = document.getElementById(`sys_original.${table}.${field}`)?.value;
        if (element.childElementCount > 0) {
            // assume this is a select with options
            // get the selected option
            display = element.querySelector('option:checked')?.innerText;
        }
        if (element.value) {
            data[field] = { value, display, original: original || value, displayName }
        }
    })
    return data;
}
let contentModal = (page) => {
    console.log({ function: 'contentModal', page })
    //console.log({function:'tabSection', title, id, active, form, history})
    // create monco editor
    // https://microsoft.github.io/monaco-editor/playground.html#interacting-with-the-editor-adding-an-action-to-an-editor-instance
    let returnHtml = ``;
    let currentForm = getFormData();
    let mailToLink = 'mailto:jace@benson.run?subject=ScribeMonster%20Feedback&body=Jace%2C%20I%20was%20using%20your%20extension%20and%20wanted%20to%20share%3B%0A...';
    returnHtml += `<style>
    #scribeMonsterModal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      z-index: 9999;
      overflow: auto;
    }
    #scribeMonsterModalContent {
      position: relative;
      background-color: #fefefe;
      margin: 15% auto;
      padding: 20px;
      border: 1px solid #888;
      width: 80%;
    }
    .scribeMonster-mx-1 {
      margin-left: 0.25rem;
      margin-right: 0.25rem;
    }
    .scribeMonster-mb-1 {
      margin-bottom: 1rem;
    }
    .scribeMonster-spacing-1 {
        margin-left: 1rem;
    }
    .scribeMonster-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 10px;
    }
    .scribeMonster-label {
        min-width: 50px;
    }

  </style>
  <div id="scribeMonsterModal" class="hidden" >
    <div id="scribeMonsterModalContent" class="modal-content" >
      <!--add header with title and close button-->
      <div class="scribeMonster-modal-header">
        <button id="scribeMonsterCloseButton" class="btn btn-danger float-right  scribeMonster-spacing-1">Close</button>
        <a id="scribeMonsterFeedbackButton" class="btn btn-info float-right" href="${mailToLink}">Send Feedback</a>
        <!--<span class="close" id="scribeMonsterCloseButton">&times;</span>-->
        <h2>Stew's Code Helper</h2>
      </div>
      <!--add body with form-->
      <div class="modal-body">
        <div id="scribeMonsterProgress" class="scribeMonster-mb-1"></div>
        <p class="scribeMonster-mb-1">
          <span id="scribeMonsterMessage"></span>
        </p>
        <!--add single line text input for new code-->
        <div class=" scribeMonster-row scribeMonster-mb-1">
          <label class="scribeMonster-label" for="scribeMonsterPrompt">Prompt</label>
          <input id="scribeMonsterPrompt" class="form-control" type="text"
          placeholder="When caller is Stew, set comment to 'I am still learning'">
          <button id="scribeMonsterCreateCodeButton" class="btn btn-primary">
            Create code
          </button>
          <button id="scribeMonsterEditCodeButton" class="btn btn-primary">
            Edit code
          </button>
        </div> 
        <div class="scribeMonster-row scribeMonster-mb-1">
          <label class="scribeMonster-label" for="scribeMonsterSelect">Field</label>
          <select id="scribeMonsterSelect" class="form-control >
            <option id="scribeMonsterSelectField" value="">Select a field</option>
              ${currentForm && Object.keys(currentForm).map((key) => { return `
            <option id="scribeMonsterSelectField" value="${key}">
              ${currentForm[key].displayName}[${key}]
            </option>
            ` })}
          </select>
        </div>
        
        <!--show text area with button vertically on the right with 10px spacing between each-->
        <div class="scribeMonster-row scribeMonster-mb-1">
          <!--text area to show a mono-font code editor-->
          <label class="scribeMonster-label" for="scribeMonsterCode">Value</label>
          <textarea id="scribeMonsterCode" class="form-control"></textarea>
            <!-- add buttons to the right -->
          <div
            style="
              flex-direction: column;
              display: flex;
              padding-left: 10px;
              gap: 10px;
            "
          >
            <!-- <button id="scribeMonsterSuggestCodeButton" class="btn btn-primary">Suggest Code @ Cursor</button> -->
            <button id="scribeMonsterExplainButton" class="btn btn-primary">
              Explain Text
            </button>
            <button id="scribeMonsterRunCopyButton" class="btn btn-primary">
              Copy
            </button>
          </div>
        </div>
        <!--show the table, and type -->
        <div class="scribeMonster-row scribeMonster-mb-1">
            <label class="scribeMonster-label" for="scribeMonsterTable">Table</label>
            <input id="scribeMonsterTable" class="form-control" type="text" placeholder="incident" readonly="true" value="${page.path.split('/')[1].split('.')[0]}">
            <label class="scribeMonster-label" for="scribeMonsterType">Type</label>
            <input id="scribeMonsterType" class="form-control" type="text" placeholder="onchange" readonly="true" value="${currentForm?.type?.value || "na"}">
        </div>
        <!--<details>
          <summary>&nbsp;</summary>
          <pre>${JSON.stringify(getFormData(), '', ' ')}</pre>
        </details>-->
      </div>
    </div>
  </div>

    `;
    return returnHtml;
}
function addButton(page) {
    try {
        // check if chrome.storage.sync.get for scribeMonsterButtonEnabled is true
        chrome.storage.sync.get(['scribeMonsterShowButton'], (data)=>{
            if (data.scribeMonsterShowButton !== "Yes") {
                const newSpan = document.createElement("span");
                const scribeMonsterBtn = document.createElement("button");
                scribeMonsterBtn.setAttribute("type", "button");
                scribeMonsterBtn.className = "form_action_button  action_context btn btn-default";
                const scribeMonsterImg = document.createElement("img");
                scribeMonsterImg.src = chrome.runtime.getURL("./src/scribeMonster.png");
                scribeMonsterImg.className = "btn btn-sm ";
                scribeMonsterImg.setAttribute('style', 'max-width:100px');
                scribeMonsterImg.title = "Ask Stew to help write this!";
                newSpan.appendChild(scribeMonsterBtn);
                scribeMonsterBtn.appendChild(scribeMonsterImg);
                scribeMonsterBtn.addEventListener("click", function () { askForCode() });
                const elementToAppendTo = document.querySelector(page.labelButtonSelector || '.form_action_button_container');
                elementToAppendTo?.appendChild(newSpan);
            }
        });
    } catch (error) {
        log({ function: "addButton error", error })
    }
}
function setProgressText() {
    let emojis = ['🤔', '📝', '🫤', '🧠', '💡', '📖', '📝', '😟', '😠', '🤬'];
    let index = 0;
    progressTimer = setInterval(function () {
        let listOfEmojis = emojis.filter((emoji, indexE) => {
            return indexE <= index
        }).join(' ');
        document.getElementById('scribeMonsterProgress').innerHTML = listOfEmojis;
        index++;
        if (index >= emojis.length) {
            clearInterval(progressTimer);
        }
    }, 1000);

    setTimeout(function () {
        if (index < emojis.length && index != 0) {
            clearInterval(progressTimer);
            document.getElementById('scribeMonsterProgress').innerHTML = "I'm all ears!";
        }
    }, 10000);
}

function closeModal() {
    document.getElementById('scribeMonsterModal').classList.add('hidden');
}
function askForCode() {
    try {
        //log({ script: document.getElementById(scriptElement.element)?.value })
        document.getElementById('scribeMonsterModal').scrollIntoView();
        document.getElementById('scribeMonsterModal').classList.remove('hidden');
        //document.getElementById('scribeMonsterMessage').innerHTML = "I'm here for you"
        document.getElementById('scribeMonsterProgress').innerHTML = ""
    } catch (error) {
        log({ function: "askForCode", error })
    }
}
function fetchScribeMonster({ page, ...args }) {
    // look up these! auth,instruction,input
    //log({ function: "fecthScribeMonster", script: document.getElementById(page.scriptElement) })
    chrome.storage.sync.get(['scribeMonsterAuth', 'scribeMonsterDomain'], function (data) {
        log({ page, data, ...args })
        // make the input an object of suffix, and prefix
        let currentForm = getFormData();
        //let prefix = args?.prefix || "";
        let suffix = args?.suffix || "";
        let input = args?.input || "";
        // make the prompt "."
        let prompt = args?.prompt || args?.prefix;
        // make the action = "inline-suggest-code"
        let action = args?.action;
        // make the table the curent table
        let table = page.path.split('/')[1].split('.')[0];
        // make the type cs-onchange, cs-onsubmit, cs-onloadm, br-when-crud
        let type = currentForm?.type?.value || "na";
        if (!data.scribeMonsterAuth) {
            document.getElementById('scribeMonsterCode').value = "Please validate your ScribeMonster account in the extension options";
            return;
        }
        if (data.scribeMonsterAuth) {
            let body = { input, prompt, action, table, type, suffix }
            //log({ body })
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': data.scribeMonsterAuth
                },
                body: JSON.stringify(body)
            };
            setProgressText();
            let endpoint = `${data.scribeMonsterDomain}/.redwood/functions/scribe`
            fetch(endpoint, options)
                .then(response => response.json())
                .then(response => {
                    //console.log({ response });
                    clearInterval(progressTimer);
                    if (response?.raw?.error) {
                        document.getElementById('scribeMonsterMessage').innerHTML = `${response.raw.error.message}`
                        return;
                    }
                    console.log({ action, response })
                    if (action == "inline-suggest-code") {
                        // the response code is the inline code to add
                        // add var for the prefix to prepend
                        // add var for the suffix to append
                        // set the textarea to the response
                        var prependedCode = args?.prefix || "";
                        var suffixCode = args?.suffix || "";

                        document.getElementById('scribeMonsterCode').value = prependedCode + response.code + suffixCode;
                    }
                    if(action == "explain"){
                        document.getElementById('scribeMonsterCode').value = `1. ${response.code?.trim()}`
                    }
                    if(action == "complete"){
                        document.getElementById('scribeMonsterCode').value = `${response.code?.trim()}`
                    }
                    if(action == "edit"){
                        document.getElementById('scribeMonsterCode').value = `${response.code?.trim()}`
                    }
                    document.getElementById('scribeMonsterCode').style.height = "auto";
                    document.getElementById('scribeMonsterCode').style.height = (document.getElementById('scribeMonsterCode').scrollHeight) + "px";
                })
                .catch(error => console.error({ function: 'fetch', action, error }));
        }
        if (!data.scribeMonsterAuth) {

            document.getElementById('scribeMonsterMessage').innerHTML = `Oh no, you're not authenicated, goto https://scribe.monster and get a key.`
        }
    });
}
let pagesToRunOn = [
    /*{
        path: 'path to page with preceding slash',
        labelButtonSelector: 'selector for the button to add' if not given, i try to add it
    },*/
    { path: '/sys_script_client.do' },
    { path: '/sys_script.do' },
    { path: '/sys_ui_page.do' },
]
// adds the button to the pages
var currentPageToRun = pagesToRunOn.filter(function (page) {
    let pathMatches = window.location.pathname.startsWith(page.path)
    return pathMatches;
})?.[0]
console.log({ line: 104, scribeMonster: currentPageToRun })
window.addEventListener('load', (function () {
    log({ line: 106, currentPageToRun });
    if (currentPageToRun) {
        try {
            let html = contentModal(currentPageToRun);
            log({ line: 110, scribeMonsterHtml: html })
            document.body.insertAdjacentHTML('beforeend', html);
            // after the modal is added, add the monaco editor
            //let loaderPath = chrome.runtime.getURL('./src/monaco-editor/min/vs/loader.js')
            //let monacoLoaderScript = document.createElement('script');
            //monacoLoaderScript.src = loaderPath;
            //scribeMonsterModal.appendChild(monacoLoaderScript);
            //let monacoScriptElement = document.createElement('script');
            //monacoScriptElement.src = chrome.runtime.getURL('./src/monaco-settings.js');
            //scribeMonsterModal.appendChild(monacoScriptElement);

            addButton({ ...currentPageToRun })
            // add event listeners to the modal
            let modalCloseButton = document.getElementById("scribeMonsterCloseButton")
            modalCloseButton.addEventListener("click", function () { closeModal() })
            let scribeMonsterSelect = document.getElementById("scribeMonsterSelect")
            scribeMonsterSelect.addEventListener("change", function () {
                let field = scribeMonsterSelect.options[scribeMonsterSelect.selectedIndex].value;
                // set the text area to the value of getFormData.field
                let code = getFormData()[field].value;
                let textArea = document.getElementById('scribeMonsterCode');
                // set the textarea text font to a monospace font
                textArea.style.fontFamily = "monospace";
                // disable spellcheck
                textArea.spellcheck = false;
                textArea.value = code
                // resize the text area
                textArea.style.height = "1px";
                textArea.style.height = (25 + textArea.scrollHeight) + "px";


            });
            // add event listener so when the text area is chagned, i get the value before the cursor, and after it.
            let textAreaCode = document.getElementById('scribeMonsterCode');
            textAreaCode.style.tabSize = 4;
            // add event listener so when the text area is changed, it resizes
            textAreaCode.addEventListener("input", function () {
                // resize the textarea
                textAreaCode.style.height = "auto";
                textAreaCode.style.height = (textAreaCode.scrollHeight) + "px";
                // set tab size to 4
            })
            // add event listener so when the text area is tabbed, it adds 4 spaces
            textAreaCode.addEventListener("keydown", function (e) {
                if (e.key == "Tab") {
                    e.preventDefault();
                    let start = this.selectionStart;
                    let end = this.selectionEnd;
                    // set textarea value to: text before caret + tab + text after caret
                    this.value = this.value.substring(0, start) +
                        "\t" + this.value.substring(end);
                    // put caret at right position again
                    this.selectionStart =
                        this.selectionEnd = start + 1;
                }
            })


            // add event listener so when the suggest code button is clicked, it fetches the code
            let suggestCodeButton = document.getElementById('scribeMonsterSuggestCodeButton');
            suggestCodeButton?.addEventListener("click", function () {
                // get the code before the cursor and after it
                let field = scribeMonsterSelect.options[scribeMonsterSelect.selectedIndex].value;
                let originalCode = getFormData()[field].value;
                let currentCode = textAreaCode.value;
                let cursorPosition = textAreaCode.selectionStart;
                let codeBeforeCursor = currentCode.substring(0, cursorPosition);
                let codeAfterCursor = currentCode.substring(cursorPosition, currentCode.length);
                log({ codeBeforeCursor, codeAfterCursor })
                // fetch the code
                fetchScribeMonster({ page: currentPageToRun, prefix: codeBeforeCursor, suffix: codeAfterCursor, originalCode, field })
            })
            // add event listener so when the create code button is clicked, it fetches the code
            let createCodeButton = document.getElementById('scribeMonsterCreateCodeButton');
            createCodeButton.addEventListener("click", function () {
                console.log({ function: 'completeCodeButton.addEventListener'}, { page: currentPageToRun, prompt: document.getElementById('scribeMonsterPrompt').value, action: 'complete' })
                // get the prompt value
                let prompt = document.getElementById('scribeMonsterPrompt').value;
                // fetch the code
                fetchScribeMonster({ page: currentPageToRun, prompt, action: 'complete' })
            });
            // add event listener so when the edit code button is clicked, it fetches the code
            let editCodeButton = document.getElementById('scribeMonsterEditCodeButton');
            editCodeButton.addEventListener("click", function () {
                console.log({ function: 'editCodeButton.addEventListener'}, { page: currentPageToRun, prompt: document.getElementById('scribeMonsterPrompt').value, input: document.getElementById('scribeMonsterCode').value, action: 'edit' })
                // get the prompt value
                let input = document.getElementById('scribeMonsterCode').value;
                let prompt = document.getElementById('scribeMonsterPrompt').value;
                // fetch the code
                fetchScribeMonster({ page: currentPageToRun, prompt, input, action: 'edit' })
            });
            // add event listener so when the explain button is clicked, it fetches the code
            let explainButton = document.getElementById('scribeMonsterExplainButton');
            console.log({ function: 'explainButton.addEventListener', }, { page: currentPageToRun, input: document.getElementById('scribeMonsterCode').value, action: 'explain' })
            explainButton.addEventListener("click", function () {
                // get the prompt value
                let input = document.getElementById('scribeMonsterCode').value;
                // fetch the code
                fetchScribeMonster({ page: currentPageToRun, input, action: 'explain' })
            });
            // add event listener so when the run copy button is clicked, it's copied to the clipboard
            let runCopyButton = document.getElementById('scribeMonsterRunCopyButton');
            runCopyButton.addEventListener("click", function () {
                // get the code
                let code = document.getElementById('scribeMonsterCode').value;
                // copy the code to the clipboard
                const copyType = "text/plain";
                const blob = new Blob([code], { type: copyType });
                const data = [new ClipboardItem({ [copyType]: blob })];

                navigator.clipboard.write(data).then(
                    () => {
                    /* success */
                    console.log('copied to clipboard')
                    },
                    () => {
                    /* failure */
                    console.log('failed to copy to clipboard')
                    }
                );
            });
        } catch (error) {
            log({ line: 123, error })
        }
        //});
    }
})());

function log(message) {
    console.log('scribeMonster', { ...message })
}
