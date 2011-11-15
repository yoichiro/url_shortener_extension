var Popup = function() {
    this.initialize();
};

Popup.prototype = {
    bg: null,
    oauthWindow: null,
    initialize: function() {
        this.bg = chrome.extension.getBackgroundPage();
        this.setupOAuthWindow();
    },
    start: function() {
        this.assignEventHandlers();
        this.loadHistory();
        this.setCurrentLongUrl();
    },
    assignEventHandlers: function() {
        $("login_link").onclick = this.oauthWindow.createOpenerOnClick();
        $("input_long_url").onclick = this.selectInputLongUrl.bind(this);
        $("shorten").onclick = this.onClickShorten.bind(this);
        $("input_short_url").onclick = this.onClickShortUrl.bind(this);
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
                var notification = webkitNotifications.createNotification(
                    "./url_shortener_extension_48.png",
                    "URL Shortener extension",
                    "Authentication completed. Please push the extension button again."
                );
                notification.show();
            }.bind(this)
        });
    },
    isInvalidCredential: function(req) {
        if (req.status == 401) {
            this.setDisplayMode(true);
            return true;
        }
        return false;
    },
    setDisplayMode: function(needLogin) {
        this.setVisible($("login_pane"), needLogin);
        this.setVisible($("history_pane"), !needLogin);
        this.setVisible($("shortener_pane"), !needLogin);
    },
    loadHistory: function() {
        this.setLoadHistoryProgressVisible(true);
        var result = this.bg.gl.lookupUserHistory({
            onSuccess: function(req) {
                this.showHistory(req.responseJSON);
            }.bind(this),
            onFailure: function(req) {
                this.isInvalidCredential(req);
            }.bind(this),
            onComplete: function(req) {
                this.setLoadHistoryProgressVisible(false);
            }.bind(this)
        });
        if (!result) {
            this.setDisplayMode(true);
        }
    },
    setLoadHistoryProgressVisible: function(visible) {
        this.setVisible($("history_table_progress"), visible);
        this.setVisible($("history_table"), !visible);
    },
    showHistory: function(response) {
        var tmpl = "<tr><td><div class='long_url'><a href='${longUrl}' target='_blank'>${longUrl}</a></div></td><td><div class='short_url'><a href='${shortUrl1}' target='_blank'>${shortUrl2}</a></div></td><td><div class='click_count'>${clickCount}</div></td></tr>";
        var table = $("history_table_table");
        table.innerHTML = "";
        var items = response.items;
        var count = Math.min(10, items.length);
        for (var i = 0; i < count; i++) {
            var item = items[i];
            table.innerHTML += tmpl.replace(/\$\{longUrl\}/g, item.longUrl)
                .replace("${shortUrl1}", item.id)
                .replace("${shortUrl2}", item.id.substring(7))
                .replace("${clickCount}", item.analytics.week.shortUrlClicks);
        }
    },
    setCurrentLongUrl: function() {
        chrome.tabs.getSelected(null, function(tab) {
            $("input_long_url").value = tab.url;
        }.bind(this));
    },
    selectInputLongUrl: function() {
        $("input_long_url").focus();
        $("input_long_url").select();
    },
    onClickShorten: function() {
        var url = $("input_long_url").value;
        if (url) {
            this.setVisibleForm($("shorten"), false);
            this.setVisibleForm($("shorten_progress"), true);
            $("input_short_url").value = "";
            this.setMessage("", false);
            this.setTwitter("");
            var result = this.bg.gl.shortenLongUrl(url, {
                onSuccess: function(req) {
                    this.setShortUrl(req.responseJSON);
                }.bind(this),
                onFailure: function(req) {
                    $("input_short_url").value = "http://goo.gl/...";
                    if (!this.isInvalidCredential(req)) {
                        this.setMessage(req.status + "(" + req.statusText + ") "
                                        + req.responseJSON.error.message,
                                        true);
                    }
                }.bind(this),
                onComplete: function(req) {
                    this.setVisibleForm($("shorten"), true);
                    this.setVisibleForm($("shorten_progress"), false);
                }.bind(this)
            });
            if (!result) {
                this.setDisplayMode(true);
            }
        }
    },
    setShortUrl: function(response) {
        $("input_short_url").value = response.id;
        this.setMessage("Copied shorten URL to clipboard", false);
        this.setTwitter(response.id);
        this.onClickShortUrl();
        document.execCommand("copy");
        this.loadHistory();
    },
    setVisible: function(elem, visible) {
        Element.setStyle(elem, {
            display: visible ? "block" : "none"
        });
    },
    setVisibleForm: function(elem, visible) {
        Element.setStyle(elem, {
            display: visible ? "inline-block" : "none"
        });
    },
    setMessage: function(message, error) {
        Element.setStyle($("message"), {
            color: error ? "red" : "green"
        });
        $("message").innerHTML = message;
        setTimeout(function() {
            this.setMessage("", false);
        }.bind(this), 5000);
    },
    setTwitter: function(url) {
        if (url) {
            var a = document.createElement("a");
            a.setAttribute("href", "https://twitter.com/share");
            a.setAttribute("class", "twitter-share-button");
            a.setAttribute("data-count", "none");
            a.setAttribute("data-url", url);
            a.innerHTML = "Tweet";
            var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", "http://platform.twitter.com/widgets.js");
            a.appendChild(script);
            $("twitter").appendChild(a);
            this.setVisible($("twitter"), true);
        } else {
            $("twitter").innerHTML = "";
            this.setVisible($("twitter"), false);
        }
    },
    onClickShortUrl: function() {
        $("input_short_url").focus();
        $("input_short_url").select();
    }
};

var popup = new Popup();
