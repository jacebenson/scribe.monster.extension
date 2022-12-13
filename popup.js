let getAuthString = (user, key) => {
  return "Basic " + btoa(`${user}:${key}`)
}
let updateDomain = () => {
  let scribeMonsterDomain = document.querySelector('#domain').value
  chrome.storage.sync.set({ scribeMonsterDomain }, () => {
    console.log('set domain')
  })
}
let updateKey = () => {
  // set the chrome sync storage time to the 'select-time' value when 'button-save' is clicked
  let scribeMonsterKey = document.querySelector('#key').value;
  let scribeMonsterUser = document.querySelector('#user').value;
  let scribeMonsterAuth = getAuthString(scribeMonsterUser, scribeMonsterKey);
  chrome.storage.sync.get(['scribeMonsterDomain'], function (data) {
    document.querySelector('#button-save').disabled = true;
    document.querySelector('#button-save').innerText = `Checking... ${data.scribeMonsterDomain}`;
    document.querySelector('#button-save').classList.remove('btn-danger')
    fetch(`${data.scribeMonsterDomain}/.redwood/functions/verifyKey`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': scribeMonsterAuth
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response?.message === 'success') {
          chrome.storage.sync.set({ scribeMonsterKey, scribeMonsterUser, scribeMonsterAuth }, () => {
            document.querySelector('#button-save').disabled = true;
            document.querySelector('#button-save').innerText = 'Success';
            setTimeout(() => {
              document.querySelector('#button-save').disabled = false;
              document.querySelector('#button-save').innerText = 'Save';
            }, 1000);
          });
        }
        if (response?.error) {
          document.querySelector('#button-save').classList.toggle('btn-danger')
          document.querySelector('#button-save').innerText = 'Invalid Key';
          setTimeout(() => {
            document.querySelector('#button-save').disabled = false;
            document.querySelector('#button-save').innerText = 'Try again';
          }, 1000);
        }
      }).catch(error => console.error({ function: 'fetch validate key', error }));
  })
}
let askStew = () => {
  chrome.storage.sync.get(['scribeMonsterAuth', 'scribeMonsterDomain'], function (data) {
    document.querySelector('#button-ask-stew').disabled = true;
    document.querySelector('#button-ask-stew').innerText = `Loading...`;
    document.querySelector('#button-ask-stew').classList.remove('btn-danger')
    fetch(`${data.scribeMonsterDomain}/.redwood/functions/scribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': data.scribeMonsterAuth
      },
      body: JSON.stringify({
        action: 'ask',
        prompt: document.querySelector('#prompt').value
      })
    })
      .then(response => response.json())
      .then(response => {
        console.log({ response });
        if (response?.code) {
          document.querySelector('#response').value = document.querySelector('#prompt').value + response.code;
          document.querySelector('#button-ask-stew').disabled = true;
          document.querySelector('#button-ask-stew').innerText = 'Wahoo!';
          setTimeout(() => {
            document.querySelector('#button-ask-stew').disabled = false;
            document.querySelector('#button-ask-stew').innerText = 'Ask me something else!';
          }, 1000);
        } else {
          document.querySelector('#response').value = 'There was a problem.  Sorry.'
        }
      }).catch(error => console.error({ function: 'fetch validate key', error }));
  })
}
function setValuesFromChromeStorage() {
  chrome.storage.sync.get(['scribeMonsterKey', 'scribeMonsterUser', 'scribeMonsterAuth', 'scribeMonsterDomain'], function (data) {
    if (data.scribeMonsterKey && data.scribeMonsterUser) {
      document.querySelector('#user').value = data.scribeMonsterUser
      document.querySelector('#key').value = data.scribeMonsterKey
    }
    if (data.scribeMonsterDomain) {
      document.querySelector('#domain').value = data.scribeMonsterDomain
    } else {
      chrome.storage.sync.get({scribeMonsterDomain: 'https://scribe.monster'}, function (data) {
        document.querySelector('#domain').value = 'https://scribe.monster';
      })
    }
  });
}
// add event listener to 'button-save'
setValuesFromChromeStorage();
document.querySelector('#button-save').addEventListener('click', updateKey);
document.querySelector('#button-ask-stew').addEventListener('click', askStew);
document.querySelector('#domain').addEventListener('keyup', updateDomain);