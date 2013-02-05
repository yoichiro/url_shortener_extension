var Utils = function() {
};

Utils.prototype = {
    setVisible: function(elem, visible) {
        Element.setStyle(elem, {
            display: visible ? "block" : "none"
        });
    },
    createElement: function(name, attributes, classNames, parent) {
        var element = document.createElement(name);
        for (var k in attributes) {
            element.setAttribute(k, attributes[k]);
        }
        for (var i = 0; i < classNames.length; i++) {
            element.addClassName(classNames[i]);
        }
        parent.appendChild(element);
        return element;
    },
    createTextNode: function(value, parent) {
        var textNode = document.createTextNode(value);
        parent.appendChild(textNode);
        return textNode;
    },
    getOAuthWindow: function(callback) {
        var host = location.host;
        var url = "https://accounts.google.com/o/oauth2/auth?"
            + "client_id="
            + "1023119050412.apps.googleusercontent.com"
            + "&redirect_uri="
            + encodeURIComponent("http://www.eisbahn.jp/implicit/bridge.html")
            + "&scope="
            + encodeURIComponent("https://www.googleapis.com/auth/urlshortener")
            + "&response_type=token"
            + "&state="
            + host;
        var oauthWindow = shindig.oauth.popup({
            destination: url,
            windowOptions: "width=640,height=480",
            onOpen: function() {},
            onClose: function() {
                chrome.runtime.getBackgroundPage(function(bg) {
                    bg.gl.onAuthorized();
                    if (callback) {
                        callback();
                    }
                });
            }
        });
        return oauthWindow;
    }
};

var utils = new Utils();
