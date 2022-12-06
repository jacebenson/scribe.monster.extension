let getAuthString = (user, key)=>{
  return "Basic " + btoa(`${user}:${key}`)
}
let setDebug = (text)=>{
  //document.querySelector('#debug').value = text
}
let updateKey = () => {
  // set the chrome sync storage time to the 'select-time' value when 'button-update' is clicked
  let scribeMonsterKey = document.querySelector('#key').value;
  let scribeMonsterUser = document.querySelector('#user').value;
  let scribeMonsterAuth = getAuthString(scribeMonsterUser, scribeMonsterKey);
  chrome.storage.sync.set({ scribeMonsterKey, scribeMonsterUser, scribeMonsterAuth }, () => {
    document.querySelector('#button-update').disabled = true;
    document.querySelector('#button-update').innerText = 'Auth is set.';
    setDebug('setting to: ' + `${scribeMonsterUser}:${scribeMonsterKey}`)
    setTimeout(() => {
      document.querySelector('#button-update').disabled = false;
      document.querySelector('#button-update').innerText = 'Set your auth';
    }, 1000);
  });
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