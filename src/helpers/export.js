function writeBmp(arr, depth, width, height) {
    // Borrowed from https://gist.github.com/vukicevic/8112515
    let offset, data;

    function conv(size) {
        return String.fromCharCode(size&0xff, (size>>8)&0xff, (size>>16)&0xff, (size>>24)&0xff);
    }

    offset = depth <= 8 ? 54 + Math.pow(2, depth)*4 : 54;

    //BMP Header
    data  = 'BM';                          // ID field
    data += conv(offset + arr.length);     // BMP size
    data += conv(0);                       // unused
    data += conv(offset);                  // pixel data offset
    
    //DIB Header
    data += conv(40);                       // DIB header length
    data += conv(width);                    // image width
    data += conv(height);                   // image height
    data += String.fromCharCode(1, 0);      // colour panes
    data += String.fromCharCode(depth, 0);  // bits per pixel
    data += conv(0);                        // compression method
    data += conv(arr.length);               // size of the raw data
    data += conv(2835);                     // horizontal print resolution
    data += conv(2835);                     // vertical print resolution
    data += conv(0);                        // colour palette, 0 == 2^n
    data += conv(0);                        // important colours
    
    //Grayscale tables for bit depths <= 8
    if (depth <= 8) {
        data += conv(0);
        
        for (let s = Math.floor(255/(Math.pow(2, depth)-1)), i = s; i < 256; i += s)  {
            data += conv(i + i*256 + i*65536);
        }
    }
    
    //Pixel data
    data += String.fromCharCode.apply(String, arr);

    return window.btoa(data);
}

function saveDataAsFile(data,fileName,mimeType) {
    // Generate and download data as a file
    const blob = new Blob([data], {
        type: mimeType
    });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();

    setTimeout(function() {
        return window.URL.revokeObjectURL(url);
    }, 1000);
}

function mirrorBits(n) {
    // Borrowed from https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-127.php
    let t = n.toString(2).split("");
    let str_len = t.length;
    for (let i = 0; i < 8 - str_len; i++) {
        t.unshift("0");
    }
    return parseInt(t.reverse().join(""), 2);
}




module.exports = { writeBmp, mirrorBits, saveDataAsFile }