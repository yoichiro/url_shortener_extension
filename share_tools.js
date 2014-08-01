var ShareTools = function(p) {
    this.initialize(p);
};

ShareTools.prototype = {
    popup: null,
    readItLaterProgress: null,
    initialize: function(p) {
        this.popup = p;
        this.readItLaterProgress = false;
    },
    start: function(bg) {
        this.assignEventHandlers();
        this.checkReadItLaterPermission(bg);
    },
    assignEventHandlers: function() {
        $("read_it_later").onclick = this.onClickReadItLater.bind(this);
    },
    clearAll: function() {
        this.setGplus("");
        this.setTwitter("");
        this.setFacebook("");
        this.setGMail("");
        this.setQRCode("");
        this.setUrlDetail("");
    },
    showTools: function(shortUrl) {
        this.setGplus(shortUrl);
        this.setTwitter(shortUrl);
        this.setFacebook(shortUrl);
        this.setGMail(shortUrl);
        this.setQRCode(shortUrl);
        this.setUrlDetail(shortUrl);
    },
    setTwitter: function(url) {
        var self = this;
        $("twitter").innerHTML = "";
        if (url) {
            var img = document.createElement("img");
            img.src = "./twitter.png";
            img.onclick = function(url) {
                return function(evt) {
                    chrome.runtime.getBackgroundPage(function(bg) {
                        bg.gl.showTweetWindow(url);
                        window.close();
                    });
                }.bind(self);
            }.bind(this)(url);
            $("twitter").appendChild(img);
            utils.setVisible($("twitter"), true);
        } else {
            utils.setVisible($("twitter"), false);
        }
    },
    setGplus: function(url) {
        var self = this;
        $("gplus").innerHTML = "";
        if (url) {
            var img = document.createElement("img");
            img.src = "./gplus.png";
            img.onclick = function(url) {
                return function(evt) {
                    chrome.runtime.getBackgroundPage(function(bg) {
                        bg.gl.showGplusWindow(url);
                        window.close();
                    });
                }.bind(self);
            }.bind(this)(url);
            $("gplus").appendChild(img);
            utils.setVisible($("gplus"), true);
        } else {
            utils.setVisible($("gplus"), false);
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
                    chrome.runtime.getBackgroundPage(function(bg) {
                        bg.gl.showFacebookWindow(url);
                        window.close();
                    });
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
    checkReadItLaterPermission: function(bg) {
        bg.gl.checkReadItLaterGrant(function(result) {
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
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.gl.registerToReadItLater(longUrl, {
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
        }.bind(this));
    },
    showReadItLaterProgress: function(progress) {
        if (progress) {
            $("read_it_later_icon").src = "./progress.gif";
        } else {
            $("read_it_later_icon").src = "./readitlater.png";
        }
    }
};
