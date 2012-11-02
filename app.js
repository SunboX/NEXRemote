var request = new XMLHttpRequest();
request.open('GET', '/stream/stream_chunk', true);
request.responseType = 'arraybuffer';

request.onload = function(oEvent) {
    var arrayBuffer = request.response;
    if (arrayBuffer) {
        var byteArray = new Uint8Array(arrayBuffer);
        for (var i = 0; i < byteArray.byteLength; i++) {
            // do something with each byte in the array
            console.log(byteArray[i]);
        }
    }
};

request.send(null);