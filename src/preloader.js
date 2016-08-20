/*
 *  Image preloader
 *  by Marko Kallinki, 20.08.2016
 *  Copyright - Do not distribute
 */

/*
 *  Parameter:
 *  - Map with names and urls: {"ICON1": "path/icon.gif", "ICON2": ".."}
 *
 *  Returns:
 *  - Replaces urls in given map with drawable icons
 *
 */

function preloadImages(imageUrlList, callback) {
    var count = 0;
    for(var key in imageUrlList) {
        var url = imageUrlList[key];
        count++;

        // Setup image loader
        var imageObj = new Image();
        imageObj.onload = function() {
            if (--count == 0) callback();
        }
        imageObj.onerror = function() {
            console.log("ERROR on loading: " + key + "/" + url);
            if (--count == 0) callback();
        }

        // Replace url with drawable image object
        imageObj.src = url;
        imageUrlList[key] = imageObj;
    }
}

