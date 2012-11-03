window.addEventListener('DOMContentLoaded', function() {

    console.log('init');
    
    var start = 0;

    // Open the stream
    var request = new XMLHttpRequest();
    request.open('GET', 'stream/stream_chunk_small', true);
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

        var image = [];
        var end = 0;
        var offset = start;
        var marker = [];
        var value = false;

        // If there are bytes and the offset is at the start
        // Look for a JPEG image
        if (mjpegBuffer) {
            var byteArray = new Uint8Array(mjpegBuffer);

            if (start === 0) {
                // Look for the start of the JPEG
                for (offset; offset < byteArray.byteLength - 1; offset++) {
                    marker[0] = byteArray[offset];
                    marker[1] = byteArray[offset + 1];

                    if (marker[0] == 255 && marker[1] == 216) {
                        start = offset;
                        break;
                    }
                }
            }

            // Look for the end of the JPEG
            for (offset; offset < byteArray.byteLength - 1; offset++) {
                marker[0] = byteArray[offset];
                marker[1] = byteArray[offset + 1];

                if (marker[0] == 255 && marker[1] == 217) {
                    end = offset;

                    // Grab image if an end is found
                    image = byteArray.subarray(start, end);

                    // Display
                    display(image);

                    // Remove image from incoming buffer
                    byteArray = byteArray.subarray(end);

                    // Reset values
                    start = 0;
                    offset = 0;

                    // Denote that an image has been found
                    value = true;
                }
            }

            // No image found by default
            return value;
        }

        //arrayBuffer2String(mjpegBuffer);
    };

    request.send(null);

    // Grab the existing image
    var imgEl = document.getElementById('stream');

    function display(byteArray) {

        // Overwrite it with new data
        var stringData = String.fromCharCode.apply(null, new Uint16Array(byteArray));
        var encodedData = window.btoa(stringData);
        var dataURI = "data:image/jpeg;base64," + encodedData;
        
        console.log(dataURI);
        
        imgEl.src = dataURI;
    }

    function arrayBuffer2String(buf) {
        var bb = new Blob([buf]);
        var f = new FileReader();
        f.onload = function(e) {
            console.log(e.target.result);
        };
        f.readAsText(bb);
    }
}, false);
