let getAuthString = (user, key) => {
  return "Basic " + btoa(`${user}:${key}`)
}
let updateDomain = () => {
  let scribeMonsterDomain = document.querySelector('#domain').value
  if(scribeMonsterDomain == '') return;
  chrome.storage.sync.set({ scribeMonsterDomain }, () => {
    console.log('set domain', scribeMonsterDomain);
  })
}
let loadAMA = () => {
  chrome.storage.sync.get(['scribeMonsterAMA'], function (data) {
    if(data?.scribeMonsterAMA) {
      document.querySelector('#history').innerHTML = '';
      let questionsHTML = document.querySelector('#history');
      data.scribeMonsterAMA.questions.forEach(function(QandA, index){
        let total = data.scribeMonsterAMA.questions.length;
        let count = index+1;
        var newDiv=document.createElement('div')
        newDiv.setAttribute('class', 'd-inline-flex mb-1')
        var newDetails=document.createElement('details')
        newDetails.setAttribute('id',`history-${index}`)
        if(count == total){newDetails.setAttribute('open',true);}
        var newSummary=document.createElement('summary')
        newSummary.innerText=`${count}/${total}: ${QandA?.prompt?.prompt}`;
        newDetails.appendChild(newSummary);
        var newContent=document.createElement('span')
        //newContent.setAttribute('display-inline')
        newContent.innerText=`${QandA?.prompt?.text}`;
        newDetails.appendChild(newContent);
        var deleteButton=document.createElement('button');
        deleteButton.setAttribute('class', 'btn btn-danger m-3')
        deleteButton.addEventListener('click', ()=>{
          console.log({question: data.scribeMonsterAMA.questions, index});
          let filtered = data.scribeMonsterAMA.questions.filter((item,itemIndex)=>{
            console.log({item, itemIndex, index})
            if(itemIndex == index) return false;
            return true;
          })
          console.log({filtered})
          chrome.storage.sync.set({scribeMonsterAMA: {questions: [...filtered]}}, function(){
            loadAMA()
          })
        });
        deleteButton.innerText='X';
        newDiv.appendChild(deleteButton)
        newDiv.appendChild(newDetails)
        document.querySelector('#history').appendChild(newDiv)
      })
    }
  })
}
let saveAMA = (prompt, text) => {
  chrome.storage.sync.get(['scribeMonsterAMA'], function (data) {
    var AMA = {
      questions: []
    };
    console.log({function: 'history before check', data, AMA})
    if(data?.scribeMonsterAMA?.questions){
      AMA.questions = data?.scribeMonsterAMA?.questions
    }
    AMA.questions.push({when: new Date(), prompt, text})
    chrome.storage.sync.set({ scribeMonsterAMA: AMA }, (data) => {
      console.log({function: 'history after set', data, AMA})
      loadAMA()        
    })
  })
}
let removeOneAMA = (id)=>{
  chrome.storage.sync.get(['scribeMonsterAMA'], function (data) {
    let filteredAMA = data.scribeMonsterAMA.questions.filter(function(QandA, index){
      return index !== id
    })
    chrome.storage.sync.set({ scribeMonsterAMA: {questions: [...filteredAMA]} }, (data) => {
      console.log({function: 'history after set', data, AMA})
      loadAMA()        
    })
  })
}

let updateKey = () => {
  // set the chrome sync storage time to the 'select-time' value when 'button-save' is clicked
  let scribeMonsterKey = document.querySelector('#key').value;
  let scribeMonsterUser = document.querySelector('#user').value;
  let scribeMonsterAuth = getAuthString(scribeMonsterUser, scribeMonsterKey);
  chrome.storage.sync.get(['scribeMonsterDomain'], function (data) {
    if(!data.scribeMonsterDomain) data.scribeMonsterDomain = 'https://scribe.monster'
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
      }).catch(error => {
        console.error({ function: 'fetch validate key', error })
        document.querySelector('#button-save').disabled = false;
        document.querySelector('#button-save').classList.toggle('btn-danger')
        document.querySelector('#button-save').innerText = 'Fetch failed.';
      });
  })
}
let askStew = () => {
  chrome.storage.sync.get(['scribeMonsterAuth', 'scribeMonsterDomain'], function (data) {
    if(!data.scribeMonsterDomain) data.scribeMonsterDomain = 'https://scribe.monster'
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
          saveAMA({prompt: document.querySelector('#prompt').value, text: response.code})
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
      }).catch(error => {
        console.error({ function: 'fetch validate key', error })
        document.querySelector('#button-ask-stew').disabled = false;
        document.querySelector('#button-ask-stew').classList.toggle('btn-danger')
        document.querySelector('#button-ask-stew').innerText = 'Fetch failed.';
      });
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
      chrome.storage.sync.set({scribeMonsterDomain: 'https://scribe.monster'}, function (data) {})
    }
  });
}
let popout = async function() {
  window.open("popup.html", "popupWindow", "width=500,height=600");
} 
let hidePopoutButton = ()=>{
  document.querySelector('#button-pop-out').classList.toggle('d-none');
}
// add event listener to 'button-save'
setValuesFromChromeStorage();
loadAMA();
document.querySelector('#button-save').addEventListener('click', updateKey);
document.querySelector('#button-ask-stew').addEventListener('click', askStew);
document.querySelector('#domain').addEventListener('keyup', updateDomain);
document.querySelector('#button-pop-out').addEventListener('click', popout)