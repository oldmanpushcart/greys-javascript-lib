__greys_require({
    paths: {
        tui: 'https://raw.githubusercontent.com/oldmanpushcart/greys-javascript-lib/master/script/lib/text-formatting-module.js',
        stats: 'https://raw.githubusercontent.com/oldmanpushcart/greys-javascript-lib/master/script/lib/stream-statistics-module.js',
        lang: 'https://raw.githubusercontent.com/oldmanpushcart/greys-javascript-lib/master/script/lib/common-lang-module.js',
        scheduler: 'https://raw.githubusercontent.com/oldmanpushcart/greys-javascript-lib/master/script/lib/scheduler-module.js',
    }
})

/**
 * 模版
 */
__greys_require(['greys', 'lang', 'tui', 'stats', 'scheduler'], function (greys, lang, tui, stats, scheduler) {

    // 监控数据(K(id):V(stats,id))
    var monitor = {};
    var timer;
    var lock = new lang.lock();

    function _create(output) {
        timer = new scheduler();
        timer.setInterval(function () {

            var _monitor;

            lock.lock();
            try {
                _monitor = monitor;
                monitor = {};
            } finally {
                lock.unlock();
            }

            var table = new tui.table();
            table.config({
                borders: ['top', 'bottom', 'left', 'right', 'vertical', 'horizontal'],
                padding: 1,
                columns: [
                    {
                        width: 22,
                        vertical: 'middle',
                        horizontal: 'left'
                    },
                    {
                        width: 50,
                        vertical: 'middle',
                        horizontal: 'left'
                    },
                    {
                        width: 40,
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
            table.row('TIMESTAMP', 'CLASS', 'METHOD', 'TOTAL', 'SUCCESS', 'FAIL', 'RT', 'RT-MIN', 'RT-MAX');
            var timestamp = lang.date.format(new Date(), 'yyyy-MM-dd hh:mm:ss');

            for (var id in _monitor) {
                var statData = _monitor[id];
                var report = statData.stat.stats();
                table.row(
                    "" + timestamp,
                    "" + statData.clazz,
                    "" + statData.method,
                    "" + report[0],
                    "" + report[1],
                    "" + report[2],
                    "" + (report[3].toFixed(2)),
                    "" + (report[4].toFixed(2)),
                    "" + (report[5].toFixed(2))
                );
            }

            output.println(table.rendering());

        }, 1000*60);
    }

    function _destroy() {
        timer.shutdown();
    }

    function finish(output, advice, context) {

        var id = advice.clazz.name + "#" + advice.method.name;

        lock.lock();
        try {
            var statData = monitor[id];
            if (!statData) {
                statData = monitor[id] = {
                    stat: stats.create([
                        stats.SUM,
                        stats.SUM,
                        stats.SUM,
                        stats.AVG,
                        stats.MIN,
                        stats.MAX,
                    ]),
                    clazz: advice.clazz.name,
                    method: advice.method.name
                }
            }

            statData.stat.stats(
                1,
                advice.isReturning ? 1 : 0,
                advice.isThrowing ? 1 : 0,
                context.getCost(),
                context.getCost(),
                context.getCost()
            );
        } finally {
            lock.unlock();
        }

    }

    greys.watching({
        create: _create,
        destroy: _destroy,
        returning: finish,
        throwing: finish,
    });


})
