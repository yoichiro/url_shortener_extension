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
    },
    assignMessages: function() {
        $("optNotification").innerHTML = chrome.i18n.getMessage("optNotification");
        $("optDontShowMsgLogin").innerHTML = chrome.i18n.getMessage("optDontShowMsgLogin");
        $("optDontShowMsgCopyClipboard").innerHTML = chrome.i18n.getMessage("optDontShowMsgCopyClipboard");
        $("optContextMenu").innerHTML = chrome.i18n.getMessage("optContextMenu");
        $("optDontShowContextMenu").innerHTML = chrome.i18n.getMessage("optDontShowContextMenu");
        $("optWatching").innerHTML = chrome.i18n.getMessage("optWatching");
        $("optDontStartWatching").innerHTML = chrome.i18n.getMessage("optDontStartWatching");
    },
    restoreConfigurations: function() {
        $("not_show_notification_after_login").checked =
            !this.bg.gl.isShowNotificationAfterLogin();
        $("not_show_notification_after_copy").checked =
            !this.bg.gl.isShowNotificationAfterCopy();
        $("not_show_context_menus").checked =
            !this.bg.gl.isShowContextMenus();
        $("not_start_watching").checked =
            !this.bg.gl.isStartWatching();
    },
    assignEventHandlers: function() {
        $("not_show_notification_after_login").onclick =
            this.onClickNotShowNotificationAfterLogin.bind(this);
        $("not_show_notification_after_copy").onclick =
            this.onClickNotShowNotificationAfterCopy.bind(this);
        $("not_show_context_menus").onclick =
            this.onClickNotShowContextMenus.bind(this);
        $("not_start_watching").onclick =
            this.onClickNotStartWatching.bind(this);
    },
    onClickNotShowNotificationAfterLogin: function() {
        this.changeCheckboxConfiguration("not_show_notification_after_login");
    },
    onClickNotShowNotificationAfterCopy: function() {
        this.changeCheckboxConfiguration("not_show_notification_after_copy");
    },
    onClickNotShowContextMenus: function() {
        this.changeCheckboxConfiguration("not_show_context_menus");
        this.bg.gl.setupContextMenus();
    },
    onClickNotStartWatching: function() {
        this.changeCheckboxConfiguration("not_start_watching");
    },
    changeCheckboxConfiguration: function(name) {
        localStorage[name] = $(name).checked ? "true" : "";
    }
};

var option = new Option();
