/*
 * Simple Logger
 * 简单日志脚本,这是一个JavaScript脚本支撑的样板工程,方法的执行日志
 * @author : oldmanpushcart@gmail.com
 */

__greys_require({
    paths: {
        lang: 'https://raw.githubusercontent.com/oldmanpushcart/greys-javascript-lib/master/script/lib/common-lang-module.js',
    }
})

__greys_require(['greys', 'lang'], function (greys, lang) {

    /**
     * 获取当前系统时间戳
     * @returns 时间戳字符串
     */
    function timestamp() {
        return lang.date.format(new Date(), "yyyy-MM-dd hh:mm:ss");
    }

    /**
     * 日志前缀
     * @param advice Advice
     * @return 日志前缀内容
     */
    function prefix(advice) {
        return lang.string.format(
            '{0} {1} {2}',
            timestamp(),
            advice.clazz.name,
            advice.method.name
        );
    }

    /**
     * 输出Java的Throwable异常信息
     * @param throwing Java异常信息
     * @return 异常信息字符串堆栈
     */
    function printingJavaThrowable(throwing) {
        var throwingString = null;
        var sw = new java.io.StringWriter();
        var pw = new java.io.PrintWriter(sw);
        try {
            throwing.printStackTrace(pw);
            throwingString = sw.toString();
        } finally {
            pw.close();
            sw.close();
        }
        return throwingString;
    }

    function finish(output, advice, context) {
        var content = lang.string.format("{0} : cost={1}ms;", prefix(advice), context.cost);

        // 拼装参数列表
        if (advice.params.length > 0) {
            content += lang.string.format(
                'params[{0}]',
                function () {
                    var paramString = "";
                    lang.array.forEach(advice.params, function (index, param) {
                        paramString += param;
                        if (index < advice.params.length - 1) {
                            paramString += ",";
                        }
                    })
                    return paramString;
                }()
            );
        }

        // 拼装返回值
        if (advice.isReturning) {
            content += lang.string.format('return[{0}]', advice.returnObj);
        }

        // 拼装异常信息
        if (advice.isThrowing) {
            content += lang.string.format('throwing[{0}]', advice.throwExp);
            content += "\n" + printingJavaThrowable(advice.throwExp);
        }

        output.println(content);
    }


    greys.watching({
        returning: function (output, advice, context) {
            finish(output, advice, context);
        },
        throwing: function (output, advice, context) {
            finish(output, advice, context);
        }
    })

})