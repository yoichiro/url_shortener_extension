var Gl = function() {
    this.initialize();
};

Gl.prototype = {
    timers: null,
    gotHistory: false,
    apiKey: null,
    initialize: function() {
        this.apiKey = "AIzaSyAJ6oQbZn48_6pXfsxTazU9IOf_oan-QgY";
        this.timers = new Array();
    },
    showOAuthCompletedNofitication: function() {
        var notification = webkitNotifications.createNotification(
            "./url_shortener_extension_48.png",
            "URL Shortener extension",
            "Authentication completed. Please push the extension button again."
        );
        notification.show();
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
                onSuccess: function(req) {
                    this.gotHistory = true;
                    callbacks.onSuccess(req);
                }.bind(this),
                onFailure: function(req) {
                    this.gotHistory = false;
                    callbacks.onFailure(req);
                }.bind(this),
                onComplete: callbacks.onComplete
            });
            return true;
        } else {
            return false;
        }
    },
    shortenLongUrl: function(longUrl, callbacks) {
        var url = "https://www.googleapis.com/urlshortener/v1/url";
        var params = {
            method: "post",
            contentType: "application/json",
            postBody: Object.toJSON({
                longUrl: longUrl
            }),
            onSuccess: callbacks.onSuccess,
            onFailure: callbacks.onFailure,
            onComplete: callbacks.onComplete
        };
        if (this.coudlGetHistory()) {
            var accessToken = this.getAccessToken();
            params["requestHeader"] = [
                "Authorization", "OAuth " + accessToken
            ];
        } else {
            url += "?key=" + this.apiKey;
        }
        new Ajax.Request(url, params);
    },
    startWatchCount: function(shortUrl) {
        for (var i = 0; i < this.timers.length; i++) {
            clearTimeout(this.timers[i]);
        }
        this.timers = new Array();
        if (!shortUrl) {
            chrome.browserAction.setBadgeText({text: ""});
            return;
        }
        this.setBadge(null, -2);
        var url = "https://www.googleapis.com/urlshortener/v1/url";
        new Ajax.Request(url, {
            method: "get",
            parameters: {
                key: this.apiKey,
                shortUrl: shortUrl,
                projection: "FULL"
            },
            onSuccess: function(req) {
                this.setBadge(shortUrl,
                              req.responseJSON.analytics.allTime.shortUrlClicks);
            }.bind(this),
            onFailure: function(req) {
                this.setBadge(null, -1);
            }.bind(this),
            onException: function(req, exception) {
                this.setBadge(null, -1);
            }.bind(this),
            onComplete: function(req) {
                var timer = setTimeout(function() {
                    this.startWatchCount(shortUrl);
                }.bind(this), 60000);
                this.timers.push(timer);
            }.bind(this)
        });
    },
    setBadge: function(shortUrl, value) {
        var text = value;
        var color = [0, 200, 0, 255];
        if (value == -1) {
            text = "E";
            color = [200, 0, 0, 255];
        } else if (value == -2) {
            text = "-";
            color = [0, 0, 200, 255];
        }
        if (shortUrl) {
            chrome.browserAction.setTitle({title: shortUrl});
        } else {
            chrome.browserAction.setTitle({title: "URL Shortener"});
        }
        chrome.browserAction.setBadgeText({text: text});
        chrome.browserAction.setBadgeBackgroundColor({color: color});
    },
    coudlGetHistory: function() {
        return this.gotHistory;
    }
};

var gl = new Gl();
