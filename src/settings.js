let _validate = ({ user, key, domain }) => {
    console.log({ function: '_validate', user, key, domain })
    // update the button text to say "validating"
    document.querySelector('#button-validate').innerText = 'Validating...';
    // remove btn-danger class from button
    document.querySelector('#button-validate').classList.remove('btn-danger');
    let authString = getAuthString({ user, key });
    let url = `${domain}/.redwood/functions/verifyKey`;
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authString
        }
    }
    fetch(url, options)
        .then((response) => {
            return response.json();
        })
        .then(response => {
            if (response?.message === 'success') {
                // update chrome storage with user, key, and domain
                // update the button text to say "validated" for 1 second
                chrome.storage.sync.set({
                    scribeMonsterUser: user,
                    scribeMonsterKey: key,
                    scribeMonsterDomain: domain,
                    scribeMonsterAuth: authString

                }, () => {
                    console.log('user, key, and domain updated');
                    document.querySelector('#button-validate').innerText = 'Validated';
                    setTimeout(() => {
                        document.querySelector('#button-validate').innerText = 'Validate';
                    }, 1000);

                });
            } else {
                // update the button text to say "invalid credentials" and add btn-danger class
                document.querySelector('#button-validate').innerText = 'Invalid credentials';
                document.querySelector('#button-validate').classList.add('btn-danger');
            }
        })
        .catch(error => {
            // update the button text to say "invalid credentials" and add btn-danger class
            document.querySelector('#button-validate').innerText = 'Invalid credentials';
            document.querySelector('#button-validate').classList.add('btn-danger');
            console.log({ function: '_validate', error });
        });
};


let validate = () => {
    console.log('hello from validate.js')
    _validate({
        user: document.querySelector('#user').value,
        key: document.querySelector('#key').value,
        domain: document.querySelector('#domain').value
    });
};
let setDomain = () => {
    let domain = document.querySelector('#domain').value;
    // get value from domain input
    // update domain in chrome storage
    console.log('setting domain to', domain)
    chrome.storage.sync.set({ scribeMonsterDomain: domain }, () => {
        console.log('domain updated');
    });
};
let setShowButton = () => {
    let showButton = document.querySelector('#showButton').value;
    // get value from showButton input
    // update showButton in chrome storage
    console.log('setting showButton to', showButton)
    chrome.storage.sync.set({ scribeMonsterShowButton: showButton }, () => {
        console.log('showButton updated');
    })
};
let getAuthString = ({ user, key }) => {
    return `Basic ${btoa(`${user}:${key}`)}`;
}
let setFieldsFromStorage = () => {
    chrome.storage.sync.get(['scribeMonsterUser', 'scribeMonsterDomain', 'scribeMonsterShowButton'], (data) => {
        let { scribeMonsterUser, scribeMonsterDomain, scribeMonsterShowButton } = data;
        // if scribemonsteruser is null, set it to ''
        // if scribemonsterdomain is null, set it to 'https://scribe.monster'
        // if scribemonstershowbutton is null, set it to false
        scribeMonsterUser = scribeMonsterUser || '';
        scribeMonsterDomain = scribeMonsterDomain || 'https://scribe.monster';
        scribeMonsterShowButton = scribeMonsterShowButton || false;
        console.log({ function: 'loadSetting', data })
        document.querySelector('#user').value = scribeMonsterUser;
        document.querySelector('#domain').value = scribeMonsterDomain;
        document.querySelector('#showButton').value = scribeMonsterShowButton || 'Yes';
        // set active tab to the settings tab
        if (chrome.storage.local.get(['activeTab'], (data) => {
            console.log('active tab is', data);
            if (typeof data.activeTab === undefined) {
                chrome.storage.local.set({ activeTab: 'settings-tab' }, (data) => {
                    console.log('active tab set to', e.target.id, data);
                });
            }
        }));
    });
}
let popout = () => {
    // open a new window for the chrome extension
    // set the url to the html file
    // set the width and height
    // set the type to popup

    window.open("index.html", "popupWindow", "width=500,height=600");
    //window.open(chrome.getUrl('index.html'), 'Scribe Monster', 'width=400,height=400');

}
let settings = {
    validate,
    setDomain,
    setShowButton,
    getAuthString,
    setFieldsFromStorage,
    popout
}
export default settings;