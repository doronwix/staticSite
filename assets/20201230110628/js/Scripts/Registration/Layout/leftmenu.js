$(document).ready(function () {
    LeftMenu.init();
});

var LeftMenu = {
    init: function () {
        this.setDomReferences();
        this.setDomEvents();

    },
    setDomReferences: function () {
    },
    setDomEvents: function () {
        $('#lnkClickSnapChat').on('click',function () {
            googleTagManager.StartChat();
            return false;
        });
        $('#lnkClickChat').on('click',function () {
            var lpButtonCTTUrl = $('#lnkClickChat').attr("href");
            window.open(lpButtonCTTUrl, 'chat36566978', 'width=490,height=440,resizable=yes');
            return false;
        });
    }
};