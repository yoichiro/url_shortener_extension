var WebIntent = function() {
    this.initialize();
};

WebIntent.prototype = {
    initialize: function() {
    },
    start: function() {
        this.shortenUrl();
    },
    shortenUrl: function() {
        var intent = window.intent || window.webkitIntent;
        this.longUrl = intent.data;
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.gl.shortenLongUrl(this.longUrl, null, {
                onSuccess: function(req) {
                    this.onSuccessShorten(req);
                }.bind(this),
                onFailure: function(req) {
                    this.onFailureShorten(req);
                }.bind(this),
                onComplete: function(req) {
                    utils.setVisible($("progress_pane"), false);
                    utils.setVisible($("result_pane"), true);
                }.bind(this)
            });
        }.bind(this));
    },
    onSuccessShorten: function(req) {
        var shortUrl = req.responseJSON.id;
        $("shortUrl").value = shortUrl;
        $("longUrl").value = this.longUrl;
//        var message = chrome.i18n.getMessage("webintentMessageSucceed");
        var message = "Succeeded shorten.";
        var messageDiv = $("message");
        messageDiv.innerHTML = message;
        messageDiv.addClassName("success");
        $("btnReturn").onclick = function(evt) {
            var intent = window.intent || window.webkitIntent;
            intent.postResult(shortUrl);
            window.close();
        }.bind(this);
    },
    onFailureShorten: function(req) {
        var message = req.status + "(" + req.statusText + ")";
        var messageDiv = $("message");
        messageDiv.innerHTML = message;
        messageDiv.addClass("failure");
        $("btnReturn").onclick = function(evt) {
            var intent = window.intent || window.webkitIntent;
            intent.postFailure(message);
            window.close();
        }.bind(this);
    }
};

var wi = new WebIntent();