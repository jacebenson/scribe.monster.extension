import history from "./component/history";
let _fetchAnswer = ({prompt, options})=>{
    console.log({function: '_fetchAnswer', prompt, options})
    chrome.storage.sync.get(['scribeMonsterDomain', 'scribeMonsterAuth'], (data)=>{
        let {scribeMonsterDomain, scribeMonsterAuth} = data;
        if(!scribeMonsterAuth){
            document.querySelector('#button-ask-stew').disabled = false;
            document.querySelector('#button-ask-stew').classList.add('btn-danger');
            document.querySelector('#button-ask-stew').innerText = 'Invalid credentials';
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
            console.log(data);
            // enable the ask button, but update the button text to say "ask stew"
            document.querySelector('#button-summarize').disabled = false;
            document.querySelector('#button-summarize').innerText = 'Summarize!';
            document.querySelector('#button-summarize').classList.remove('btn-danger');
            console.log({function: '_fetchAnswer', prompt
            , data})
            let now = new Date();
            let when = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
            saveSummary({when, prompt, response:data.code.trim().replace('\n','<br/>')});
        })
        .catch((error)=>{
            console.log({function: '_fetchAnswer', error});
            // enable the ask button, but update the button text to say "error" and to have btn-danger class
            document.querySelector('#button-summarize').disabled = false;
            document.querySelector('#button-summarize').classList.add('btn-danger');
            // if error is 401, then update the button text to say "invalid credentials"
            if(error.status === 401){
                document.querySelector('#button-summarize').innerText = 'Invalid credentials';
            } else {
                document.querySelector('#button-summarize').innerText = 'Error';
            }
        });
    })
};


let summarize = ()=>{
    console.log('hello from summarize.js')
    let prompt = document.querySelector('#summarize-prompt').value;
    console.log({function: 'summarize', prompt})
    // disable the ask button
    // wait for _fetchAnswer to return
    // enable the ask button
    // return the answer
    document.querySelector('#button-summarize').disabled = true;
    _fetchAnswer({prompt, options:{method:'POST', body:JSON.stringify({
        action: `summarize-${document.querySelector('#summarize-level').value}`,
        prompt
    })}});
};
let getSummaries = ()=>{
    console.log('hello from summarize.js')
    chrome.storage.local.get(['scribeMonsterSummary'], (data)=>{
        console.log({function: 'getSummaries', data})
    });
};
let saveSummary = ({when, prompt, response})=>{
    //scribeMonsterSummary
    chrome.storage.local.get(['scribeMonsterSummary'], (data)=>{
        if(!data.scribeMonsterSummary){
            chrome.storage.local.set({ scribeMonsterSummary: [{ when, prompt, response}]});
        }
        if(data.scribeMonsterSummary){
            chrome.storage.local.set({ scribeMonsterSummary: [...data.scribeMonsterSummary, { when, prompt, response}]});
        }
        history.setHistoryData({ storageName: 'scribeMonsterSummary' });
    });
};
let deleteSummary = ({id})=>{
    chrome.storage.local.get(['scribeMonsterSummary'], (data)=>{
       let summaries = data.scribeMonsterSummary;
       summaries.splice(id, 1);
         chrome.storage.sync.set({ scribeMonsterSummary: summaries},()=>{
             console.log('deleted summary');
         });
    });
}
let summary = {
    summarize,
    getSummaries,
    saveSummary,
    deleteSummary
}
export default summary;