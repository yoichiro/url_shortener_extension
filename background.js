var Gl = function() {
    this.initialize();
};

Gl.prototype = {
    SHORTENER_API_KEY: "AIzaSyAJ6oQbZn48_6pXfsxTazU9IOf_oan-QgY",
    READ_IT_LATER_API_KEY: "c77dFl55T3c8eq4bOuAi94cn90g8Id84",
    WATCH_TIMER_NAME: "watch_timer_name",
    OAUTH_TIMER_NAME: "oauth_timer_name",
    EXPIRE_TOKEN_TIME: "expire_token_time",
    AUTHORIZED_KEY: "authorized",
    initialize: function() {
        this.setupContextMenus(false);
        this.setupEventHandler();
    },
    setupEventHandler: function() {
        chrome.tabs.onSelectionChanged.addListener(function(id, info) {
            this.onSelectionChanged(id);
        }.bind(this));
        chrome.tabs.onUpdated.addListener(function(id, changeInfo, tab) {
            this.onSelectionChanged(id);
        }.bind(this));
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            this.onChangedStorage(changes, namespace);
        }.bind(this));
        chrome.alarms.onAlarm.addListener(function(alarm) {
            this.onAlarmReceived(alarm);
        }.bind(this));
        chrome.contextMenus.onClicked.addListener(function(info, tab) {
            this.onClickContextMenu(info, tab);
        }.bind(this));
    },
    onAlarmReceived: function(alarm) {
        if (alarm.name == this.WATCH_TIMER_NAME) {
            var shortUrl = localStorage[this.WATCH_TIMER_NAME];
            this.startWatchCount(shortUrl);
        } else if (alarm.name == this.OAUTH_TIMER_NAME) {
            this.onOAuthTimer();
        }
    },
    onAuthorized: function() {
        this.setAuthorized(true);
        this.setupContextMenus();
        this.startOAuthTimer();
        this.showOAuthCompletedNofitication();
    },
    startOAuthTimer: function() {
        chrome.alarms.clear(this.OAUTH_TIMER_NAME);
        var expiresIn = Number(localStorage["expires_in"]);
        localStorage[this.EXPIRE_TOKEN_TIME] =
            String((new Date()).getTime() + expiresIn * 1000);
        this.onOAuthTimer();
    },
    onOAuthTimer: function() {
        var remaining =
            Number(localStorage[this.EXPIRE_TOKEN_TIME]) - (new Date()).getTime();
        if (remaining > 0) {
            chrome.alarms.create(this.OAUTH_TIMER_NAME, {
                delayInMinutes: 5
            });
        } else {
            this.setAuthorized(false);
            this.clearToken();
            this.setupContextMenus();
        }
    },
    clearToken: function() {
        delete localStorage["access_token"];
        delete localStorage["expires_in"];
        delete localStorage[this.EXPIRE_TOKEN_TIME];
    },
    setupContextMenus: function() {
        chrome.contextMenus.removeAll(function() {
            if (this.isShowContextMenus()) {
                if (this.wasAuthorized()) {
                    chrome.contextMenus.create(
                        this.createContextMenu("ctxmenuShortenUrlAdded"));
                } else {
                    chrome.contextMenus.create({
                        id: "ctxmenuLogin",
                        type: "normal",
                        title: chrome.i18n.getMessage("ctxmenuLogin"),
                        contexts: ["page", "link"]
                    });
                    chrome.contextMenus.create(
                        this.createContextMenu("ctxmenuShortenUrlNotAdded"));
                }
                this.checkReadItLaterGrant(function(result) {
                    if (result) {
                        chrome.contextMenus.create({
                            id: "ctxmenuReadItLater",
                            type: "normal",
                            title: chrome.i18n.getMessage("ctxmenuReadItLater"),
                            contexts: ["page", "link"]
                        });
                    }
                });
            }
        }.bind(this));
    },
    createContextMenu: function(id) {
        return {
            id: id,
            type: "normal",
            title: chrome.i18n.getMessage(id),
            contexts: ["page", "link"]
        };
    },
    onClickContextMenu: function(info, tab) {
        var id = info.menuItemId;
        if (id == "ctxmenuShortenUrlAdded" || id == "ctxmenuShortenUrlNotAdded") {
            var targetUrl;
            if (this.isAdoptLinkUrlContextMenu() && info.linkUrl) {
                targetUrl = info.linkUrl;
            } else {
                targetUrl = info.pageUrl;
            }
            var longUrl = this.preProcessLongUrl(targetUrl);
            this.shortenLongUrl(longUrl, tab.title, {
                onSuccess: function(req) {
                    this.showSucceedMessage(req.responseJSON.id);
                    if (this.isTweetAtShortenByContextMenu()) {
                        this.showTweetWindow(req.responseJSON.id);
                    } else if (this.isFacebookAtShortenByContextMenu()) {
                        this.showFacebookWindow(req.responseJSON.id);
                    }
                }.bind(this),
                onFailure: function(req) {
                    this.showFailedMessage(req, "notifyShortenFailed");
                }.bind(this),
                onComplete: function(req) {
                }
            });
        } else if (id == "ctxmenuLogin") {
            utils.getOAuthWindow().createOpenerOnClick()();
        } else if (id == "ctxmenuReadItLater") {
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
        }
    },
    showTweetWindow: function(shortUrl) {
        var x = (screen.width - 550) / 2;
        var y = (screen.height - 450) / 2;
        var options = "width=550,height=450,left=" + x + ",top=" + y;
        if (this.isTwitterSetTitle()) {
            chrome.tabs.getSelected(null, function(tab) {
                window.open(
                    "https://twitter.com/share?url="
                        + encodeURIComponent(shortUrl)
                        + "&text="
                        + encodeURIComponent(tab.title),
                    "_blank",
                    options);
            }.bind(this));
        } else {
            window.open(
                "https://twitter.com/share?url="
                    + encodeURIComponent(shortUrl),
                "_blank",
                options);
        }
    },
    showFacebookWindow: function(shortUrl) {
        var x = (screen.width - 680) / 2;
        var y = (screen.height - 360) / 2;
        var options = "width=680,height=360,left=" + x + ",top=" + y;
        var link = "http://www.facebook.com/sharer/sharer.php?u="
            + encodeURIComponent(shortUrl);
        window.open(
            link,
            "_blank",
            options);
    },
    showSucceedMessage: function(shortUrl) {
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
                    this.setAuthorized(true);
                    this.appendTitleToUserHistory(req);
                    this.hilightFavoriteUrls(req);
                    callbacks.onSuccess(req);
                }.bind(this),
                onFailure: function(req) {
                    this.setAuthorized(false);
                    callbacks.onFailure(req);
                }.bind(this),
                onComplete: callbacks.onComplete
            });
            return true;
        } else {
            return false;
        }
    },
    hilightFavoriteUrls: function(req) {
        var items = req.responseJSON.items;
        var favoriteItems = new Array();
        var favoriteUrls = this.getFavoriteUrls();
        items.each(function(item) {
            if (favoriteUrls.include(item.id)) {
                favoriteItems.push(item);
                item["favorite"] = true;
            } else {
                item["favorite"] = false;
            }
        });
        favoriteItems.each(function(item) {
            items = items.without(item);
            items.unshift(item);
        });
        req.responseJSON.items = items;
    },
    shortenLongUrl: function(longUrl, title, callbacks) {
        var url = "https://www.googleapis.com/urlshortener/v1/url";
        var params = {
            method: "post",
            contentType: "application/json",
            postBody: Object.toJSON({
                longUrl: longUrl
            }),
            onSuccess: function(req) {
                if (title) {
                    this.storeTitleHistory(longUrl, title);
                }
                callbacks.onSuccess(req);
            }.bind(this),
            onFailure: callbacks.onFailure,
            onComplete: callbacks.onComplete
        };
        if (this.wasAuthorized()) {
            var accessToken = this.getAccessToken();
            params["requestHeaders"] = [
                "Authorization", "OAuth " + accessToken
            ];
        } else {
            url += "?key=" + this.SHORTENER_API_KEY;
        }
        new Ajax.Request(url, params);
    },
    appendTitleToUserHistory: function(req) {
        var titleHistory = this.getTitleHistory();
        var newTitleHistory = {};
        var items = req.responseJSON.items;
        items.each(function(item) {
            var longUrl = item.longUrl;
            var title = titleHistory[longUrl];
            if (title) {
                item["title"] = title;
                newTitleHistory[longUrl] = title;
            } else {
                item["title"] = longUrl;
            }
        });
        localStorage["title_history"] = Object.toJSON(newTitleHistory);
        chrome.storage.sync.clear(function() {
            chrome.storage.sync.set(newTitleHistory);
        }.bind(this));
    },
    storeTitleHistory: function(longUrl, title) {
        var titleHistory = this.getTitleHistory();
        titleHistory[longUrl] = title;
        localStorage["title_history"] = Object.toJSON(titleHistory);
        var data = {};
        data[longUrl] = title;
        chrome.storage.sync.set(data);
    },
    getTitleHistory: function() {
        var titleHistory = localStorage["title_history"];
        if (titleHistory) {
            titleHistory = titleHistory.evalJSON();
        } else {
            titleHistory = {};
        }
        return titleHistory;
    },
    onSelectionChanged: function(tabId) {
        chrome.tabs.get(tabId, function(tab) {
            var history = this.getTitleHistory();
            if (tab.url && history[tab.url] && tab.title) {
                this.storeTitleHistory(tab.url, tab.title);
            }
        }.bind(this));
    },
    startWatchCount: function(shortUrl) {
        if (!shortUrl) {
            chrome.alarms.clear(this.WATCH_TIMER_NAME);
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
                localStorage[this.WATCH_TIMER_NAME] = shortUrl;
                chrome.alarms.create(this.WATCH_TIMER_NAME, {
                    delayInMinutes: 5
                });
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
                key: this.SHORTENER_API_KEY
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
    preProcessLongUrl: function(longUrl) {
        if (this.isAmazonShortUrl()) {
            var amazon =
                longUrl.match(/^http:\/\/www.amazon.([a-z.]+)\//);
            if (amazon) {
                var isbn = longUrl.match(/\/([A-Z0-9]+)\//);
                if (isbn) {
                    return "http://www.amazon." + amazon[1] + "/dp/" + isbn[1] + "/";
                }
            }
        }
        return longUrl;
    },
    wasAuthorized: function() {
        return localStorage[this.AUTHORIZED_KEY] == "true";
    },
    setAuthorized: function(authorized) {
        localStorage[this.AUTHORIZED_KEY] = authorized ? "true" : "false";
    },
    getReadItLaterApiKey: function() {
        return this.READ_IT_LATER_API_KEY;
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
    isFacebookAtShortenByContextMenu: function() {
        return Boolean(localStorage["facebook_at_shorten_by_context_menu"]);
    },
    isTwitterSetTitle: function() {
        return Boolean(localStorage["twitter_set_title"]);
    },
    isTweetAtShortenByPopup: function() {
        return Boolean(localStorage["tweet_at_shorten_by_popup"]);
    },
    isFacebookAtShortenByPopup: function() {
        return Boolean(localStorage["facebook_at_shorten_by_popup"]);
    },
    isStartWatchingAtCheckHighPriority: function() {
        return !Boolean(localStorage["not_start_watching_at_check_high_priority"]);
    },
    isAdoptLinkUrlContextMenu: function() {
        return Boolean(localStorage["adopt_link_url_context_menu"]);
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
    },
    isAmazonShortUrl: function() {
        return Boolean(localStorage["amazon_short_url"]);
    },
    getFavoriteUrls: function() {
        var favoriteUrls = localStorage["favorite_urls"] || "[]";
        favoriteUrls = favoriteUrls.evalJSON();
        return favoriteUrls;
    },
    setFavoriteUrl: function(url, checked) {
        var favoriteUrls = this.getFavoriteUrls();
        if (checked) {
            if (!favoriteUrls.include(url)) {
                favoriteUrls.push(url);
            }
        } else {
            if (favoriteUrls.include(url)) {
                favoriteUrls = favoriteUrls.without(url);
            }
        }
        localStorage["favorite_urls"] = Object.toJSON(favoriteUrls);
    },
    onChangedStorage: function(changes, namespace) {
        for (key in changes) {
            if (key == "title_history") {
                var storageChange = changes[key];
                localStorage["title_history"]
                    = Object.toJSON(storageChange.newValue);
            }
        }
    },
    loadTitleHistory: function(callback) {
        chrome.storage.sync.remove("title_history", function() {
            chrome.storage.sync.get(null, function(items) {
                localStorage["title_history"] = Object.toJSON(items);
                callback.call();
            }.bind(this));
        }.bind(this));
    }
};

var gl = new Gl();
