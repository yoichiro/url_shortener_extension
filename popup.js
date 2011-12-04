var Popup = function() {
    this.initialize();
};

Popup.prototype = {
    bg: null,
    history: null,
    detailTimer: null,
    initialize: function() {
        this.bg = chrome.extension.getBackgroundPage();
        this.detailTimer = new Array();
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
        var table = $("history_table_table");
        table.innerHTML = "";
        var items = this.history;
        var count = Math.min(startIndex + 10, items.length);
        for (var i = startIndex; i < count; i++) {
            var item = items[i];
            var tr = document.createElement("tr");

            var longUrlTd = document.createElement("td");
            var longUrlDiv = document.createElement("div");
            longUrlDiv.addClassName("long_url");
            var longUrlA = document.createElement("a");
            longUrlA.setAttribute("href", item.longUrl);
            longUrlA.setAttribute("target", "_blank");
            var longUrlText = document.createTextNode(item.longUrl);
            longUrlA.appendChild(longUrlText);
            longUrlDiv.appendChild(longUrlA);
            longUrlTd.appendChild(longUrlDiv);
            tr.appendChild(longUrlTd);

            var shortUrlTd = document.createElement("td");
            var shortUrlDiv = document.createElement("div");
            shortUrlDiv.addClassName("short_url");
            var shortUrlA = document.createElement("a");
            shortUrlA.setAttribute("href", item.id);
            shortUrlA.setAttribute(
                "title",
                chrome.i18n.getMessage("popupStartWatching")
            );
            shortUrlA.onclick = function(url) {
                return function() {
                    this.onClickShortUrlLink(url);
                }.bind(this);
            }.bind(this)(item.id);
            shortUrlA.onmouseover = function(item) {
                return function() {
                    this.startDetailTimer(item);
                }.bind(this);
            }.bind(this)(item);
            shortUrlA.onmouseout = this.stopDetailTimer.bind(this);
            var shortUrlText = document.createTextNode(item.id.substring(7));
            shortUrlA.appendChild(shortUrlText);
            shortUrlDiv.appendChild(shortUrlA);
            shortUrlTd.appendChild(shortUrlDiv);
            tr.appendChild(shortUrlTd);

            var countTd = document.createElement("td");
            var countDiv = document.createElement("div");
            countDiv.addClassName("click_count");
            var countText = document.createTextNode(
                item.analytics.allTime.shortUrlClicks);
            countDiv.appendChild(countText);
            countTd.appendChild(countDiv);
            tr.appendChild(countTd);

            table.appendChild(tr);
        }
    },
    startDetailTimer: function(item) {
        var timer = setTimeout(function(item) {
            return function() {
                this.showDetailPane(item);
            }.bind(this);
        }.bind(this)(item), 1000);
        this.detailTimer.push(timer);
    },
    stopDetailTimer: function() {
        this.detailTimer.each(function(timer) {
            clearTimeout(timer);
        });
        this.detailTimer = new Array();
        this.setVisible($("detail_pane"), false);
    },
    showDetailPane: function(item) {
        this.setVisible($("detail_pane"), true);
        Element.setStyle($("detail_pane"), {
            height: "220px"
        });
        this.setVisible($("detail_pane_progress"), true);
        this.setVisible($("detail_url_info"), false);
        this.bg.gl.loadUrlInformation(item.id, {
            onSuccess: function(req) {
                var item = req.responseJSON;
                this.setDetailInformation(item);
            }.bind(this),
            onFailure: function(req) {
                this.stopDetailTimer();
            }.bind(this),
            onException: function(req) {
                this.stopDetailTimer();
            }.bind(this),
            onComplete: function(req) {
                this.setVisible($("detail_pane_progress"), false);
                this.setVisible($("detail_url_info"), true);
                Element.setStyle($("detail_pane"), {
                    height: "auto"
                });
            }.bind(this)
        });
    },
    setDetailInformation: function(item) {
        var created = new Date(item.created);
        $("detail_date_str").innerHTML = created.toLocaleString();
        var table = $("detail_section_table");
        table.innerHTML = "";
        var allTime = item.analytics.allTime;
        this.setDetailInformationRow("browsers", allTime, table);
        this.setDetailInformationRow("countries", allTime, table);
        this.setDetailInformationRow("platforms", allTime, table);
        this.setDetailInformationRow("referrers", allTime, table);
    },
    setDetailInformationRow: function(name, allTime, table) {
        var items = allTime[name];
        if (items) {
            for (var i = 0; i < Math.min(items.length, 3); i++) {
                var tr = document.createElement("tr");
                var item = items[i];
                var td1 = document.createElement("td");
                if (i == 0) {
                    td1.appendChild(document.createTextNode(name));
                } else {
                    td1.appendChild(document.createElement("br"));
                }
                tr.appendChild(td1);
                var td2 = document.createElement("td");
                td2.appendChild(document.createTextNode(item.id));
                tr.appendChild(td2);
                var td3 = document.createElement("td");
                td3.addClassName("click_count");
                td3.appendChild(document.createTextNode(item.count));
                tr.appendChild(td3);
                table.appendChild(tr);
            }
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
            msg += chrome.i18n.getMessage("popupStartedWatching");
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
