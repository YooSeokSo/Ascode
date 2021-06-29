console.log("Loaded extension");
const src = chrome.extension.getURL('node/js/main.js');
var asURL = [];
function blockRequest(details) {
    return {cancel: true};
}
function updateFilters(urls) {
    if(chrome.webRequest.onBeforeRequest.hasListener(blockRequest))
         chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
    chrome.webRequest.onBeforeRequest.addListener(blockRequest, { urls : urls}, ['blocking']);
} 

fetch("http://localhost:8000/api/codes").then(r => r.text()).then(result => {
        var data = JSON.parse(result);  
        console.log(typeof(data));
        console.log(data);         //파싱
     for (var i=0;i<data.length;i++) {
         var url = data[i].url;
         if(url.indexOf("www") != -1){
         var nurl = url.replace("www.","*://*.") +"/*";
         } else{ var nurl = "*://*."+url+"/*";}
         asURL.push(nurl);
    }
    updateFilters(asURL);
});