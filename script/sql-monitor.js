__greys_require({
    paths: {
        tui: 'https://raw.githubusercontent.com/oldmanpushcart/greys-anatomy/master/scripts/text-formatting-module.js',
        stats: 'https://raw.githubusercontent.com/oldmanpushcart/greys-anatomy/master/scripts/stream-statistics-module.js',
        lang: 'https://raw.githubusercontent.com/oldmanpushcart/greys-anatomy/master/scripts/common-lang-module.js',
    }
})

/**
 * 模版
 */
__greys_require(['greys', 'lang', 'tui', 'stats'], function (greys, lang, tui, stats) {

    // 监控数据(K(id):V(stats,sql))
    var monitor = {};

    // Statement解析器
    var parsers = [

        // mysql-jdbc-connector-parser
        {
            test: function (advice) {
                return /^com\.mysql\.jdbc\.PreparedStatement$/.test(advice.clazz.name)
                    && /^(execute|executeQuery|executeUpdate|executeBatch)$/.test(advice.method.name)
                    && lang.array.isEmpty(advice.params)
            },

            parse: function (advice) {
                return advice.target.getNonRewrittenSql();
            }
        }
    ];

    var limit = 100;

    function getParser(advice) {
        var it = lang.array.iterator(parsers);
        while (it.hasNext()) {
            var parse = it.next();
            if (parse.test(advice)) {
                return parse;
            }
        }
    }

    function finish(output, advice, context) {

        var parse = getParser(advice);
        if (!parse) {
            return;
        }

        var sql = parse.parse(advice);
        if (!sql) {
            return;
        }

        var stat = monitor[sql];
        if (!stat) {
            stat = monitor[sql] = stats.create([
                stats.SUM,
                stats.SUM,
                stats.SUM,
                stats.AVG,
                stats.MIN,
                stats.MAX,
            ]);
        }

        stat.stats(
            1,
            advice.isReturning ? 1 : 0,
            advice.isThrowing ? 1 : 0,
            context.getCost(),
            context.getCost(),
            context.getCost()
        );

        if (limit-- <= 0) {
            limit = 100;

            var table = new tui.table();
            table.config({
                borders: ['top', 'bottom', 'left', 'right', 'vertical', 'horizontal'],
                padding: 1,
                columns: [
                    {
                        width: 80,
                        vertical: 'middle',
                        horizontal: 'left'
                    },
                    {
                        width: 10,
                        vertical: 'middle',
                        horizontal: 'left'
                    },
                    {
                        width: 10,
                        vertical: 'middle',
                        horizontal: 'left'
                    },
                    {
                        width: 10,
                        vertical: 'middle',
                        horizontal: 'left'
                    },
                    {
                        width: 10,
                        vertical: 'middle',
                        horizontal: 'left'
                    },
                    {
                        width: 10,
                        vertical: 'middle',
                        horizontal: 'left'
                    },
                    {
                        width: 10,
                        vertical: 'middle',
                        horizontal: 'left'
                    }
                ]
            });

            // add title
            table.row('SQL', 'TOTAL', 'SUCCESS', 'FAIL', 'RT', 'RT-MIN', 'RT-MAX');

            for (var sql in monitor) {
                var stat = monitor[sql];
                var report = stat.stats();

                table.row(
                    "" + sql,
                    "" + report[0],
                    "" + report[1],
                    "" + report[2],
                    "" + (report[3].toFixed(2)),
                    "" + (report[4].toFixed(2)),
                    "" + (report[5].toFixed(2))
                );
                monitor[sql] = null;
            }

            output.println(table.rendering());
        }

    }

    greys.watching({
        returning: finish,
        throwing: finish,
    });
})