var Page;
(function (Page) {
    var Helpers;
    (function (Helpers) {
        var Utils;
        (function (Utils) {
            function selectorAll(base, selector) {
                var elements = base.querySelectorAll(selector);
                var result = [];
                for (var i = 0; i < elements.length; i++) {
                    result.push(elements[i]);
                }
                return result;
            }
            Utils.selectorAll = selectorAll;
            /** @throws if no element was found */
            function selector(base, selector) {
                var element = base.querySelector(selector);
                if (!element) {
                    throw new Error("No element matching '".concat(selector, "'."));
                }
                return element;
            }
            Utils.selector = selector;
            function touchArray(touchList) {
                var result = [];
                for (var i = 0; i < touchList.length; i++) {
                    result.push(touchList[i]);
                }
                return result;
            }
            Utils.touchArray = touchArray;
            function findFirst(array, predicate) {
                if (typeof Array.prototype.findIndex === "function") {
                    return array.findIndex(predicate);
                }
                else {
                    for (var i = 0; i < array.length; i++) {
                        if (predicate(array[i])) {
                            return i;
                        }
                    }
                    return -1;
                }
            }
            Utils.findFirst = findFirst;
        })(Utils = Helpers.Utils || (Helpers.Utils = {}));
    })(Helpers = Page.Helpers || (Page.Helpers = {}));
})(Page || (Page = {}));