function trainScribeMonster(page) {
    // look up these! auth,instruction,input
    //log({ function: "fecthScribeMonster", script: document.getElementById(page.scriptElement) })
    chrome.storage.sync.get(['scribeMonsterAuth'], function (data) {
        let scribeMonsterAuth = data.scribeMonsterAuth;
        let completion = document.getElementById('scribeMonsterCompletion').value
        let input = document.getElementById(page.scriptElement).value;
        let prompt = document.getElementById('scribeMonsterInstruction').value;
        let action = (() => {
            var radios = {};
            radios.complete = document.getElementById('scribeMonsterAction-complete').checked;
            radios.edit = document.getElementById('scribeMonsterAction-edit').checked;
            radios.explain = document.getElementById('scribeMonsterAction-explain').checked;
            for (var prop in radios) {
                if (radios[prop]) {
                    return prop;
                }
            }
        })()
        let table = page.scriptElement.split('.')[0];
        let type = document.getElementById('sys_script_client.type')?.value || document.getElementById('catalog_script_client.type')?.value
        if ((table === 'catalog_script_client' || table === 'sys_script_client') && (type == "" || type == undefined)) {
            document.getElementById('scribeMonsterMessage').innerHTML = `You need to have the type on the client script set.`
            return;
        }
        if (action === 'explain') { prompt = "." }
        if (scribeMonsterAuth) {
            let body = { input, prompt, action, table, type, completion }
            //log({ body })
            //log({estimate, over4000: estimate > 4000, under4000: estimate<4000})
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': scribeMonsterAuth
                },
                body: JSON.stringify(body)
            };
            setProgressText();
            let domain = 'https://scribe.monster'
            domain = 'http://localhost:8910'
            let endpoint = `${domain}/.redwood/functions/promptTraining`
            fetch(endpoint, options)
                .then(response => response.json())
                .then(response => {
                    console.log({ function: 'training post', response });
                    clearInterval(progressTimer);
                    if (response?.raw?.error) {
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
                        let explaination = `1. ${response.code.split('\n').join('<br/>')}`;
                        document.getElementById('scribeMonsterMessage').innerHTML = explaination
                    }
                })
                .catch(error => console.error({ function: 'fetch', action, error }));
        }
        if (!scribeMonsterAuth) {

            document.getElementById('scribeMonsterMessage').innerHTML = `Oh no, you're not authenicated, goto https://scribe.monster and get a key.`
        }
    });
}