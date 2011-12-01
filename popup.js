var Popup = function() {
    this.initialize();
};

Popup.prototype = {
    bg: null,
    history: null,
    initialize: function() {
        this.bg = chrome.extension.getBackgroundPage();
    },
    start: function() {
        this.assignMessages();
        this.assignEventHandlers();
        this.loadHistory();
        this.setCurrentLongUrl();
        this.showRecommend();
    },
    assignMessages: function() {
        $("popupShorten").innerHTML = chrome.i18n.getMessage("popupShorten");
        $("popupHistory").innerHTML = chrome.i18n.getMessage("popupHistory");
        $("popupLogin").innerHTML = chrome.i18n.getMessage("popupLogin");
        $("popupLoginDesc").innerHTML = chrome.i18n.getMessage("popupLoginDesc");
        $("popupRecommend").innerHTML = chrome.i18n.getMessage("popupRecommend");
        $("popupStopWatching").innerHTML = chrome.i18n.getMessage("popupStopWatching");
    },
    assignEventHandlers: function() {
        $("login_link").onclick = this.bg.gl.getOAuthWindow().createOpenerOnClick();
        $("input_long_url").onclick = this.selectInputLongUrl.bind(this);
        $("shorten").onclick = this.onClickShorten.bind(this);
        $("input_short_url").onclick = this.onClickShortUrl.bind(this);
        $("clear_timer").onclick = this.onClickClearTimer.bind(this);
        $("recommend").onclick = this.onClickRecommend.bind(this);
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
        this.setVisible($("history_table"), !needLogin);
    },
    loadHistory: function() {
        this.setLoadHistoryProgressVisible(true);
        var result = this.bg.gl.lookupUserHistory({
            onSuccess: function(req) {
                this.history = req.responseJSON.items;
                this.setPaginator();
                this.showHistory(0);
            }.bind(this),
            onFailure: function(req) {
                this.isInvalidCredential(req);
            }.bind(this),
            onComplete: function(req) {
                this.setLoadHistoryProgressVisible(false);
            }.bind(this)
        });
        if (!result) {
            this.setLoadHistoryProgressVisible(false);
            this.setDisplayMode(true);
        }
    },
    setLoadHistoryProgressVisible: function(visible) {
        this.setVisible($("history_table_progress"), visible);
        this.setVisible($("history_table"), !visible);
    },
    onClickShortUrlLink: function(url) {
        this.setShortUrl(url, true);
    },
    showHistory: function(startIndex) {
        var tmpl = "<tr><td><div class='long_url'><a href='${longUrl}' target='_blank'>${longUrl}</a></div></td><td><div class='short_url'><a href='${shortUrl1}' onclick='popup.onClickShortUrlLink(\"${shortUrl1}\")' title='Start watching'>${shortUrl2}</a></div></td><td><div class='click_count'>${clickCount}</div></td></tr>";
        var table = $("history_table_table");
        table.innerHTML = "";
        var items = this.history;
        var count = Math.min(startIndex + 10, items.length);
        for (var i = startIndex; i < count; i++) {
            var item = items[i];
            table.innerHTML += tmpl.replace(/\$\{longUrl\}/g, item.longUrl)
                .replace(/\$\{shortUrl1\}/g, item.id)
                .replace("${shortUrl2}", item.id.substring(7))
                .replace("${clickCount}", item.analytics.allTime.shortUrlClicks);
        }
    },
    setPaginator: function() {
        $("paginator").innerHTML = "";
        var len = this.history.length;
        var cnt = 1;
        for (var i = 0; i < len; i += 10) {
            if (cnt == 1) {
                $("paginator").innerHTML = chrome.i18n.getMessage("popupPage");;
            }
            var link = document.createElement("a");
            link.href = "#";
            link.onclick = (function(n) {
                return function() {
                    this.showHistory(n);
                }.bind(this);
            }.bind(this))(i);
            link.innerHTML = cnt++;
            $("paginator").appendChild(link);
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
    clearShortenResult: function() {
        $("input_short_url").value = "";
        this.setMessage("", false);
        this.setTwitter("");
        this.setUrlDetail("");
    },
    onClickShorten: function() {
        var url = $("input_long_url").value;
        if (url) {
            this.setVisibleForm($("shorten"), false);
            this.setVisibleForm($("shorten_progress"), true);
            this.clearShortenResult();
            this.bg.gl.shortenLongUrl(url, {
                onSuccess: function(req) {
                    this.setShortUrl(req.responseJSON.id, false);
                    if (this.bg.gl.wasAuthorized()) {
                        this.loadHistory();
                    }
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
        }
    },
    setShortUrl: function(shortUrl, forceWatching) {
        $("input_short_url").value = shortUrl;
        var startWatching = this.bg.gl.isStartWatching();
        var msg = chrome.i18n.getMessage("popupCompleteShorten");
        if (forceWatching || startWatching) {
            msg += chrome.i18n.getMessage("popupStartWatching");
        }
        this.setMessage(msg, false);
        this.setTwitter(shortUrl);
        this.setUrlDetail(shortUrl);
        this.onClickShortUrl();
        document.execCommand("copy");
        if (forceWatching || startWatching) {
            this.bg.gl.startWatchCount(shortUrl);
        }
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
        $("twitter").innerHTML = "";
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
            this.setVisible($("twitter"), false);
        }
    },
    setUrlDetail: function(url) {
        $("url_detail").innerHTML = "";
        if (url) {
            var array = url.split("/");
            $("url_detail").innerHTML =
                "<a href='http://goo.gl/info/"
                + array[array.length - 1]
                + "' target='_blank'>"
                + chrome.i18n.getMessage("popupUrlDetail")
                + "</a>";
            this.setVisible($("url_detail"), true);
        } else {
            this.setVisible($("url_detail"), false);
        }
    },
    onClickShortUrl: function() {
        $("input_short_url").focus();
        $("input_short_url").select();
    },
    onClickClearTimer: function() {
        this.bg.gl.startWatchCount(null);
    },
    onClickRecommend: function() {
        window.open(
            "https://twitter.com/share?url="
                + encodeURIComponent("http://goo.gl/QzrtB")
                + "&text="
                + encodeURIComponent(chrome.i18n.getMessage("popupRecommendText")),
            "_blank",
            "width=550,height=450");
    },
    showRecommend: function() {
        var v = Math.floor(Math.random() * 3 + 1);
        if (v != 2) {
            Element.setStyle($("recommend"), {
                display: "none"
            });
        }
    }
};

var popup = new Popup();
