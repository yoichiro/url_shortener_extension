var Utils = function() {
};

Utils.prototype = {
    setVisible: function(elem, visible) {
        Element.setStyle(elem, {
            display: visible ? "block" : "none"
        });
    },
    createElement: function(name, attributes, classNames, parent) {
        var element = document.createElement(name);
        for (var k in attributes) {
            element.setAttribute(k, attributes[k]);
        }
        for (var i = 0; i < classNames.length; i++) {
            element.addClassName(classNames[i]);
        }
        parent.appendChild(element);
        return element;
    },
    createTextNode: function(value, parent) {
        var textNode = document.createTextNode(value);
        parent.appendChild(textNode);
        return textNode;
    }
};

var utils = new Utils();