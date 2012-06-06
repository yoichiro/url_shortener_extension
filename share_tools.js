var ShareTools = function(p) {
    this.initialize(p);
};

ShareTools.prototype = {
    popup: null,
    bg: null,
    readItLaterProgress: null,
    initialize: function(p) {
        this.popup = p;
        this.bg = chrome.extension.getBackgroundPage();
        this.readItLaterProgress = false;
    },
    start: function() {
        this.assignEventHandlers();
        this.checkReadItLaterPermission();
    },
    assignEventHandlers: function() {
        $("read_it_later").onclick = this.onClickReadItLater.bind(this);
    },
    clearAll: function() {
        this.setTwitter("");
        this.setFacebook("");
        this.setGMail("");
        this.setQRCode("");
        this.setUrlDetail("");
    },
    showTools: function(shortUrl) {
        this.setTwitter(shortUrl);
        this.setFacebook(shortUrl);
        this.setGMail(shortUrl);
        this.setQRCode(shortUrl);
        this.setUrlDetail(shortUrl);
    },
    setTwitter: function(url) {
        $("twitter").innerHTML = "";
        if (url) {
            var a = document.createElement("a");
            a.setAttribute("href", "https://twitter.com/share");
            a.setAttribute("class", "twitter-share-button");
            a.setAttribute("data-count", "none");
            a.setAttribute("data-url", url);
            if (this.bg.gl.isTwitterSetTitle()) {
                a.setAttribute("data-text", this.popup.getCurrentTabTitle());
            }
            a.innerHTML = "Tweet";
            var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", "http://platform.twitter.com/widgets.js");
            a.appendChild(script);
            $("twitter").appendChild(a);
            utils.setVisible($("twitter"), true);
        } else {
            utils.setVisible($("twitter"), false);
        }
    },
    setFacebook: function(url) {
        var self = this;
        $("facebook").innerHTML = "";
        if (url) {
            var img = document.createElement("img");
            img.src = "./facebook_16.png";
            img.onclick = function(url) {
                return function(evt) {
                    this.bg.gl.showFacebookWindow(url);
                }.bind(self);
            }.bind(this)(url);
            $("facebook").appendChild(img);
            utils.setVisible($("facebook"), true);
        } else {
            utils.setVisible($("facebook"), false);
        }
    },
    setGMail: function(url) {
        $("mail").innerHTML = "";
        if (url) {
            var link = "https://mail.google.com/mail/?ui=2&view=cm&fs=1&tf=1&"
                + "body="
                + encodeURIComponent(url);
            var a = document.createElement("a");
            a.setAttribute("href", link);
            a.setAttribute("target", "_blank");
            var img = document.createElement("img");
            img.src = "./mail.png";
            a.appendChild(img);
            $("mail").appendChild(a);
            utils.setVisible($("mail"), true);
        } else {
            utils.setVisible($("mail"), false);
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
            utils.setVisible($("url_detail"), true);
        } else {
            utils.setVisible($("url_detail"), false);
        }
    },
    setQRCode: function(url) {
        $("qrcode").innerHTML = "";
        if (url) {
            var img = document.createElement("img");
            img.src = "./qrcode.png";
            $("qrcode").appendChild(img);
            img.onmouseover = function(url) {
                return function(e) {
                    this.showQRCode(url);
                }.bind(this);
            }.bind(this)(url);
            img.onmouseout = this.hideQRCode.bind(this);
            utils.setVisible($("qrcode"), true);
        } else {
            utils.setVisible($("qrcode"), false);
        }
    },
    showQRCode: function(url) {
        $("qrcode_pane").innerHTML = "";
        var img = document.createElement("img");
        img.src = url + ".qr";
        $("qrcode_pane").appendChild(img);
        utils.setVisible($("qrcode_pane"), true);
    },
    hideQRCode: function(url) {
        utils.setVisible($("qrcode_pane"), false);
    },
    checkReadItLaterPermission: function() {
        this.bg.gl.checkReadItLaterGrant(function(result) {
            utils.setVisible($("read_it_later"), result);
        }.bind(this));
    },
    onClickReadItLater: function() {
        if (this.readItLaterProgress) {
            return;
        }
        this.readItLaterProgress = true;
        this.showReadItLaterProgress(true);
        var longUrl = $("input_long_url").value;
        this.bg.gl.registerToReadItLater(longUrl, {
            onSuccess: function(req) {
                this.popup.setMessage(
                    chrome.i18n.getMessage(
                        "popupRegisteredReadItLater"),
                    false);
            }.bind(this),
            onFailure: function(req) {
                this.popup.setMessage(
                    req.status + "(" + req.statusText + ")", true);
            }.bind(this),
            onComplete: function() {
                this.showReadItLaterProgress(false);
                this.readItLaterProgress = false;
            }.bind(this)
        });
    },
    showReadItLaterProgress: function(progress) {
        if (progress) {
            $("read_it_later_icon").src = "./progress.gif";
        } else {
            $("read_it_later_icon").src = "./readitlater.png";
        }
    }
};
