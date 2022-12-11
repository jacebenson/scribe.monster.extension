let getAuthString = (user, key) => {
  return "Basic " + btoa(`${user}:${key}`)
}
let setDebug = (text) => {
  //document.querySelector('#debug').value = text
}
let updateKey = () => {
  // set the chrome sync storage time to the 'select-time' value when 'button-update' is clicked
  let scribeMonsterKey = document.querySelector('#key').value;
  let scribeMonsterUser = document.querySelector('#user').value;
  let scribeMonsterAuth = getAuthString(scribeMonsterUser, scribeMonsterKey);
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': scribeMonsterAuth
    },
  };
  document.querySelector('#button-update').disabled = true;
  document.querySelector('#button-update').innerText = 'Checking...';
  document.querySelector('#button-update').classList.remove('btn-danger')
  fetch('https://scribe.monster/.redwood/functions/verifyKey', options)
    .then(response => response.json())
    .then(response => {
      //console.log({ response });

      if (response?.message === 'success') {
        chrome.storage.sync.set({ scribeMonsterKey, scribeMonsterUser, scribeMonsterAuth }, () => {
          document.querySelector('#button-update').disabled = true;
          document.querySelector('#button-update').innerText = 'Success';
          setDebug('setting to: ' + `${scribeMonsterUser}:${scribeMonsterKey}`)
          setTimeout(() => {
            document.querySelector('#button-update').disabled = false;
            document.querySelector('#button-update').innerText = 'Save';
          }, 1000);
        });
      }
      if(response?.error){
        document.querySelector('#button-update').classList.toggle('btn-danger')
        document.querySelector('#button-update').innerText = 'Invalid Key';
        setTimeout(() => {
          document.querySelector('#button-update').disabled = false;
          document.querySelector('#button-update').innerText = 'Try again';
        }, 1000);
      }
    }).catch(error => console.error({function: 'fetch validate key', error}));
}

let scribeMonsterAuth = false;
chrome.storage.sync.get(['scribeMonsterKey', 'scribeMonsterUser', 'scribeMonsterAuth'], function (data) {
  if (data.scribeMonsterKey && data.scribeMonsterUser) {
    document.querySelector('#user').value = data.scribeMonsterUser
    document.querySelector('#key').value = data.scribeMonsterKey
    setDebug('auth string: ' + getAuthString())
  }
});
// add event listener to 'button-update'
document.querySelector('#button-update').addEventListener('click', updateKey);
//document.querySelector('#button-submit').addEventListener('click', submitItem);
//document.querySelector('#button-getter').addEventListener('click', getDetails);