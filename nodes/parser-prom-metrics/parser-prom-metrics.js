module.exports = function(RED) {
    'use strict';
    function ParserPromMetrics(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();

            var payload = msg.payload.split('\n');
            var metrics = [];
            metrics = payload.filter(function(item) {
                // ignore comment line
                return ! item.startsWith('#');
            })
            .map(function(item) {
                var re = new RegExp('^(.+)({.*})');
                var [key, value] = item.split(' ');
                var params = re.exec(key);
                if (params && 1 < params.length) {
                    var converter = new RegExp('([^{,}]+?)=([^{,}]+)', 'g');
                    var labels = params[2].replace(converter, '"$1":$2');
                    labels = JSON.parse(labels);
                }
                var metric = [];
                metric['name'] = params&&params[1]||key;
                metric['value'] = parseFloat(value);
                if (labels) {
                    metric['labels'] = labels;
                }
                return metric;
            });

            msg.payload = metrics;
            node.send(msg);
        });
    }
    RED.nodes.registerType("parser-prom-metrics", ParserPromMetrics);
}
