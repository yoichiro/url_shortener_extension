var Gl = function() {
    this.initialize();
};

Gl.prototype = {
    timers: null,
    authorized: false,
    shortenerApiKey: null,
    oauthWindow: null,
    oauthTimer: null,
    expireTokenTime: null,
    contextMenuIds: null,
    readItLaterApiKey: null,
    initialize: function() {
        this.clearToken();
        this.shortenerApiKey = "AIzaSyAJ6oQbZn48_6pXfsxTazU9IOf_oan-QgY";
        this.readItLaterApiKey = "c77dFl55T3c8eq4bOuAi94cn90g8Id84";
        this.timers = new Array();
        this.setupOAuthWindow();
        this.contextMenuIds = new Array();
        this.setupContextMenus(false);
    },
    clearToken: function() {
        delete localStorage["access_token"];
        delete localStorage["expires_in"];
    },
    setupOAuthWindow: function() {
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
        this.oauthWindow = shindig.oauth.popup({
            destination: url,
            windowOptions: "width=640,height=480",
            onOpen: function() {},
            onClose: function() {
                this.authorized = true;
                this.setupContextMenus();
                this.startOAuthTimer();
                this.showOAuthCompletedNofitication();
            }.bind(this)
        });
    },
    getOAuthWindow: function() {
        return this.oauthWindow;
    },
    startOAuthTimer: function() {
        if (this.oauthTimer) {
            clearTimeout(this.oauthTimer);
        }
        var expiresIn = Number(localStorage["expires_in"]);
        this.expireTokenTime = (new Date()).getTime() + expiresIn * 1000;
        this.onOAuthTimer();
    },
    onOAuthTimer: function() {
        var remaining = this.expireTokenTime - (new Date()).getTime();
        if (remaining > 0) {
            this.oauthTimer = setTimeout(function() {
                this.onOAuthTimer();
            }.bind(this), 5000);
        } else {
            this.authorized = false;
            this.clearToken();
            this.setupContextMenus();
        }
    },
    setupContextMenus: function() {
        for (var i = 0; i < this.contextMenuIds.length; i++) {
            chrome.contextMenus.remove(this.contextMenuIds[i]);
        }
        this.contextMenuIds = new Array();
        if (this.isShowContextMenus()) {
            if (this.authorized) {
                this.contextMenuIds.push(
                    chrome.contextMenus.create(
                        this.createContextMenu(
                            chrome.i18n.getMessage("ctxmenuShortenUrlAdded")))
                );
            } else {
                this.contextMenuIds.push(
                    chrome.contextMenus.create({
                        type: "normal",
                        title: chrome.i18n.getMessage("ctxmenuLogin"),
                        contexts: ["page"],
                        onclick: function(info, tab) {
                            this.oauthWindow.createOpenerOnClick()();
                        }.bind(this)
                    })
                );
                this.contextMenuIds.push(
                    chrome.contextMenus.create(
                        this.createContextMenu(
                            chrome.i18n.getMessage("ctxmenuShortenUrlNotAdded")))
                );
            }
            this.checkReadItLaterGrant(function(result) {
                if (result) {
                    this.contextMenuIds.push(
                        chrome.contextMenus.create({
                            type: "normal",
                            title: chrome.i18n.getMessage("ctxmenuReadItLater"),
                            contexts: ["page"],
                            onclick: function(info, tab) {
                                this.registerToReadItLater(tab.url, {
                                    onSuccess: function(req) {
                                        if (this.isShowNotificationAfterRegisterReadItLater()) {
                                            this.showNotification(
                                                chrome.i18n.getMessage("notifyRegisteredReadItLater")
                                            );
                                        }
                                    }.bind(this),
                                    onFailure: function(req) {
                                        this.showFailedMessage(req, "notifyRegisterReadItLaterFailed");
                                    }.bind(this),
                                    onComplete: function(req) {
                                    }
                                });
                            }.bind(this)
                        })
                    );
                }
            }.bind(this));
        }
    },
    createContextMenu: function(title) {
        return {
            type: "normal",
            title: title,
            contexts: ["page"],
            onclick: function(info, tab) {
                this.shortenLongUrl(tab.url, {
                    onSuccess: function(req) {
                        this.showSucceedMessage(req);
                        if (this.isTweetAtShortenByContextMenu()) {
                            this.showTweetWindow(req.responseJSON.id);
                        }
                    }.bind(this),
                    onFailure: function(req) {
                        this.showFailedMessage(req, "notifyShortenFailed");
                    }.bind(this),
                    onComplete: function(req) {
                    }
                });
            }.bind(this)
        };
    },
    showTweetWindow: function(shortUrl) {
        if (this.isTwitterSetTitle()) {
            chrome.tabs.getSelected(null, function(tab) {
                window.open(
                    "https://twitter.com/share?url="
                        + encodeURIComponent("http://goo.gl/QzrtB")
                        + "&text="
                        + encodeURIComponent(tab.title),
                    "_blank",
                    "width=550,height=450");
            }.bind(this));
        } else {
            window.open(
                "https://twitter.com/share?url="
                    + encodeURIComponent("http://goo.gl/QzrtB"),
                "_blank",
                "width=550,height=450");
        }
    },
    showSucceedMessage: function(req) {
        var shortUrl = req.responseJSON.id;
        $("buffer").value = shortUrl;
        $("buffer").focus();
        $("buffer").select();
        document.execCommand("copy");
        var startWatching = this.isStartWatching();
        if (this.isShowNotificationAfterCopy()) {
            var msg = chrome.i18n.getMessage("notifyCopied", shortUrl);
            if (startWatching) {
                msg += chrome.i18n.getMessage("notifyStartWatching");
            }
            this.showNotification(msg);
        }
        if (startWatching) {
            this.startWatchCount(shortUrl);
        }
    },
    showFailedMessage: function(req, messageId) {
        this.showNotification(
            chrome.i18n.getMessage(messageId,
                                   req.status + " " + req.statusText)
        );
    },
    showOAuthCompletedNofitication: function() {
        if (this.isShowNotificationAfterLogin()) {
            this.showNotification(
                chrome.i18n.getMessage("notifyCompleteLogin")
            );
        }
    },
    showNotification: function(message) {
        var notification = webkitNotifications.createNotification(
            "./url_shortener_extension_48.png",
            "URL Shortener extension",
            message
        );
        notification.show();
        notification.ondisplay = function() {
            setTimeout(function() {
                notification.cancel();
            }, 5000);
        };
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
                    this.authorized = true;
                    callbacks.onSuccess(req);
                }.bind(this),
                onFailure: function(req) {
                    this.authorized = false;
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
        if (this.wasAuthorized()) {
            var accessToken = this.getAccessToken();
            params["requestHeaders"] = [
                "Authorization", "OAuth " + accessToken
            ];
        } else {
            url += "?key=" + this.shortenerApiKey;
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
        this.loadUrlInformation(shortUrl, {
            onSuccess: function(req) {
                this.setBadge(shortUrl,
                              req.responseJSON.analytics.allTime.shortUrlClicks);
            }.bind(this),
            onFailure: function(req) {
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
    loadUrlInformation: function(shortUrl, callbacks) {
        var url = "https://www.googleapis.com/urlshortener/v1/url";
        var params = {
            method: "get",
            onSuccess: callbacks.onSuccess,
            onFailure: callbacks.onFailure,
            onComplete: callbacks.onComplete
        };
        if (this.wasAuthorized()) {
            var accessToken = this.getAccessToken();
            params["requestHeaders"] = [
                "Authorization", "OAuth " + accessToken
            ];
            params["parameters"] = {
                shortUrl: shortUrl,
                projection: "FULL"
            };
        } else {
            params["parameters"] = {
                shortUrl: shortUrl,
                projection: "FULL",
                key: this.shortenerApiKey
            };
        }
        new Ajax.Request(url, params);
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
    wasAuthorized: function() {
        return this.authorized;
    },
    getReadItLaterApiKey: function() {
        return this.readItLaterApiKey;
    },
    isShowNotificationAfterLogin: function() {
        return !Boolean(localStorage["not_show_notification_after_login"]);
    },
    isShowNotificationAfterCopy: function() {
        return !Boolean(localStorage["not_show_notification_after_copy"]);
    },
    isShowNotificationAfterRegisterReadItLater: function() {
        return !Boolean(localStorage["not_show_notification_after_register_read_it_later"]);
    },
    isShowContextMenus: function() {
        return !Boolean(localStorage["not_show_context_menus"]);
    },
    isStartWatching: function() {
        return !Boolean(localStorage["not_start_watching"]);
    },
    isShortenDirectlyAtNotLogin: function() {
        return Boolean(localStorage["shorten_directly_at_not_login"]);
    },
    isShortenDirectlyAtLogin: function() {
        return Boolean(localStorage["shorten_directly_at_login"]);
    },
    isTweetAtShortenByContextMenu: function() {
        return Boolean(localStorage["tweet_at_shorten_by_context_menu"]);
    },
    isTwitterSetTitle: function() {
        return Boolean(localStorage["twitter_set_title"]);
    },
    isTweetAtShortenByPopup: function() {
        return Boolean(localStorage["tweet_at_shorten_by_popup"]);
    },
    getReadItLaterUsername: function() {
        return localStorage["read_it_later_username"];
    },
    getReadItLaterPassword: function() {
        return localStorage["read_it_later_password"];
    },
    getBackgroundImageUrl: function() {
        var url = localStorage["background_image_url"];
        if (url) {
            return url;
        } else {
            return "";
        }
    },
    checkReadItLaterGrant: function(callback) {
        chrome.permissions.contains({
            origins: [
                "https://readitlaterlist.com/"
            ]
        }, function(result) {
            callback(result);
        });
    },
    registerToReadItLater: function(longUrl, callbacks) {
        var url = "https://readitlaterlist.com/v2/add";
        new Ajax.Request(url, {
            method: "post",
            parameters: {
                username: this.getReadItLaterUsername(),
                password: this.getReadItLaterPassword(),
                apikey: this.getReadItLaterApiKey(),
                url: longUrl
            },
            onSuccess: callbacks.onSuccess,
            onFailure: callbacks.onFailure,
            onComplete: callbacks.onComplete
        });
    }
};

var gl = new Gl();
