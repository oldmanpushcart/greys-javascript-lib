/**
 * 定义了一个console模块
 * 简单实现,不要吐槽
 */
require({
    paths: {
        'common-lang': 'https://raw.githubusercontent.com/oldmanpushcart/greys-anatomy/master/scripts/common-lang-module.js',
    }
});


define(['common-lang'], function (lang) {

    function log() {
        var string = lang.string.format(arguments);
        java.lang.System.out.println(string);
    }

    return {
        log: log,
    }
})