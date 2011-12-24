var Option = function() {
    this.initialize();
};

Option.prototype = {
    bg: null,
    initialize: function() {
        this.bg = chrome.extension.getBackgroundPage();
    },
    start: function() {
        this.assignMessages();
        this.assignEventHandlers();
        this.restoreConfigurations();
        this.checkReadItLaterGrant();
    },
    assignMessages: function() {
        $("optNotification").innerHTML = chrome.i18n.getMessage("optNotification");
        $("optDontShowMsgLogin").innerHTML = chrome.i18n.getMessage("optDontShowMsgLogin");
        $("optDontShowMsgCopyClipboard").innerHTML = chrome.i18n.getMessage("optDontShowMsgCopyClipboard");
        $("optContextMenu").innerHTML = chrome.i18n.getMessage("optContextMenu");
        $("optDontShowContextMenu").innerHTML = chrome.i18n.getMessage("optDontShowContextMenu");
        $("optWatching").innerHTML = chrome.i18n.getMessage("optWatching");
        $("optDontStartWatching").innerHTML = chrome.i18n.getMessage("optDontStartWatching");
        $("optShorten").innerHTML = chrome.i18n.getMessage("optShorten");
        $("optShortenDirectlyAtNotLogin").innerHTML = chrome.i18n.getMessage("optShortenDirectlyAtNotLogin");
        $("optShortenDirectlyAtLogin").innerHTML = chrome.i18n.getMessage("optShortenDirectlyAtLogin");
        $("optTweetAtShortenByContextMenu").innerHTML = chrome.i18n.getMessage("optTweetAtShortenByContextMenu");
        $("optReadItLater").innerHTML = chrome.i18n.getMessage("optReadItLater");
        $("optReadItLaterUsername").innerHTML = chrome.i18n.getMessage("optReadItLaterUsername");
        $("optReadItLaterPassword").innerHTML = chrome.i18n.getMessage("optReadItLaterPassword");
        $("read_it_later_auth").innerHTML = chrome.i18n.getMessage("optReadItLaterSave");
        $("read_it_later_grant").innerHTML = chrome.i18n.getMessage("optReadItLaterGrant");
        $("read_it_later_remove_grant").innerHTML = chrome.i18n.getMessage("optReadItLaterRemoveGrant");
        $("optDontShowMsgRegisterReadItLater").innerHTML = chrome.i18n.getMessage("optDontShowMsgRegisterReadItLater");
    },
    restoreConfigurations: function() {
        $("not_show_notification_after_login").checked =
            !this.bg.gl.isShowNotificationAfterLogin();
        $("not_show_notification_after_copy").checked =
            !this.bg.gl.isShowNotificationAfterCopy();
        $("not_show_notification_after_register_read_it_later").checked =
            !this.bg.gl.isShowNotificationAfterRegisterReadItLater();
        $("not_show_context_menus").checked =
            !this.bg.gl.isShowContextMenus();
        $("not_start_watching").checked =
            !this.bg.gl.isStartWatching();
        $("shorten_directly_at_not_login").checked =
            this.bg.gl.isShortenDirectlyAtNotLogin();
        $("shorten_directly_at_login").checked =
            this.bg.gl.isShortenDirectlyAtLogin();
        $("tweet_at_shorten_by_context_menu").checked =
            this.bg.gl.isTweetAtShortenByContextMenu();
        var readItLaterUsername = this.bg.gl.getReadItLaterUsername();
        if (readItLaterUsername) {
            $("read_it_later_username").value = readItLaterUsername;
        } else {
            $("read_it_later_username").value = "";
        }
        var readItLaterPassword = this.bg.gl.getReadItLaterPassword();
        if (readItLaterPassword) {
            $("read_it_later_password").value = readItLaterPassword;
        } else {
            $("read_it_later_password").value = "";
        }
    },
    assignEventHandlers: function() {
        $("not_show_notification_after_login").onclick =
            this.onClickNotShowNotificationAfterLogin.bind(this);
        $("not_show_notification_after_copy").onclick =
            this.onClickNotShowNotificationAfterCopy.bind(this);
        $("not_show_notification_after_register_read_it_later").onclick =
            this.onClickNotShowNotificationAfterRegisterReadItLater.bind(this);
        $("not_show_context_menus").onclick =
            this.onClickNotShowContextMenus.bind(this);
        $("not_start_watching").onclick =
            this.onClickNotStartWatching.bind(this);
        $("shorten_directly_at_login").onclick =
            this.onClickShortenDirectlyAtLogin.bind(this);
        $("shorten_directly_at_not_login").onclick =
            this.onClickShortenDirectlyAtNotLogin.bind(this);
        $("tweet_at_shorten_by_context_menu").onclick =
            this.onClickTweetAtShortenByContextMenu.bind(this);
        $("read_it_later_auth").onclick =
            this.checkReadItLaterAuth.bind(this);
        $("read_it_later_grant").onclick =
            this.onClickReadItLaterGrant.bind(this);
        $("read_it_later_remove_grant").onclick =
            this.onClickReadItLaterRemoveGrant.bind(this);
    },
    onClickNotShowNotificationAfterLogin: function() {
        this.changeCheckboxConfiguration("not_show_notification_after_login");
    },
    onClickNotShowNotificationAfterCopy: function() {
        this.changeCheckboxConfiguration("not_show_notification_after_copy");
    },
    onClickNotShowNotificationAfterRegisterReadItLater: function() {
        this.changeCheckboxConfiguration("not_show_notification_after_register_read_it_later");
    },
    onClickNotShowContextMenus: function() {
        this.changeCheckboxConfiguration("not_show_context_menus");
        this.bg.gl.setupContextMenus();
    },
    onClickNotStartWatching: function() {
        this.changeCheckboxConfiguration("not_start_watching");
    },
    onClickShortenDirectlyAtNotLogin: function() {
        this.changeCheckboxConfiguration("shorten_directly_at_not_login");
    },
    onClickShortenDirectlyAtLogin: function() {
        this.changeCheckboxConfiguration("shorten_directly_at_login");
    },
    onClickTweetAtShortenByContextMenu: function() {
        this.changeCheckboxConfiguration("tweet_at_shorten_by_context_menu");
    },
    changeCheckboxConfiguration: function(name) {
        localStorage[name] = $(name).checked ? "true" : "";
    },
    checkReadItLaterGrant: function() {
        this.bg.gl.checkReadItLaterGrant(function(result) {
            Utils.setVisible($("readItLaterGranted"), result);
            Utils.setVisible($("readItLaterNotGrant"), !result);
        }.bind(this));
        this.bg.gl.setupContextMenus();
    },
    onClickReadItLaterGrant: function() {
        chrome.permissions.request({
            origins: [
                "https://readitlaterlist.com/"
            ]
        }, function(granted) {
            this.checkReadItLaterGrant();
        }.bind(this));
    },
    checkReadItLaterAuth: function() {
        $("read_it_later_auth").disabled = true;
        $("read_it_later_result").innerHTML = "";
        var username = $("read_it_later_username").value;
        var password = $("read_it_later_password").value;
        localStorage["read_it_later_username"] = username;
        localStorage["read_it_later_password"] = password;
        var url = "https://readitlaterlist.com/v2/auth";
        new Ajax.Request(url, {
            method: "get",
            parameters: {
                username: encodeURIComponent(username),
                password: encodeURIComponent(password),
                apikey: this.bg.gl.getReadItLaterApiKey()
            },
            onSuccess: function(req) {
                localStorage["is_authenticated_read_it_later"] = "1";
                $("read_it_later_result").innerHTML = chrome.i18n.getMessage("optReadItLaterSucceed");
            },
            onFailure: function(req) {
                localStorage["is_authenticated_read_it_later"] = "0";
                $("read_it_later_result").innerHTML = req.status + "(" + req.statusText + ")";
            },
            onComplete: function() {
                $("read_it_later_auth").disabled = false;
            }
        });
    },
    onClickReadItLaterRemoveGrant: function() {
        chrome.permissions.remove({
            origins: [
                "https://readitlaterlist.com/"
            ]
        }, function(removed) {
            this.checkReadItLaterGrant();
        }.bind(this));
    }
};

var option = new Option();
