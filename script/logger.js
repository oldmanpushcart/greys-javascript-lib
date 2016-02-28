/*
 * JavaScriptLogger
 * 这是一个JavaScript脚本支撑的样板工程,方法的执行日志
 * @author : oldmanpushcart@gmail.com
 */

__greys_require({
    paths: {
        lang: 'https://raw.githubusercontent.com/oldmanpushcart/greys-javascript-lib/master/script/lib/common-lang-module.js',
    }
})

__greys_require(['greys', 'lang'], function (greys, lang) {

    if (!String.format) {
        /**
         * 字符串格式化函数
         * var template1="我是{0}，今年{1}了";
         * var template2="我是{name}，今年{age}了";
         * var result1=template1.format("loogn",22);
         * var result2=template1.format({name:"loogn",age:22});
         * @param args 参数列表
         * @returns 格式化后的字符串
         */
        String.prototype.format = function (args) {
            if (arguments.length > 0) {
                var result = this;
                if (arguments.length == 1 && typeof (args) == "object") {
                    for (var key in args) {
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
                else {
                    for (var i = 0; i < arguments.length; i++) {
                        if (arguments[i] == undefined) {
                            return "";
                        }
                        else {
                            var reg = new RegExp("({[" + i + "]})", "g");
                            result = result.replace(reg, arguments[i]);
                        }
                    }
                }
                return result;
            }
            else {
                return this;
            }
        }
    }

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
        return "{timestamp} {classname} {methodname}".format({
            'timestamp': timestamp(),
            'classname': advice.clazz.name,
            'methodname': advice.method.name
        });
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
        var content = "{0} : cost={1}ms;".format(prefix(advice), context.cost);

        // 拼装参数列表
        if (advice.params.length > 0) {
            content += "params[{0}];".format(function () {
                var paramString = "";
                for (var index in advice.params) {
                    paramString += advice.params[index];
                    if (index < advice.params.length - 1) {
                        paramString += ",";
                    }
                }
                return paramString;
            });
        }

        // 拼装返回值
        if (advice.isReturning) {
            content += "return[{0}];".format(advice.returnObj);
        }

        // 拼装异常信息
        if (advice.isThrowing) {
            content += "throwing[{throwing}];".format({'throwing': advice.throwExp});
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