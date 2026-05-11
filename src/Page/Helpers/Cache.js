var Page;
(function (Page) {
    var Helpers;
    (function (Helpers) {
        var Cache = /** @class */ (function () {
            function Cache(objectsName, loadObjectsFunction) {
                this.objectsName = objectsName;
                this.loadObjectsFunction = loadObjectsFunction;
                this.cacheObject = null;
            }
            /** @throws An Error if the ID is unknown */
            Cache.prototype.getById = function (id) {
                var object = this.safeCacheObject[id];
                if (!object) {
                    throw new Error("Invalid '".concat(this.objectsName, "' cache object id '").concat(id, "'."));
                }
                return object;
            };
            /** @returns null if the ID is unknown */
            Cache.prototype.getByIdSafe = function (id) {
                return this.safeCacheObject[id] || null;
            };
            Cache.prototype.load = function () {
                if (!this.cacheObject) {
                    this.cacheObject = this.loadCacheObject();
                }
            };
            Object.defineProperty(Cache.prototype, "safeCacheObject", {
                get: function () {
                    if (!this.cacheObject) {
                        this.load();
                    }
                    return this.cacheObject;
                },
                enumerable: false,
                configurable: true
            });
            Cache.prototype.loadCacheObject = function () {
                var index = {};
                var objects = this.loadObjectsFunction();
                for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                    var object = objects_1[_i];
                    if (typeof index[object.id] !== "undefined") {
                        throw new Error("Object '".concat(object.id, "' is already in cache."));
                    }
                    index[object.id] = object;
                }
                return index;
            };
            return Cache;
        }());
        Helpers.Cache = Cache;
    })(Helpers = Page.Helpers || (Page.Helpers = {}));
})(Page || (Page = {}));