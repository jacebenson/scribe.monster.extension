import history from "./component/history";
let _fetchAnswer = ({prompt, options})=>{
    chrome.storage.sync.get(['scribeMonsterDomain', 'scribeMonsterAuth'], (data)=>{
        let {scribeMonsterDomain, scribeMonsterAuth} = data;
        if(!scribeMonsterAuth){
            document.querySelector('#button-docs').disabled = false;
            document.querySelector('#button-docs').classList.add('btn-danger');
            document.querySelector('#button-docs').innerText = 'Invalid credentials';
        }
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': scribeMonsterAuth
        };
        let fullUrl = `${scribeMonsterDomain||'https://scribe.monster'}/.redwood/functions/scribe`;
        let fullOptions = {...options, headers};
        fetch(fullUrl, fullOptions)
        .then((response)=>{
            return response.json();
        })
        .then((data)=>{
            // enable the ask button, but update the button text to say "ask stew"
            document.querySelector('#button-docs').disabled = false;
            document.querySelector('#button-docs').innerText = 'Generate!';
            document.querySelector('#button-docs').classList.remove('btn-danger');
            let now = new Date();
            let when = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
            saveDoc({when, prompt, response:data.code.trim().replace('\n','<br/>')});
        })
        .catch((error)=>{
            console.log({function: '_fetchAnswer', error});
            // enable the ask button, but update the button text to say "error" and to have btn-danger class
            document.querySelector('#button-docs').disabled = false;
            document.querySelector('#button-docs').classList.add('btn-danger');
            // if error is 401, then update the button text to say "invalid credentials"
            if(error.status === 401){
                document.querySelector('#button-docs').innerText = 'Invalid credentials';
            } else {
                document.querySelector('#button-docs').innerText = 'Error';
            }
        });
    })
};


let generate = ()=>{
    let prompt = document.querySelector('#docs-prompt').value;
    // disable the ask button
    // wait for _fetchAnswer to return
    // enable the ask button
    // return the answer
    document.querySelector('#button-docs').disabled = true;
    _fetchAnswer({prompt, options:{method:'POST', body:JSON.stringify({
        action: `docs-${document.querySelector('#docs-type').value}`,
        prompt
    })}});
};
let getDocs = ()=>{
    chrome.storage.local.get(['scribeMonsterDocs'], (data)=>{
    });
};
let saveDoc = ({when, prompt, response})=>{
    //scribeMonsterDocs
    chrome.storage.local.get(['scribeMonsterDocs'], (data)=>{
        if(!data.scribeMonsterDocs){
            chrome.storage.local.set({ scribeMonsterDocs: [{ when, prompt, response}]});
        }
        if(data.scribeMonsterDocs){
            chrome.storage.local.set({ scribeMonsterDocs: [...data.scribeMonsterDocs, { when, prompt, response}]});
        }
        history.setHistoryData({ storageName: 'scribeMonsterDocs' });
    });
};
let deleteDoc = ({id})=>{
    chrome.storage.local.get(['scribeMonsterDocs'], (data)=>{
       let docs = data.scribeMonsterDocs;
       docs.splice(id, 1);
         chrome.storage.sync.set({ scribeMonsterDocs: docs},()=>{
             // done..
         });
    });
}
let summary = {
    generate,
    getDocs,
    saveDoc,
    deleteDoc
}
export default summary;