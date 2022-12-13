
// Pages to add the script button to;

let progressTimer;
function addButton(page) {
    try {
        //log({ function: 'addButton', page })
        const newSpan = document.createElement("span");
        const scribeMonsterBtn = document.createElement("button");
        scribeMonsterBtn.setAttribute("type", "button");
        const scribeMonsterImg = document.createElement("img");
        scribeMonsterImg.src = chrome.runtime.getURL("assets/scribeMonster.png");
        scribeMonsterImg.className = "btn btn-sm ";
        scribeMonsterImg.setAttribute('style', 'max-width:100px');
        scribeMonsterImg.title = "Ask Stew to help write this!";
        //const stewSignature = document.getElementById('stewSignature');
        //stewSignature.src = chrome.runtime.getURL("assets/scribeMonster.png");
        //stewSignature.setAttribute('style', 'max-width: 15px')
        newSpan.appendChild(scribeMonsterBtn);
        scribeMonsterBtn.appendChild(scribeMonsterImg);
        scribeMonsterBtn.addEventListener("click", function () { askForCode({ element: page.scriptElement }) });
        const elementToAppendTo = document.querySelector(page.labelButtonSelector);
        elementToAppendTo?.appendChild(newSpan);
        //const newModal = document.createElement("iframe");
        //newModal.setAttribute('id', 'scribeModaliFrame');
        //newModal.src = chrome.extension.getURL("assets/scribeModal.html");
        //const newModal = document.querySelector('#scribeMonsterModal')
        //let body = document.querySelector('body')
        //body?.appendChild(newModal)

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
        if (index < emojis.length && index!=0) {
            clearInterval(progressTimer);
            document.getElementById('scribeMonsterProgress').innerHTML = "I'm all ears!";
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


function askForCode(scriptElement) {
    try {
        //log({ script: document.getElementById(scriptElement.element)?.value })
        document.getElementById('scribeMonsterModal').classList.remove('hidden');
        document.getElementById('scribeMonsterOverlay').classList.remove('hidden');
        //document.getElementById('scribeMonsterMessage').innerHTML = "I'm here for you"
        document.getElementById('scribeMonsterProgress').innerHTML = ""
    } catch (error) {
        log({ function: "askForCode", error })
    }
}


// adds the button to the pages
var currentPageToRun = pagesToRunOn.filter(function (page) {
    let pathMatches = window.location.pathname.startsWith(page.path)
    return pathMatches;
})?.[0]
window.addEventListener('load', function () {
    //log({ currentPageToRun });
    if (currentPageToRun?.name) {
        fetch(chrome.runtime.getURL('/assets/scriptModal.html')).then(r => r.text()).then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            
            // not using innerHTML as it would break js event listeners of the page
            addButton({ ...currentPageToRun })
            let modalFetchButton = document.getElementById("scribeMonsterFetchButton")
            modalFetchButton.addEventListener("click", function () { fetchScribeMonster({ ...currentPageToRun }) })

            let modalTrainButton = document.getElementById("scribeMonsterTrainButton")
            modalTrainButton.addEventListener("click", function () { trainScribeMonster({ ...currentPageToRun }) })
        });
    }
})

function log(message) {
    console.log('scribeMonster', { ...message })
}
