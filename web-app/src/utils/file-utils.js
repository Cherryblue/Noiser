// From https://stackoverflow.com/questions/43135852/javascript-export-to-text-file
var downloadObjToJSON = (function () {
    if (typeof document !== 'undefined'){
        var a = document.createElement("a");
        return function (data, fileName) {
            var json = JSON.stringify(data),
                    blob = new Blob([json], {type: "octet/stream"}),
                    url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
        };
    }
}());

//function downloadObjToJSON(){}

export { downloadObjToJSON };
