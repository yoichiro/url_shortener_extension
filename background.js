var Gl = function() {
    this.initialize();
};

Gl.prototype = {
    initialize: function() {
    },
    getAccessToken: function() {
        return localStorage["access_token"];
    },
    lookupUserHistory: function(callbacks) {
        var accessToken = this.getAccessToken();
        if (accessToken) {
            var url = "https://www.googleapis.com/urlshortener/v1/url/history";
            new Ajax.Request(url, {
                method: "get",
                parameters: {
                    projection: "FULL"
                },
                requestHeaders: [
                    "Authorization", "OAuth " + accessToken
                ],
                onSuccess: callbacks.onSuccess,
                onFailure: callbacks.onFailure,
                onComplete: callbacks.onComplete
            });
            return true;
        } else {
            return false;
        }
    },
    shortenLongUrl: function(longUrl, callbacks) {
        var accessToken = this.getAccessToken();
        if (accessToken) {
            var url = "https://www.googleapis.com/urlshortener/v1/url";
            new Ajax.Request(url, {
                method: "post",
                contentType: "application/json",
                postBody: Object.toJSON({
                    longUrl: longUrl
                }),
                requestHeaders: [
                    "Authorization", "OAuth " + accessToken
                ],
                onSuccess: callbacks.onSuccess,
                onFailure: callbacks.onFailure,
                onComplete: callbacks.onComplete
            });
            return true;
        } else {
            return false;
        }
    }
};

var gl = new Gl();
