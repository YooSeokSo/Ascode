console.log("Loaded extension");
const src = chrome.extension.getURL('node/js/main.js');
var asURL = [];
var url2 = ["*://*.youtube.com/*","*://*.facebook.com/*"];
fetch("http://localhost:8000/api/codes").then(r => r.text()).then(result => {
        const data = JSON.parse(result);  
        console.log(typeof(data));
        console.log(data);         //파싱
    for (var i=0;i<data.length;i++) {
        var dataJSON = data[i].url;
        console.dir(dataJSON);
        asURL.push(dataJSON);
        //asURL.push(dataJSON.url);
    }
})

function blockRequest(details) {
    return {cancel: true};
}
console.log(url2);
console.log(asURL);


function updateFilters(urls) {
    if(chrome.webRequest.onBeforeRequest.hasListener(blockRequest))
         chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
    chrome.webRequest.onBeforeRequest.addListener(blockRequest, { urls : urls }, ['blocking']);
    // chrome.tabs.query({
    //     currentWindow: true, active: true
    // }, function(tabs) {
    //     alert('This extension will block the Harmful Url.');
    // });
}
updateFilters(url2);
