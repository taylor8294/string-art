var Page;
(function (Page) {
    var Helpers;
    (function (Helpers) {
        var Storage = /** @class */ (function () {
            function Storage(prefix, serialize, tryDeserialize) {
                this.prefix = prefix;
                this.serialize = serialize;
                this.tryDeserialize = tryDeserialize;
            }
            Storage.prototype.storeState = function (control) {
                var valueAsString = this.serialize(control);
                Page.Helpers.URL.setQueryParameter(this.prefix, control.id, valueAsString);
            };
            Storage.prototype.clearStoredState = function (control) {
                Page.Helpers.URL.removeQueryParameter(this.prefix, control.id);
            };
            Storage.prototype.applyStoredState = function () {
                var _this = this;
                Page.Helpers.URL.loopOnParameters(this.prefix, function (controlId, value) {
                    if (!_this.tryDeserialize(controlId, value)) {
                        console.log("Removing invalid query parameter '" + controlId + "=" + value + "'.");
                        Page.Helpers.URL.removeQueryParameter(_this.prefix, controlId);
                    }
                });
            };
            return Storage;
        }());
        Helpers.Storage = Storage;
    })(Helpers = Page.Helpers || (Page.Helpers = {}));
})(Page || (Page = {}));