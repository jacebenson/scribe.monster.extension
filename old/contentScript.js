function l(message){
    console.log('scribeMonster', {...message})
}
function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
function getTitle() {
    return document.title;
  }
  const tabId = getTabId();
(()=>{
    console.log('scribeMonster before executescript')
    chrome.scripting.executeScript(
        console.log('scribeMonster in executescript')
      {
        target: {tabId: tabId, allFrames: true},
        func: getTitle,
      },
      (injectionResults) => {
        for (const frameResult of injectionResults)
          console.log('Frame Title: ' + frameResult.result);
      });
})()

try {
    //wait for window to load....
    window.addEventListener('load', function () {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            currentTab =  tabs[0];
            console.log('scribeMonster tab', currentTab)
            chrome.scripting.executeScript(
                {
                  target: {tabId: currentTab.tabId, allFrames: true},
                  files: ['inject.js'],
                },
                () => { console.log('hello') });
            
        });
        let tablink = window.location.toString()
        l({tablink})
        //chrome.storage.sync.get(['scribeMonsterAuth'], function (data) {
        //    l({data})
        //});
        chrome.storage.sync.get(['scribeMonsterAuth'], function (data) {
            l({message: 'loading stored data', data})
            let g_form = false;
            try {
                var wf = top.window.frames['gsft_main']
                l({wf})
                //console.log(g_form.getTableName());
                g_form = window.frames['gsft_main'].g_form 
            } catch (error) {
                l({message: 'could not set g_form', error})
            }
            var clientScriptCoreUI = tablink.includes('target/sys_script_client');
            if (data.scribeMonsterAuth) {
                if (clientScriptCoreUI) {
                    l({message: `on client script with auth ${data.scribeMonsterAuth} and g_form`, g_form})
                }
            }
        });
    })
} catch (error) {
    console.error('scribeMonster', error)
}
