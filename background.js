/*async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
async function getPageVar(name, tabId) {
    const [{ result }] = await chrome.scripting.executeScript({
        func: name => window[name],
        args: [name],
        target: {
            tabId: tabId ??
                (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id
        },
        world: 'MAIN',
    });
    return result;
}*/