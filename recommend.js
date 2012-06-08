var Recommend = function() {
    this.initialize();
};

Recommend.prototype = {
    initialize: function() {
    },
    assignMessages: function() {
        $("popupRecommend").innerHTML = chrome.i18n.getMessage("popupRecommend");
        $("popupReport").innerHTML = chrome.i18n.getMessage("popupReport");
    },
    assignEventHandlers: function() {
        $("recommend").onclick = this.onClickRecommend.bind(this);
        $("report").onclick = this.onClickReport.bind(this);
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
    onClickReport: function() {
        chrome.tabs.create({
            url: "https://github.com/yoichiro/url_shortener_extension/issues"
        }, function(tab) {
            window.close();
        }.bind(this));
    },
    showRecommend: function() {
        var v = Math.floor(Math.random() * 3 + 1);
        if (v != 2) {
            Element.setStyle($("recommend"), {
                display: "none"
            });
        } else {
            Element.setStyle($("report"), {
                display: "none"
            });
        }
    }
};
