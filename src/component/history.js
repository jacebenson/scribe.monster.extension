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
    let shortPrompt = item.prompt.substring(0, 20);
    // create a delete button in the fist column
    //let historyRow = document.createElement('tr');
    //let historyRowHeader = document.createElement('th');
    //historyRowHeader.scope = 'row';
    //let historyRowHeaderButton = document.createElement('button');
    //historyRowHeaderButton.className = 'btn btn-danger';
    //historyRowHeaderButton.dataset.id = index;
    //historyRowHeaderButton.dataset.storage = storageName;
    //historyRowHeaderButton.onclick = removeHistoryItem;
    //historyRowHeaderButton.innerHTML = 'X';
    //historyRowHeader.appendChild(historyRowHeaderButton);
    //historyRow.appendChild(historyRowHeader);
    //// create a details element in the second column
    //let historyRowDetails = document.createElement('td');
    //let historyRowDetailsSummary = document.createElement('summary');
    //let historyRowDetailsSummaryH3 = document.createElement('h3');
    //historyRowDetailsSummaryH3.style = 'display:inline;';
    //historyRowDetailsSummaryH3.innerHTML = shortPrompt;
    //historyRowDetailsSummary.appendChild(historyRowDetailsSummaryH3);
    //let historyRowDetailsDetails = document.createElement('details');
    //let historyRowDetailsDetailsSummary = document.createElement('summary');
    //historyRowDetailsDetailsSummary.innerHTML = 'Full Prompt';
    //let historyRowDetailsDetailsDetails = document.createElement('details');
    //let historyRowDetailsDetailsDetailsSummary = document.createElement('summary');
    //historyRowDetailsDetailsDetailsSummary.innerHTML = 'Full Response';
    //let historyRowDetailsDetailsDetailsDetails = document.createElement('details');
    //historyRowDetailsDetailsDetailsDetails.innerHTML = item.response;
    //historyRowDetailsDetailsDetails.appendChild(historyRowDetailsDetailsDetailsSummary);
    //historyRowDetailsDetailsDetails.appendChild(historyRowDetailsDetailsDetailsDetails);
    //historyRowDetailsDetails.appendChild(historyRowDetailsDetailsSummary);
    //historyRowDetailsDetails.appendChild(historyRowDetailsDetailsDetails);
    //historyRowDetails.appendChild(historyRowDetailsSummary);
    //historyRowDetails.appendChild(historyRowDetailsDetails);
    //historyRow.appendChild(historyRowDetails);
    //return historyRow;

    //onclick="removeHistoryItem({storageName:'${storageName}', id:${index}})"
      return `
      <tr>
        <th scope="row">
          <button class="btn btn-danger" data-id="${index}" data-storage="${storageName}" >X</button>
        </th>
        <td>
          <details>
            <summary><h3 style="display:inline;">${shortPrompt}</h3></summary>
            <div style="text-align:left">
              <details><summary>Full Prompt</summary>${item.prompt}</details>
              <hr/>
              <details open="true" style="white-space: pre-line"><summary>Full Response</summary><div  contenteditable="true" >${item.response}<div></details>
            </div>
          </details>
        </td>
      </tr>
      `
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