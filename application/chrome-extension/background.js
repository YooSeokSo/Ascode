console.log("Loaded extension");
var asURL = {
    url: []
}
const src = chrome.extension.getURL('node/js/main.js');
fetch("http://localhost:8000/api/codes").then(r => r.text()).then(result => {
        const data = JSON.parse(result);  
        console.log(typeof(data));
        console.log(data);         //파싱
    for (var i=0;i<data.length;i++) {
        var dataJSON = data[i];

    }
    console.log(asURL);
})

function blockRequest(details) {
    return {cancel: true};
}

function updateFilters(urls) {
    if(chrome.webRequest.onBeforeRequest.hasListener(blockRequest))
      chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
    chrome.webRequest.onBeforeRequest.addListener(blockRequest, {urls: asURL.url}, ['blocking']);
    chrome.tabs.query({
        currentWindow: true, active: true
    }, function(tabs) {
        alert('This extension will block the Harmful Url.');
    });
}

updateFilters();