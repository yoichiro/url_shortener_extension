var Utils = function() {
};

Utils.setVisible = function(elem, visible) {
    Element.setStyle(elem, {
        display: visible ? "block" : "none"
    });
};
