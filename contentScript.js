
// Pages to add the script button to;
var pagesToRunOn = [
    {
        name: "Client Script",
        path: "/sys_script_client.do",
        labelButtonSelector: '[for="sys_script_client.script"]',
        scriptElement: 'sys_script_client.script'
    },
    {
        name: "Client Script",
        path: "/catalog_script_client.do",
        labelButtonSelector: '[for="catalog_script_client.script"]',
        scriptElement: 'catalog_script_client.script'
    },
    {
        name: "Business Rule",
        path: "/sys_script.do",
        labelButtonSelector: '[for="sys_script.script"]',
        scriptElement: 'sys_script.script'
    },
    {
        name: "Script Includes",
        path: "/sys_script_include.do",
        labelButtonSelector: '[for="sys_script_include.script"]',
        scriptElement: 'sys_script_include.script'
    },
]
let progressTimer;
function addButton(page) {
    try {
        l({ function: 'addButton', page })
        const newSpan = document.createElement("span");
        const scribeMonsterBtn = document.createElement("button");
        scribeMonsterBtn.setAttribute("onClick", "console.log('ScribeMonster Button Click')");
        scribeMonsterBtn.setAttribute("type", "button");
        const scribeMonsterImg = document.createElement("img");
        scribeMonsterImg.src = chrome.runtime.getURL("assets/scribeMonster.png");
        scribeMonsterImg.className = "btn btn-sm ";
        scribeMonsterImg.setAttribute('style', 'max-width:100px');
        scribeMonsterImg.title = "Ask Stew to help write this!";
        newSpan.appendChild(scribeMonsterBtn);
        scribeMonsterBtn.appendChild(scribeMonsterImg);
        scribeMonsterBtn.addEventListener("click", function () { askForCode({ element: page.scriptElement }) });
        const elementToAppendTo = document.querySelector(page.labelButtonSelector);
        elementToAppendTo?.appendChild(newSpan);
        const newModal = document.createElement("div");
        newModal.innerHTML = `
        <section id="scribeMonsterModal" class="hidden">
        <div class="flex">
        <style>
          #scribeMonsterModal {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.4rem;
            width: 450px;
            padding: 1.3rem;
            min-height: 150px;
            position: absolute;
            top: 20%;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 15px;
            z-index: 10000;
            justify-content: space-between;
            align-items: stretch;
            margin-left: 30%;

          }
      
          #scribeMonsterModal .flex {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          #scribeMonsterModalBottom .flex {
            display: flex;
            flex-direction: column;
            align-items: stretch;
          }
      
          #scribeMonsterModal input {
            padding: 0.7rem 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 0.9em;
          }
      
          #scribeMonsterModal p {
            font-size: 0.9rem;
            color: #777;
            margin: 0.4rem 0 0.2rem;
          }
      
          #scribeMonsterModal button {
            cursor: pointer;
            border: none;
            font-weight: 600;
          }
      
          #scribeMonsterModal .btn {
            display: inline-block;
            padding: 0.8rem 1.4rem;
            font-weight: 700;
            background-color: black;
            color: white;
            border-radius: 5px;
            text-align: center;
            font-size: 1em;
          }
      
          #scribeMonsterModal .btn-open {
            position: absolute;
            bottom: 150px;
          }
      
          .btn-close {
            transform: translate(10px, -20px);
            padding: 0.5rem 0.7rem;
            background: #eee;
            border-radius: 50%;
          }
      
          #scribeMonsterOverlay {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            z-index: 10;
          }
        </style>
        <h3>Help me help you!</h3>
        <button id="scribeMonsterCloseBtn" onClick="(()=>{document.getElementById('scribeMonsterModal').classList.toggle('hidden');document.getElementById('scribeMonsterOverlay').classList.toggle('hidden');})()" type="button" class="btn-close">⨉</button>
        
      </div>
      </div>
      <div id="scribeMonsterModalBottom">
      <div id="scribeMonsterProgress"></div>
      <div id="scribeMonsterMessage">Give me some instructions!</div>
      <div id="scribeMonsterForm" class="flex">
      <input style="width: 100%" id="scribeMonsterInstruction" placeholder="Tell me what to do" /><br/>
      <select style="width: 100%" id="scribeMonsterAction">
      <option value="edit">Edit the function</option>
      <option value="complete">Complete the function from the first line</option>
      <option value="explain">Explain the code</option>
      </select>
      <br/>
      <button type="button" id="scribeMonsterFetchButton" class="btn">Submit</button>
      </div>
      </section>
      <div id="scribeMonsterOverlay" class="hidden"></div>
      </div>
        `
        let body = document.querySelector('body')
        body?.appendChild(newModal)

    } catch (error) {
        l({ function: "addButton error", error })
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
        if (index < emojis.length) {
            clearInterval(progressTimer);
            document.getElementById('scribeMonsterProgress').innerHTML = "I'm all ears!";
            console.log('Error');
        }
    }, 10000);
}
function setScript({ page, code }) {
    let trimmedCode = code.trim();
    if (trimmedCode) {
        document.getElementById(page.scriptElement).value = code;
        var codeInBase64 = window.btoa(code.trim());
        var fieldToSet = page.scriptElement.split('.')[1];
        const newBtn = document.createElement("div");
        newBtn.innerHTML = `<button id="setValue" onClick="(()=>{g_form.setValue('${fieldToSet}',window.atob('${codeInBase64}'))})()"></button>`
        document.getElementById('scribeMonsterOverlay').appendChild(newBtn);
        document.getElementById('setValue').click();
        document.getElementById('scribeMonsterOverlay').innerHTML = "";
    }
    if (!trimmedCode) {
        // no code empty value!
        document.getElementById('scribeMonsterMessage').innerHTML = `Oh no, there was a problem with this prompt!`
    }
}
function estimateTokens({ action, prompt, input }) {
    //console.log({ function: 'estimateTokens', action, actionLength: action?.length, input, inputLength: input?.length, prompt, promptLength: prompt?.length })
    let promptTokens = prompt / 3.75 || 0
    let inputTokens = input / 3.75 || 0
    let estimate = 0;
    console.log({ message: 'precheck', action, promptTokens, inputTokens, isExplain: action === 'explain' })
    if (action === 'edit') {
        // return the rounded up value of 2*input + prompt
        console.log({ action, promptTokens, inputTokens })
        estimate = Math.ceil(2 * inputTokens + promptTokens)
        return estimate
    }
    if (action === 'complete') {
        // return the rounded up value of input[0] + prompt + 2000
        console.log({ action, promptTokens, inputTokens })
        estimate = Math.ceil(100/*est for line 1 of code */ + promptTokens + 2000)
        return estimate
    }
    if (action === "explain") {
        // return the rounded up value of prompt + 1000
        console.log({ action, promptTokens, inputTokens })
        estimate = Math.ceil(promptTokens + inputTokens + 1000)
        return estimate
    }
}
function fetchScribeMonster(page) {
    // look up these! auth,instruction,input
    l({ function: "fecthScribeMonster", script: document.getElementById(page.scriptElement) })
    chrome.storage.sync.get(['scribeMonsterAuth'], function (data) {
        let scribeMonsterAuth = data.scribeMonsterAuth;
        let input = document.getElementById(page.scriptElement).value;
        let prompt = document.getElementById('scribeMonsterInstruction').value;
        let action = document.getElementById('scribeMonsterAction').value;
        let table = page.scriptElement.split('.')[0];
        let type = document.getElementById('sys_script_client.type').value || document.getElementById('catalog_script_client.type').value
        if ((table === 'catalog_script_client' || table === 'sys_script_client') && type == undefined) {
            document.getElementById('scribeMonsterMessage').innerHTML = `You need to have the type on the client script set.`
            return;
        }
        if (action === 'explain') { prompt = "." }
        if (scribeMonsterAuth) {
            let body = { input, prompt, action, table, type }
            l({ body })
            let estimate = estimateTokens({ action, prompt: prompt?.length, input:input?.length })
            l({estimate, over4000: estimate > 4000, under4000: estimate<4000})
            if (estimate > 4000) {
                document.getElementById('scribeMonsterMessage').innerHTML = `Oh no, I think you'll be over the token allotment.`
            }
            if (estimate < 4000) {
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': scribeMonsterAuth
                    },
                    body: JSON.stringify(body)
                };
                setProgressText();
                fetch('https://scribe.monster/.redwood/functions/scribe', options)
                //fetch('http://localhost:8910/.redwood/functions/scribe', options)
                    .then(response => response.json())
                    .then(response => {
                        console.log({ response });
                        clearInterval(progressTimer);
                        if (response?.raw?.error){
                            document.getElementById('scribeMonsterMessage').innerHTML = `${response.raw.error.message}`
                            return;
                        }
                        if (action != 'explain') {
                            document.getElementById('scribeMonsterModal').classList.add('hidden');
                            document.getElementById('scribeMonsterOverlay').classList.add('hidden');
                        }
                        if (action == 'edit') {
                            setScript({ code: response.code, page })
                        }
                        if (action == 'complete') {
                            var newCode = response.code
                            setScript({ code: newCode, page })
                        }
                        if (action == 'explain') {
                            document.getElementById('scribeMonsterMessage').innerHTML = `1. ${response.code.split('\n').join('<br/>')}`
                        }
                    })
                    .catch(err => console.error(err));
            }
        }
        if (!scribeMonsterAuth) {

            document.getElementById('scribeMonsterMessage').innerHTML = `Oh no, you're not authenicated, goto https://scribe.monster and get a key.`
        }
    });
}
function askForCode(scriptElement) {
    try {
        l({ script: document.getElementById(scriptElement.element)?.value })
        document.getElementById('scribeMonsterModal').classList.remove('hidden');
        document.getElementById('scribeMonsterOverlay').classList.remove('hidden');
        document.getElementById('scribeMonsterMessage').innerHTML = "I'm here for you"
        document.getElementById('scribeMonsterProgress').innerHTML = ""
    } catch (error) {
        l({ function: "askForCode", error })
    }
}



// adds the button to the pages
var currentPageToRun = pagesToRunOn.filter(function (page) {
    let pathMatches = window.location.pathname.startsWith(page.path)
    return pathMatches;
})?.[0]
window.addEventListener('load', function () {
    l({ currentPageToRun });
    if (currentPageToRun?.name) {
        addButton({ ...currentPageToRun });
        let modalFetchButton = document.getElementById("scribeMonsterFetchButton")
        modalFetchButton.addEventListener("click", function () { fetchScribeMonster({ ...currentPageToRun }) })

    }
})

function log(message) {
    console.log('scribeMonster', { ...message })
}
let l = log
