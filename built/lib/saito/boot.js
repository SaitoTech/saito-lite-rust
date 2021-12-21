// @ts-nocheck
//
// this file is appended to the start of the saito.js script
// and runs as its "bootloader" -- it checks to see if the
// user already has a pre-compiled version of saito.js that
// is not the default software, and swaps it in instead of
// the default if it exists and can be found.
//
if (typeof (Storage) !== "undefined") {
    var mySource = document.currentScript.src;
    var sscript = document.getElementById("saito");
    var data = null;
    var options = null;
    var bundle = null;
    data = localStorage.getItem("options");
    if (data) {
        options = JSON.parse(data);
    }
    if (options) {
        bundle = options.bundle;
    }
    if (bundle != null && bundle != "") {
        if (bundle != mySource) {
            document.body.removeChild(sscript);
            var sscript2 = document.createElement('script');
            sscript2.onload = function () {
            };
            sscript2.src = bundle;
            document.body.appendChild(sscript2);
            throw new Error('Exiting before we load bad javascript...!');
        }
    }
}
//# sourceMappingURL=boot.js.map