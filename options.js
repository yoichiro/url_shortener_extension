var Option = function() {
    this.initialize();
};

Option.prototype = {
    initialize: function() {
    },
    start: function() {
        chrome.runtime.getBackgroundPage(function(bg) {
            this.assignMessages();
            this.assignEventHandlers();
            this.restoreConfigurations(bg);
            this.checkReadItLaterGrant();
        }.bind(this));
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
        $("optWatching").innerHTML = chrome.i18n.getMessage("optWatching");
        $("optWatchingDontStartWatchingAtCheckHighPriority").innerHTML = chrome.i18n.getMessage("optWatchingDontStartWatchingAtCheckHighPriority");
        $("optAdoptLinkUrlContextMenu").innerHTML = chrome.i18n.getMessage("optAdoptLinkUrlContextMenu");
        $("optDontShortenUrlAgainInHistoryAlready").innerHTML = chrome.i18n.getMessage("optDontShortenUrlAgainInHistoryAlready");
    },
    restoreConfigurations: function(bg) {
        $("not_show_notification_after_login").checked =
            !bg.gl.isShowNotificationAfterLogin();
        $("not_show_notification_after_copy").checked =
            !bg.gl.isShowNotificationAfterCopy();
        $("not_show_notification_after_register_read_it_later").checked =
            !bg.gl.isShowNotificationAfterRegisterReadItLater();
        $("not_show_context_menus").checked =
            !bg.gl.isShowContextMenus();
        $("not_start_watching").checked =
            !bg.gl.isStartWatching();
        $("shorten_directly_at_not_login").checked =
            bg.gl.isShortenDirectlyAtNotLogin();
        $("shorten_directly_at_login").checked =
            bg.gl.isShortenDirectlyAtLogin();
        $("tweet_at_shorten_by_context_menu").checked =
            bg.gl.isTweetAtShortenByContextMenu();
        $("facebook_at_shorten_by_context_menu").checked =
            bg.gl.isFacebookAtShortenByContextMenu();
        var readItLaterUsername = bg.gl.getReadItLaterUsername();
        if (readItLaterUsername) {
            $("read_it_later_username").value = readItLaterUsername;
        } else {
            $("read_it_later_username").value = "";
        }
        var readItLaterPassword = bg.gl.getReadItLaterPassword();
        if (readItLaterPassword) {
            $("read_it_later_password").value = readItLaterPassword;
        } else {
            $("read_it_later_password").value = "";
        }
        $("background_image_url").value = bg.gl.getBackgroundImageUrl();
        $("twitter_set_title").checked = bg.gl.isTwitterSetTitle();
        $("tweet_at_shorten_by_popup").checked =
            bg.gl.isTweetAtShortenByPopup();
        $("facebook_at_shorten_by_popup").checked =
            bg.gl.isFacebookAtShortenByPopup();
        $("amazon_short_url").checked =
            bg.gl.isAmazonShortUrl();
        $("not_start_watching_at_check_high_priority").checked =
            !bg.gl.isStartWatchingAtCheckHighPriority();
        $("adopt_link_url_context_menu").checked =
            bg.gl.isAdoptLinkUrlContextMenu();
        $("dont_shorten_url_again_in_history_already").checked =
            !bg.gl.isShortenUrlAgainInHistoryAlready();
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
        $("not_start_watching_at_check_high_priority").onclick =
            this.onClickNotStartWatchingAtCheckHighPriority.bind(this);
        $("adopt_link_url_context_menu").onclick =
            this.onClickAdoptLinkUrlContextMenu.bind(this);
        $("dont_shorten_url_again_in_history_already").onclick =
            this.onClickDontShortenUrlAgainInHistoryAlready.bind(this);
    },
    onClickDontShortenUrlAgainInHistoryAlready: function() {
        this.changeCheckboxConfiguration("dont_shorten_url_again_in_history_already");
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
        chrome.runtime.getBackgroundPage(function(bg) {
            this.changeCheckboxConfiguration("not_show_context_menus");
            bg.gl.setupContextMenus();
        }.bind(this));
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
        chrome.runtime.getBackgroundPage(function(bg) {
            bg.gl.checkReadItLaterGrant(function(result) {
                utils.setVisible($("readItLaterGranted"), result);
                utils.setVisible($("readItLaterNotGrant"), !result);
            }.bind(this));
            bg.gl.setupContextMenus();
        });
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
        chrome.runtime.getBackgroundPage(function(bg) {
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
                    apikey: bg.gl.getReadItLaterApiKey()
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
        }.bind(this));
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
    },
    onClickNotStartWatchingAtCheckHighPriority: function() {
        this.changeCheckboxConfiguration("not_start_watching_at_check_high_priority");
    },
    onClickAdoptLinkUrlContextMenu: function() {
        this.changeCheckboxConfiguration("adopt_link_url_context_menu");
    }
};

var option = new Option();
window.onload = function() {
    option.start();
};
