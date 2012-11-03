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
    var canvas = document.getElementById('stream');

    function display(byteArray) {

        // Overwrite it with new data
        /*
        var stringData = String.fromCharCode.apply(null, new Uint16Array(byteArray));
        var encodedData = window.btoa('JFIF' + stringData);
        
        var view = new jDataView(byteArray.buffer);
        var encodedData = window.btoa(view.getString(view.byteLength));
        */
        
        //var dataURI = 'data:image/jpeg;base64,' + base64ArrayBuffer(byteArray);

        //console.log(dataURI);
        var j = new JpegImage();
        //j.parse(byteArray);
        j.onload = function() {
            canvas.width = j.width;
            canvas.height = j.height;
            var ctx = canvas.getContext('2d');
            var d = ctx.getImageData(0, 0, j.width, j.height);
            j.copyToImageData(d);
            ctx.putImageData(d, 0, 0);
        };
        j.load('stream/7.jpg');
        
        /*
        var encodedData = window.btoa('JFIF' + stringData);
        var dataURI = 'data:image/jpeg;base64,' + encodedData;

        imgEl.src = dataURI;*/
    }

    function arrayBuffer2String(buf) {
        var bb = new Blob([buf]);
        var f = new FileReader();
        f.onload = function(e) {
            console.log(e.target.result);
        };
        f.readAsText(bb);
    }

    function base64ArrayBuffer(uint8Array) {
        var base64 = '';
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        var bytes = uint8Array;
        var byteLength = bytes.byteLength;
        var byteRemainder = byteLength % 3;
        var mainLength = byteLength - byteRemainder;

        var a, b, c, d;
        var chunk;

        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63; // 63       = 2^6 - 1

            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }

        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength];

            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3   = 2^2 - 1

            base64 += encodings[a] + encodings[b] + '==';
        }
        else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15    = 2^4 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }

        return base64;
    }
}, false);
