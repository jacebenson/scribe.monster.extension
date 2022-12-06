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
try {
    //wait for window to load....
    window.addEventListener('load', function () {

        injectScript( chrome.extension.getURL('/g_form.js'), 'body');

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
