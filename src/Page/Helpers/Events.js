var Page;
(function (Page) {
    var Helpers;
    (function (Helpers) {
        var Events;
        (function (Events) {
            function callAfterDOMLoaded(callback) {
                if (document.readyState === "loading") { // Loading hasn't finished yet
                    document.addEventListener("DOMContentLoaded", callback);
                }
                else { // `DOMContentLoaded` has already fired
                    callback();
                }
            }
            Events.callAfterDOMLoaded = callAfterDOMLoaded;
        })(Events = Helpers.Events || (Helpers.Events = {}));
    })(Helpers = Page.Helpers || (Page.Helpers = {}));
})(Page || (Page = {}));