const fs = require('fs');

function readFile(filename, enc){
    return new Promise(function (resolve, reject){
        fs.readFile(filename, enc, function (err, res){
            if (err) reject(err);
            else resolve(res);
        });
    });
}

function writeFile(filename, data){
    return new Promise(function (resolve, reject){
        fs.writeFile(filename, data, function (err) {
            if (err) return reject();
            return resolve("Saved");
        });
    });
}

module.exports = {
    customizePrometheusConfigFile: function (ipCAdvisorList) {
        return readFile("./monitoring/prometheus.yml.dist", 'utf8')
            .then((res) => writeFile("./monitoring/prometheus.yml", res + ipCAdvisorList))
    },
    getGrafanaDashboard: function() {
        return readFile("./monitoring/docker-monitoring_rev1.json", 'utf8')
            .then(text => JSON.parse(text))
    },
    delayPromise: function(delay) {
    //return a function that accepts a single variable
        return function(data) {
            //this function returns a promise.
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    //a promise that is resolved after "delay" milliseconds with the data provided
                    resolve(data);
                }, delay);
            });
        }
    }
};
