/**
 * 定义了一个console模块
 * 简单实现,不要吐槽
 */
require({
    paths: {
        'common-lang': 'https://raw.githubusercontent.com/oldmanpushcart/greys-javascript-lib/master/script/lib/common-lang-module.js',
    }
});

require(['common-lang'], function (lang) {

    function log() {
        var string = lang.string.format.apply(this, arguments);
        java.lang.System.out.println(string);
    }

    exports.log = log;

})