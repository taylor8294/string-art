export function downloadTextFile(textContent, filename) {
  var type = "text/plain";
  var blob = new Blob([textContent], {
    type : type
  });
  if (void 0 !== window.navigator && void 0 !== window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.download = filename;
    a.href = url;
    a.dataset.downloadurl = "".concat(type, ":").concat(a.download, ":").concat(a.href);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, 5000);
  }
}

export function getQueryStringValue(name) {
  var href = window.location.href;
  var queryPos = href.indexOf("?");
  if (queryPos >= 0) {
    var queryString = href.substring(queryPos + 1);
    if (queryString.length > 0) {
      var i = 0;
      var queryParams = queryString.split("&");
      for (;i < queryParams.length;i++) {
        var param = queryParams[i].split("=");
        if (2 === param.length && decodeURIComponent(param[0]) === name) {
          return decodeURIComponent(param[1]);
        }
      }
    }
  }
  return null;
}

export function declarePolyfills() {
  if ("function" != typeof Array.prototype.includes) {
    console.log("Declaring Array.includes polyfill...");
    Object.defineProperty(Array.prototype, "includes", {
      value : function(substring) {
        return this.indexOf(substring) >= 0;
      }
    });
  }
  if ("function" != typeof String.prototype.repeat) {
    console.log("Declaring String.repeat polyfill...");
    Object.defineProperty(String.prototype, "repeat", {
      value : function(right) {
        if (right < 0 || right === 1 / 0) {
          throw new RangeError;
        }
        var d = "";
        var left = 0;
        for (;left < right;left++) {
          d += this;
        }
        return d;
      }
    });
  }
}