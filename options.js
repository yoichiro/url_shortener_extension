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
        $("optDontStartWatching").innerHTML = chrome.i18n.getMessage("optDontStartWatching");
        $("optShorten").innerHTML = chrome.i18n.getMessage("optShorten");
        $("optShortenDirectlyAtNotLogin").innerHTML = chrome.i18n.getMessage("optShortenDirectlyAtNotLogin");
        $("optShortenDirectlyAtLogin").innerHTML = chrome.i18n.getMessage("optShortenDirectlyAtLogin");
        $("optReadItLater").innerHTML = chrome.i18n.getMessage("optReadItLater");
        $("optReadItLaterUsername").innerHTML = chrome.i18n.getMessage("optReadItLaterUsername");
        $("optReadItLaterPassword").innerHTML = chrome.i18n.getMessage("optReadItLaterPassword");
        $("read_it_later_auth").innerHTML = chrome.i18n.getMessage("optReadItLaterSave");
        $("read_it_later_grant").innerHTML = chrome.i18n.getMessage("optReadItLaterGrant");
        $("read_it_later_remove_grant").innerHTML = chrome.i18n.getMessage("optReadItLaterRemoveGrant");
        $("optDontShowMsgRegisterReadItLater").innerHTML = chrome.i18n.getMessage("optDontShowMsgRegisterReadItLater");
        $("optBackgroundImageUrl").innerHTML = chrome.i18n.getMessage("optBackgroundImageUrl");
        $("background_image_url_save").innerHTML = chrome.i18n.getMessage("optBackgroundImageUrlSave");
        $("optTwitter").innerHTML = chrome.i18n.getMessage("optTwitter");
        $("optTweetAtShortenByContextMenu").innerHTML = chrome.i18n.getMessage("optTweetAtShortenByContextMenu");
        $("optTwitterSetTitle").innerHTML = chrome.i18n.getMessage("optTwitterSetTitle");
        $("optTweetAtShortenByPopup").innerHTML = chrome.i18n.getMessage("optTweetAtShortenByPopup");
        $("optShare").innerHTML = chrome.i18n.getMessage("optShare");
        $("optFacebookAtShortenByContextMenu").innerHTML = chrome.i18n.getMessage("optFacebookAtShortenByContextMenu");
        $("optFacebookAtShortenByPopup").innerHTML = chrome.i18n.getMessage("optFacebookAtShortenByPopup");
        $("optAmazon").innerHTML = chrome.i18n.getMessage("optAmazon");
        $("optAmazonShortUrl").innerHTML = chrome.i18n.getMessage("optAmazonShortUrl");
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
        $("facebook_at_shorten_by_context_menu").checked =
            this.bg.gl.isFacebookAtShortenByContextMenu();
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
        $("background_image_url").value = this.bg.gl.getBackgroundImageUrl();
        $("twitter_set_title").checked = this.bg.gl.isTwitterSetTitle();
        $("tweet_at_shorten_by_popup").checked =
            this.bg.gl.isTweetAtShortenByPopup();
        $("facebook_at_shorten_by_popup").checked =
            this.bg.gl.isFacebookAtShortenByPopup();
        $("amazon_short_url").checked =
            this.bg.gl.isAmazonShortUrl();
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
        $("background_image_url_save").onclick =
            this.onClickBackgroundImageUrlSave.bind(this);
        $("twitter_set_title").onclick =
            this.onClickTwitterSetTitle.bind(this);
        $("tweet_at_shorten_by_popup").onclick =
            this.onClickTweetAtShortenByPopup.bind(this);
        $("facebook_at_shorten_by_context_menu").onclick =
            this.onClickFacebookAtShortenByContextMenu.bind(this);
        $("facebook_at_shorten_by_popup").onclick =
            this.onClickFacebookAtShortenByPopup.bind(this);
        $("amazon_short_url").onclick =
            this.onClickAmazonShortUrl.bind(this);
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
        if ($("tweet_at_shorten_by_context_menu").checked
            && $("facebook_at_shorten_by_context_menu").checked) {
            $("facebook_at_shorten_by_context_menu").checked = false;
            this.onClickFacebookAtShortenByContextMenu();
        }
    },
    onClickTwitterSetTitle: function() {
        this.changeCheckboxConfiguration("twitter_set_title");
    },
    onClickTweetAtShortenByPopup: function() {
        this.changeCheckboxConfiguration("tweet_at_shorten_by_popup");
        if ($("tweet_at_shorten_by_popup").checked
            && $("facebook_at_shorten_by_popup").checked) {
            $("facebook_at_shorten_by_popup").checked = false;
            this.onClickFacebookAtShortenByPopup();
        }
    },
    changeCheckboxConfiguration: function(name) {
        localStorage[name] = $(name).checked ? "true" : "";
    },
    checkReadItLaterGrant: function() {
        this.bg.gl.checkReadItLaterGrant(function(result) {
            utils.setVisible($("readItLaterGranted"), result);
            utils.setVisible($("readItLaterNotGrant"), !result);
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
                $("read_it_later_result").innerHTML =
                    chrome.i18n.getMessage("optReadItLaterSucceed");
            },
            onFailure: function(req) {
                localStorage["is_authenticated_read_it_later"] = "0";
                $("read_it_later_result").innerHTML = req.status + "(" + req.statusText + ")";
            },
            onComplete: function() {
                $("read_it_later_auth").disabled = false;
                setTimeout(function() {
                    $("read_it_later_result").innerHTML = "";
                }, 5000);
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
    },
    onClickBackgroundImageUrlSave: function() {
        localStorage["background_image_url"] = $("background_image_url").value;
        $("background_image_url_result").innerHTML = chrome.i18n.getMessage("optBackgroundImageUrlSaveSucceed");
        setTimeout(function() {
            $("background_image_url_result").innerHTML = "";
        }, 5000);
    },
    onClickFacebookAtShortenByContextMenu: function() {
        this.changeCheckboxConfiguration("facebook_at_shorten_by_context_menu");
        if ($("facebook_at_shorten_by_context_menu").checked
            && $("tweet_at_shorten_by_context_menu").checked) {
            $("tweet_at_shorten_by_context_menu").checked = false;
            this.onClickTweetAtShortenByContextMenu();
        }
    },
    onClickFacebookAtShortenByPopup: function() {
        this.changeCheckboxConfiguration("facebook_at_shorten_by_popup");
        if ($("facebook_at_shorten_by_popup").checked
            && $("tweet_at_shorten_by_popup").checked) {
            $("tweet_at_shorten_by_popup").checked = false;
            this.onClickTweetAtShortenByPopup();
        }
    },
    onClickAmazonShortUrl: function() {
        this.changeCheckboxConfiguration("amazon_short_url");
    }
};

var option = new Option();
