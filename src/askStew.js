import history from "./component/history";
let _fetchAnswer = ({prompt, options, history})=>{
    // get the domain from chrome storage
    // get the auth string from chrome storage
    // fetch the answer from the api
    // save the answer to chrome storage
    // return the answer
    chrome.storage.sync.get(['scribeMonsterDomain', 'scribeMonsterAuth'], (data)=>{
        let {scribeMonsterDomain, scribeMonsterAuth} = data;
        if(!scribeMonsterAuth){
            document.querySelector('#button-ask-stew').disabled = false;
            document.querySelector('#button-ask-stew').classList.add('btn-danger');
            document.querySelector('#button-ask-stew').innerText = 'Invalid credentials';
        }
        console.log({function: '_fetchAnswer', scribeMonsterDomain, scribeMonsterAuth})
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': scribeMonsterAuth
        };
        let fullUrl = `${scribeMonsterDomain || 'https://scribe.monster'}/.redwood/functions/scribe`;
        let fullOptions = {...options, headers};
        fetch(fullUrl, fullOptions)
        .then((response)=>{
            return response.json();
        })
        .then((data)=>{
            console.log(data);
            // enable the ask button, but update the button text to say "ask stew"
            document.querySelector('#button-ask-stew').disabled = false;
            document.querySelector('#button-ask-stew').innerText = 'Ask me another!';
            document.querySelector('#button-ask-stew').classList.remove('btn-danger');
            console.log({function: '_fetchAnswer', prompt, data})
            let now = new Date();
            let when = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
            let response = data.code.trim().replace('\n','<br/>');
            saveQuestion({when, prompt, response});            
        })
        .catch((error)=>{
            console.log({function: '_fetchAnswer', error});
            // enable the ask button, but update the button text to say "error" and to have btn-danger class
            document.querySelector('#button-ask-stew').disabled = false;
            document.querySelector('#button-ask-stew').classList.add('btn-danger');
            // if error is 401, then update the button text to say "invalid credentials"
            if(error.status === 401){
                document.querySelector('#button-ask-stew').innerText = 'Invalid credentials';
            } else {
                document.querySelector('#button-ask-stew').innerText = 'Error';
            }
        });
    });
};
    
let ask = ()=>{
    let prompt = document.querySelector('#ask-prompt').value;
    console.log({function: 'ask', prompt})
    // disable the ask button
    // wait for _fetchAnswer to return
    // enable the ask button
    // return the answer
    document.querySelector('#button-ask-stew').disabled = true;
    // define action based on the level
    
    _fetchAnswer({
        prompt, 
        options:{
            method:'POST',
            body:JSON.stringify({
                action: document.querySelector('#ask-level').value,
                prompt
            })
        },
    });

};
let getQuestions = ()=>{
    // get ama history from chrome storage
    // return ama history
    chrome.storage.local.get(['scribeMonsterAma'], (data)=>{
        console.log(data.scribeMonsterAma);
    }
    );
};
let saveQuestion = ({when, prompt, response})=>{
    // get the current ama history
    // add the new question and response
    // save the ama history
    chrome.storage.local.get(['scribeMonsterAma'], (data)=>{
        if(!data.scribeMonsterAma){
            chrome.storage.local.set({ scribeMonsterAma: [{when, prompt, response}] });
        }
        if(data.scribeMonsterAma){
            chrome.storage.local.set({ scribeMonsterAma: [...data.scribeMonsterAma, {when, prompt, response}] });
        }
        history.setHistoryData({ storageName: 'scribeMonsterAma' });
    })    
};
let deleteQuestion = ({id})=>{
    // get the current ama history
    // remove the question and response at id
    // save the ama history
    chrome.storage.local.get(['scribeMonsterAma'], (data)=>{
        let ama = data.scribeMonsterAma;
        ama.splice(id,1);
        chrome.storage.local.set({scribeMonsterAma:ama},()=>{
            console.log('ama updated');
        });
    }
    );
};
let stew = {
    ask,
    getQuestions,
    saveQuestion,
    deleteQuestion
}
export default stew;