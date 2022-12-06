let getAuthString = (user, key)=>{
  return "Basic " + btoa(`${user}:${key}`)
}
let setDebug = (text)=>{
  document.querySelector('#debug').value = text
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
let currentTab = false;
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  currentTab =  tabs[0];
});
let getDetails = () => {
  console.log('currentTab', currentTab)
    let titleInput = document.querySelector('#select-title').value
    let urlInput = document.querySelector('#select-url').value
    console.log('trying to set title to', currentTab.title)
    document.querySelector('#select-title').value = currentTab.title;
    document.querySelector('#select-url').value = currentTab.url;
}
let submitItem = () => {
    if (newsJaceProKey) {
      var data = {
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "submitKey": newsJaceProKey,
        },
        "body": JSON.stringify({
          "title": document.querySelector('#select-title').value || currentTab.title,
          "url": document.querySelector('#select-url').value || currentTab.url
        })
      }
      document.querySelector('#response').innerText = 'Sending data...' + '\n' + JSON.stringify(JSON.parse(data.body), null, ' ');
      console.log('snding data', JSON.parse(data.body))
      fetch("https://news.jace.pro/.redwood/functions/submitItem", data)
        .then(response => {
          console.log('response', response);
          document.querySelector('#response').innerText = 'response: \n' + JSON.stringify(response, null, ' ');
        })
        .catch(err => {
          console.error('err', err);
          document.querySelector('#response').innerText = 'error: \n' + JSON.stringify(err, null, ' ');
        });
    }
    

}
// add event listener to 'button-update'
document.querySelector('#button-update').addEventListener('click', updateKey);
document.querySelector('#button-submit').addEventListener('click', submitItem);
document.querySelector('#button-getter').addEventListener('click', getDetails);