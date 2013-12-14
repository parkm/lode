var LODE = {
    loadFile: function(fileName, type, callback) {
        var request = new XMLHttpRequest();
        request.open("GET", fileName, true);
        request.responseType = type;

        if (callback) {
            request.onload = function() {
                console.log(request);
                callback(request.response);
            }
        }

        request.send();
        return request;
    }
};

LODE.File = function(path, type) {
    this.path = path;
    this.type = type;
};

//Loads Image and Audio assets that have been added.
LODE.createLoader = function() {
    'use strict';
    var assets = [];
    var loaded = 0;

    return {
        loadImage: function(src) {
            var newImage = new Image();
            newImage.src = src;
            assets.push(newImage);
            return newImage;
        },

        loadAudio: function(src) {
            var newAudio = new Audio();
            newAudio.src = src;
            assets.push(newAudio);
            return newAudio;
        },

        //Loads a file via ajax. Defaults to loading text.
        loadFile: function(path, type) {
            var file = new LODE.File(path, type);
            assets.push(file);
            return file;
        },

        //Call this when the document has been loaded. Specify a callback function to continue after the assets have been loaded.
        load: function(callback) {
            var onLoad = this.onLoad;

            var loadComplete = function(cb) {
                loaded++;

                //Meant to be overidden. Gives you the ratio of files loaded.
                if (onLoad) {
                    onLoad(loaded / assets.length);
                }

                if (loaded >= assets.length) {
                    cb();
                }
            };

            for (var i=0; i<assets.length; i++) {
                var asset = assets[i];
                if (asset instanceof Image) {
                    asset.addEventListener('load', function() {
                        loadComplete(callback);
                    });
                } else if (asset instanceof Audio) {
                    asset.addEventListener('canplay', function() {
                        loadComplete(callback);
                    });
                } else if (asset instanceof LODE.File) {
                    (function(asset) { //Requires an anonymous function since asset is used in another callback.
                        LODE.loadFile(asset.path, asset.type, function(data) {
                            asset.data = data;
                            loadComplete(callback);
                        });
                    })(asset);
                }
            }
        }
    };
};
