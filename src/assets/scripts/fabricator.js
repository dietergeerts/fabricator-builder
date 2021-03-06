(function () {
    'use strict';
    
    require('./prism');
    
    /**
     * Global `fabricator` object
     * @namespace
     */
    var fabricator = window.fabricator = {};

    /**
     * Default options
     * @type {Object}
     */
    fabricator.options = {toggles: {notes: true, code: false}};
    
    /**
     * Feature detection
     * @type {Object}
     */
    fabricator.test = {};

    // test for sessionStorage
    fabricator.test.sessionStorage = (function () {
        var test = '_f';
        try {
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })();

    // create storage object if it doesn't exist; store options
    if (fabricator.test.sessionStorage) {
        sessionStorage.fabricator = sessionStorage.fabricator || JSON.stringify(fabricator.options);
    }

    /**
     * Get current option values from session storage
     * @return {Object}
     */
    fabricator.getOptions = function () {
        return (fabricator.test.sessionStorage) ? JSON.parse(sessionStorage.fabricator) : fabricator.options;
    };

    /**
     * Build color chips
     * @return {Object} fabricator
     */
    fabricator.buildColorChips = function () {

        var chips = document.querySelectorAll('.f-color-chip');
        var color;

        for (var i = chips.length - 1; i >= 0; i--) {
            color = chips[i].querySelector('.f-color-chip__color').innerHTML;
            chips[i].style.borderTopColor = color;
            chips[i].style.borderBottomColor = color;
        }

        return this;
    };

    /**
     * Handler for preview and code toggles
     * @return {Object} fabricator
     */
    fabricator.allItemsToggles = function () {

        var options = fabricator.getOptions();
        var items = {
            notes: document.querySelectorAll('[data-f-toggle="notes"]'),
            code: document.querySelectorAll('[data-f-toggle="code"]')
        };

        var toggleAllControls = document.querySelectorAll('.f-menu [data-f-toggle-control]');
        for (var i = 0; i < toggleAllControls.length; i++) {
            toggleAllControls[i].addEventListener('click', function (e) {
                toggleAllItems(
                    e.currentTarget.getAttribute('data-f-toggle-control'),
                    e.currentTarget.className.indexOf('f-active') < 0);
            });
        }

        // persist toggle options from page to page
        for (var toggle in options.toggles) {
            if (options.toggles.hasOwnProperty(toggle)) {
                toggleAllItems(toggle, options.toggles[toggle]);
            }
        }

        return this;

        function toggleAllItems(type, value) {

            var typedItems = items[type];
            for (var i = 0; i < typedItems.length; i++) {
                if (value) {
                    removeClass(typedItems[i], 'f-item-hidden');
                } else {
                    addClass(typedItems[i], 'f-item-hidden');
                }
            }

            var button = document.querySelector('.f-menu [data-f-toggle-control=' + type + ']');
            
            if (value) {
                addClass(button, 'f-active');
            } else {
                removeClass(button, 'f-active');
            }

            options.toggles[type] = value;

            if (fabricator.test.sessionStorage) {
                sessionStorage.setItem('fabricator', JSON.stringify(options));
            }
        }
    };
    
    /**
     * Handler for single item code toggling
     */
    fabricator.singleItemToggle = function () {

        var itemToggleSingle = document.querySelectorAll('.f-item-group [data-f-toggle-control]');
        for (var i = 0; i < itemToggleSingle.length; i++) {
            itemToggleSingle[i].addEventListener('click', toggleSingleItemCode);
        }

        return this;

        function toggleSingleItemCode(e) {
            var group = e.currentTarget.parentNode.parentNode.parentNode;
            var type = e.currentTarget.getAttribute('data-f-toggle-control');
            var button = group.querySelector('[data-f-toggle=' + type + ']');

            if (button.className.indexOf('f-item-hidden') > -1) {
                removeClass(button, 'f-item-hidden');  
            } else {
                addClass(button, 'f-item-hidden');
            }
        }
    };

    /**
     * Automatically select code when code block is clicked
     */
    fabricator.bindCodeAutoSelect = function () {

        var codeBlocks = document.querySelectorAll('.f-item-code');

        for (var i = codeBlocks.length - 1; i >= 0; i--) {
            codeBlocks[i].addEventListener('click', select.bind(this, codeBlocks[i]));
        }

        return this;

        function select(block) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(block.querySelector('code'));
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
    
    /**
     * Init the deep menu toggles.
     * @returns {Window.fabricator}
     */
    fabricator.initDeepMenuToggles = function () {

        var deepMenus = document.querySelectorAll('.f-menu-toggle');
        for (var index = 0; index < deepMenus.length; index++) {
            deepMenus[index].addEventListener('click', toggleDeepMenu);
        }

        return this;

        function toggleDeepMenu(event) {
            event.stopPropagation();
            var target = event.currentTarget;
            addClass(target, 'f-active');

            document.addEventListener('click', closeDeepMenu);

            function closeDeepMenu(event) {
                removeClass(target, 'f-active');
                document.removeEventListener('click', closeDeepMenu);
            }
        }
    };
    
    /**
     * Initialization
     */
    fabricator
        .allItemsToggles()
        .singleItemToggle()
        .buildColorChips()
        .bindCodeAutoSelect()
        .initDeepMenuToggles();

    /*
     * Utility functions
     */

    function addClass(element, name) {
        element.className = element.className + ' ' + name;
    }

    function removeClass(element, name) {
        element.className = element.className.replace(' ' + name, '').replace(name, '');
    }
})();
