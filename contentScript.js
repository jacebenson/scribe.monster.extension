function l(message) {
    console.log('scribeMonster', { ...message })
}
function addButton(page) {
    try {
        l({ page: page })
        const newSpan = document.createElement("span");
        const scribeMonsterBtn = document.createElement("button");
        scribeMonsterBtn.setAttribute("onClick", "console.log('ScribeMonster Button Click')");
        scribeMonsterBtn.setAttribute("type", "button");
        const scribeMonsterImg = document.createElement("img");
        scribeMonsterImg.src = chrome.runtime.getURL("assets/scribeMonster.png");
        scribeMonsterImg.className = "btn btn-sm ";
        //scribeMonsterImg.title = "Ask ScribeMonster to help write this!";
        newSpan.appendChild(scribeMonsterBtn);
        scribeMonsterBtn.appendChild(scribeMonsterImg);
        scribeMonsterBtn.addEventListener("click", function () { askForCode({ element: page.scriptElement }) });
        //document.getElementById('sys_script_client.script').value;
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
            min-height: 250px;
            position: absolute;
            top: 20%;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 15px;
            z-index: 10000;
            justify-content: space-between;
            align-items: stretch;
          }
      
          #scribeMonsterModal .flex {
            display: flex;
            align-items: center;
            justify-content: space-between;
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
        <h3>Stay in touch</h3>
        <button id="scribeMonsterCloseBtn" onClick="(()=>{document.getElementById('scribeMonsterModal').classList.toggle('hidden');document.getElementById('scribeMonsterOverlay').classList.toggle('hidden');})()" type="button" class="btn-close">⨉</button>
      </div>
      <div>
        <p>
          This is a dummy newsletter form so don't bother trying to test it. Not
          that I expect you to, anyways. :)
        </p>
      </div>
      <input id="scribeMonsterInstruction" placeholder="tell me what to do" />
      <button type="button" id="scribeMonsterFetchButton" class="btn">Submit</button>
      </section>
      <div id="scribeMonsterOverlay" class="hidden"></div>
      </div>
        `
        //modalFetchButton.addEventListener("click", function () { _fetchScribeMonster(...page) });
        //elementToAppendTo?.appendChild(newModal);
        //let closeModalButton = document.getElementById('scribeMonsterCloseBtn')
        //l({closeModalButton})
        //closeModalButton.addEventListener("click", function () {
        //    closeModal();
        //});
        let body = document.querySelector('body')
        body?.appendChild(newModal)

    } catch (error) {
        l({ function: "addButton", error })
    }
}
function fetchScribeMonster(page) {
    // look up these! auth,instruction,input
    l({
        function:"_fecthScribeMonster", 
        script: document.getElementById(page.scriptElement)})
    chrome.storage.sync.get(['scribeMonsterKey', 'scribeMonsterUser', 'scribeMonsterAuth'], function (data) {
        if (data.scribeMonsterAuth) {
            l({ 
                scribeMonsterAuth: data.scribeMonsterAuth,
                instruction: document.getElementById('scribeMonsterInstruction').value,
                input: document.getElementById(page.scriptElement).value
             })

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: data.scribeMonsterAuth
                },
                body: JSON.stringify({
                    instruction: "get a joke from jokes.jace.pro and show it as message",
                    "input": "(function executeRule(current, previous /*null when async*/) {\n//add your code here\n})(current,previous);",
                    "model": "code-davinci-edit-001"
                })
            };

            fetch('https://scribe.monster/.redwood/functions/scribe', options)
                .then(response => response.json())
                .then(response => console.log({response}))
                .catch(err => console.error(err));
        }
    });
}
function askForCode(scriptElement) {
    try {
        l({ script: document.getElementById(scriptElement.element)?.value })
        let modal = document.getElementById('scribeMonsterModal');
        modal.classList.toggle('hidden');
        document.getElementById('scribeMonsterOverlay').classList.toggle('hidden');
    } catch (error) {
        l({ function: "askForCode", error })
    }
}
function closeModal(){
    let modal = document.getElementById('scribeMonsterModal');
    l({function: "closeModal", modal})
        modal.classList.toggle('hidden');
}
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
var currentPageToRun = pagesToRunOn.filter(function (page) {
    let pathMatches = window.location.pathname.startsWith(page.path)
    return pathMatches;
})?.[0]
window.addEventListener('load', function () {
    l({ currentPageToRun });
    if (currentPageToRun?.name) {
        addButton({ ...currentPageToRun });
        let modalFetchButton = document.getElementById("scribeMonsterFetchButton")
        modalFetchButton.addEventListener("click", function () { fetchScribeMonster({...currentPageToRun}) })
        
    }
    //pagesToRunOn.forEach(page)
    if (window.location.pathname.startsWith('/incident.do')) {
        //var frameExists = typeof window.frames["gsft_main"] === 'object';
        l({ location: window.location })
        try {
            var num = document.getElementById('incident.number');
            l({ num: num.value })
            //var gum = window.g_form.getValue('number');//doesnt work!
            //l({ gum })
            num.value = 'haha';
            l({ num: num.value })
        } catch (error) {
            l({ message: "try/catch lookign for inc.number", error })
        }
        var frameExists = typeof window.frames[window.frames.length] === 'object';
        if (frameExists) {
            var thisFrame = window.frames[window.frames.length].document
            var number = thisFrame.getElementById('incident.number').value;
            l({ number });
        }
        if (!frameExists) {
            l({ message: 'frame not found!', frames: window })
        }
    }
})