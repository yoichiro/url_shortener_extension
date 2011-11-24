var Option = function() {
    this.initialize();
};

Option.prototype = {
    bg: null,
    initialize: function() {
        this.bg = chrome.extension.getBackgroundPage();
    },
    start: function() {
        this.assignEventHandlers();
        this.restoreConfigurations();
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
