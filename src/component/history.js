let destroyHistoryTable = ({id})=>{
    let historyTable = document.getElementById(id);
    if(historyTable){
        historyTable.remove();
    }
}
let getHistoryData = ({storageName})=>{
  // get storageName from chrome storage
  // return storageName
  // create variable to hold the data
  console.log({function:'getHistoryData', storageName})
  let returnData = {};
  chrome.storage.local.get([storageName], (data)=>{
      console.log(data[storageName]);
      // once we have the data, we can generate the table
      returnData = data[storageName]
    });
  console.log({function:'getHistoryData', returnData})
  return returnData;
}

let removeHistoryItem = ({storageName, id})=>{
  // get storageName from chrome storage
  // remove the item at id
  // save the storageName
  console.log({function:'removeHistoryItem', storageName, id})
  chrome.storage.local.get([storageName], (data)=>{
    let history = data[storageName];
    history.splice(id,1);
    chrome.storage.local.set({[storageName]:history},()=>{
      console.log('history updated');
      setHistoryData({storageName});
    });
  }
  );
}

let setHistoryData = ({storageName}) => {
  // find the tbody element with 'history-table-body-${history.id}'
  // clear the tbody element
  // loop through the history data
  //   generate a row for each item in the history data
  chrome.storage.local.get([storageName], (data)=>{
  let querySelector = `#history-table-body-${storageName}`;
  console.log({function:'setHistoryData', storageName, querySelector})
  document.querySelector(`#history-table-body-${storageName}`).innerHTML = '';
  if(!data[storageName]){ 
    document.querySelector(`#history-table-body-${storageName}`).innerHTML = '<tr><td colspan="2">no history</td></tr>';
    return
  }
  let histories = data[storageName].map((item, index)=>{
    let htmlResponse = new DOMParser().parseFromString(item.response, "text/html");
    let mermaidElement = htmlResponse.querySelector('.mermaid');
    console.log({mermaidElement})
    if(mermaidElement?.innerText){
    let mermaidCodeBase64 = btoa(mermaidElement.innerText);
    let mermaidImageUrl = `https://mermaid.ink/img/${mermaidCodeBase64}`;
    let mermaidImage = document.createElement('img');
    // image max width is 400px
    mermaidImage.style = 'max-width:400px';
    mermaidImage.src = mermaidImageUrl;
    let mermaidLink = document.createElement('a');
    mermaidLink.setAttribute('target', '_blank');
    mermaidLink.setAttribute('href', mermaidImageUrl);
    mermaidLink.innerText = 'View (right-click to open) Full Size';
    mermaidElement.parentNode.insertBefore(mermaidLink, mermaidElement.nextSibling);
    mermaidElement.parentNode.insertBefore(mermaidImage, mermaidElement.nextSibling);
    mermaidElement.style = 'display:none';
    }

    let shortPrompt = item.prompt.substring(0, 20);
    let row = document.createElement('tr');
    let rowHeader = document.createElement('th');
    rowHeader.scope = 'row';
    let deleteButton = document.createElement('button');
    deleteButton.classList.add('btn');
    deleteButton.classList.add('btn-danger');
    deleteButton.dataset.id = index;
    deleteButton.dataset.storage = storageName;
    deleteButton.innerHTML = 'X';
    rowHeader.appendChild(deleteButton);
    row.appendChild(rowHeader);
    let rowDetails = document.createElement('td');
    let details = document.createElement('details');
    let summary = document.createElement('summary');
    let h3 = document.createElement('h3');
    h3.style = 'display:inline';
    h3.innerHTML = shortPrompt;
    summary.appendChild(h3);
    details.appendChild(summary);
    let div = document.createElement('div');
    div.style = 'text-align:left';
    let promptDetails = document.createElement('details');
    let promptSummary = document.createElement('summary');
    promptSummary.innerHTML = 'Full Prompt';
    promptDetails.appendChild(promptSummary);
    let promptDiv = document.createElement('div');
    promptDiv.innerHTML = item.prompt;
    promptDetails.appendChild(promptDiv);
    div.appendChild(promptDetails);
    let hr = document.createElement('hr');
    div.appendChild(hr);
    let responseDetails = document.createElement('details');
    responseDetails.open = true;
    responseDetails.style = 'white-space: pre-line';
    let responseSummary = document.createElement('summary');
    responseSummary.innerHTML = 'Full Response';
    responseDetails.appendChild(responseSummary);
    let responseDiv = document.createElement('div');
    responseDiv.id = `response-${index}`;
    responseDiv.contentEditable = true;
    responseDiv.innerHTML = htmlResponse.body.innerHTML;//?
    responseDetails.appendChild(responseDiv);
    div.appendChild(responseDetails);
    details.appendChild(div);
    rowDetails.appendChild(details);
    row.appendChild(rowDetails);
    // return the html for the row
    return row.outerHTML;
  });

  
  document.querySelector(`#history-table-body-${storageName}`).innerHTML = histories.join('');
  // once we have created the rows, add event listeners to the delete buttons
  document.querySelectorAll(`#history-table-body-${storageName} button`).forEach((button)=>{
    button.addEventListener('click', (e)=>{
      console.log('clicked', e.target);
      removeHistoryItem({storageName, id: e.target.dataset.id});
    })
  });
})
}

let generateHistoryTable = ({id, column})=>{
  console.log({function:'generateHistoryTable', id, column})
    return `
    <table id="${id}" class="table"><!--TODO: ADD A BUTTON TO DELETE THE RECORD--->
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">${column}</th>
        </tr>
      </thead>
      <tbody id="history-table-body-${id}">
        <tr><td>loading...</td></tr>
      </tbody>
    </table>
    `
}
let history = {
    getHistoryData,
    generateHistoryTable,
    setHistoryData,
    removeHistoryItem,
}

export default history;