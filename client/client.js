// const eventSrc = new EventSource(`http://bd2834feea8a.ngrok.io/sms`);
// eventSrc.onmessage = (event) =>{

// }

var source = new EventSource('http://bd2834feea8a.ngrok.io/connect');
source.onmessage = function(e) {
    var jsonData = JSON.parse(e.data);
    console.log(jsonData)
    alert("My message: " + jsonData.msg);
};