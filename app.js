console.log('init');

var request = new XMLHttpRequest();

// The actual image
var imageBytes = [];

// The chars at the end of the image
var endPos = "\n--myboundary";

// Started to find, finished finding
var done = false;
var started = false;

// Don't know why I have to save these to a ByteArray to do the comparisons but it seems I do
var startBytes = [];
var startByte = 0xFF;
var secondByte = 0xD8;

startBytes.push(0xFF);
startBytes.push(0xD8);


var startNum = startBytes[0];
var nextNum = startBytes[1];

// Open the stream
var request = new XMLHttpRequest();
request.open('GET', 'stream/stream_chunk', true);
request.responseType = 'arraybuffer';
request.onprogress = function updateProgress(event) {
    if (event.lengthComputable) {
        var percentComplete = Math.round((event.loaded / event.total) * 100);
        console.log('Loading: ' + percentComplete + ' %');
    }
};
request.onload = function(event) {

    console.log('running');

    var mjpegBuffer = request.response;

    console.log(arrayBuffer2String(mjpegBuffer));
    /*
    if (mjpegBuffer) {
        var byteArray = new Uint8Array(mjpegBuffer);
        for (var i = 0; i < byteArray.byteLength; i++) {

            var currentByte = mjpegBuffer[i];
            var nextByte = mjpegBuffer[i + 1];
            var thirdByte = mjpegBuffer[i + 2];
            var fourthByte = mjpegBuffer[i + 3];


            if (!started) {
                if (currentByte == startNum && nextByte == nextNum) {
                    console.log('started');
                    started = true;
                    imageBytes = [];
                    imageBytes.push(currentByte);
                }
            }
            else {
                if (currentByte == endPos.charCodeAt(0) && nextByte == endPos.charCodeAt(1) && thirdByte == endPos.charCodeAt(2) && fourthByte == endPos.charCodeAt(3)) {
                    console.log('done');
                    done = true;
                    started = false;

                    // got JPG data
                    console.log(imageBytes);
                }
                else {
                    imageBytes.push(currentByte);
                }
            }
        }
    }
    */
};

request.send(null);

function arrayBuffer2String(buf) {
    var result = '';
    if (buf) {
        var bufView = new Uint16Array(buf);
        for (var i = 0, len = bufView.byteLength; i < len; i++) {
            console.log('Converting: ' + Math.round((i / len) * 100) + ' %');
            result = result + String.fromCharCode(bufView[i]);
        }
    }
    return result;
}

function string2ArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

