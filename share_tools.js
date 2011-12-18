var ShareTools = function() {
    this.initialize();
};

ShareTools.prototype = {
    initialize: function() {
    },
    clearAll: function() {
        this.setTwitter("");
        this.setGMail("");
        this.setQRCode("");
        this.setUrlDetail("");
    },
    showTools: function(shortUrl) {
        this.setTwitter(shortUrl);
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
            a.innerHTML = "Tweet";
            var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", "http://platform.twitter.com/widgets.js");
            a.appendChild(script);
            $("twitter").appendChild(a);
            Utils.setVisible($("twitter"), true);
        } else {
            Utils.setVisible($("twitter"), false);
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
            Utils.setVisible($("mail"), true);
        } else {
            Utils.setVisible($("mail"), false);
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
            Utils.setVisible($("url_detail"), true);
        } else {
            Utils.setVisible($("url_detail"), false);
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
            Utils.setVisible($("qrcode"), true);
        } else {
            Utils.setVisible($("qrcode"), false);
        }
    },
    showQRCode: function(url) {
        $("qrcode_pane").innerHTML = "";
        var img = document.createElement("img");
        img.src = url + ".qr";
        $("qrcode_pane").appendChild(img);
        Utils.setVisible($("qrcode_pane"), true);
    },
    hideQRCode: function(url) {
        Utils.setVisible($("qrcode_pane"), false);
    }
};
