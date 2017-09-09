const rp = require('request-promise');

const config = require('./../../MDS_exp_config');
const provider = require('./../../Provider')(config.providers);
const docker = require('./../../programs/docker');
const dockerMachine = require('./../../programs/dockerMachine');
const dockerMachineRaw = require('./../../programs/dockerMachineRaw');

const dockerMachineSSHRaw = require('./../../programs/dockerMachineSSHRaw');

const prometheusUtils = require('./../../utils/prometheusUtils');

const dockerUtils = require('./../../utils/dockerUtils');

let managerNodePromise = provider(config.manager.provider)
    .create(config.manager.name)
    .catch(e => {
        process.stdout.write("Cannot create docker-instance with name: " + config.manager.name)
    });

let workers = Promise.all(config.agents.map(machine =>
    provider(machine.provider)
        .create(machine.name, {"size": machine.size})
        .catch(e => process.stdout.write("Cannot create docker with name: " + machine.name))
));

let swarmAgents = workers
    .then(() => dockerMachine("ip", config.manager.name))
    .then(ip => dockerMachineSSHRaw('docker swarm init --advertise-addr ' + ip, config.manager.name))
    .catch(e => process.stdout.write('Cannot create swarm: ' + e + '\n'))
    .then(t => {
        let codeToJoinSwarm = dockerUtils.getJoinSwarmCommandFromString(t);
        return Promise.all(config.agents.map(machine => {
            dockerMachineSSHRaw(codeToJoinSwarm, machine.name)
            .catch(e => "cannot joint to swarm by one of workers" + machine.name + " " + e)
        }))
    });

let cAdvisorsPromise = Promise.all([workers, managerNodePromise]).then(() => Promise.all(
    (config.agents.concat([config.manager])).map(machine => dockerMachine('config', machine.name)
        .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
        .then((config) => docker(config.concat(['run', '--name=cadvisor-' + machine.name, '-d',
            '-p', '1111:1111',
            "-v", "/:/rootfs:ro",
            "-v", "/var/run:/var/run:rw",
            "-v", "/sys:/sys:ro",
            "-v", "/var/lib/docker/:/var/lib/docker:ro",
            'google/cadvisor:latest', '--port=1111'])))
    ))
);
//
// let alertManager = managerNodePromise.then(manager => {
//     dockerMachineRaw(['scp', '-r', './alerts', `${config.manager.name}:/tmp/alerts`])
//         .then(() => dockerMachine('config', config.manager.name))
//         .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
//         .then((config) => docker(config.concat(['run', '-d', '-p', '9093:9093',
//             "-v", "/tmp/alerts:/etc/alertmanager", 'prom/alertmanager', '-config.file=/etc/alertmanager/alertmanager.conf'])))
//         .catch(err => Promise.resolve());//try process
// });
//
let prometheusPromise = cAdvisorsPromise.then(() => Promise.all(config.agents.concat([config.manager]).map(machine => dockerMachine("ip", machine.name))))
        .then(ips => Promise.all(ips.map((ip => "'" + ip.replace('\n', ':1111') + "'"))))
        .then(t => prometheusUtils.customizePrometheusConfigFile((" [" + t + "]\n")))
        .then(() => dockerMachineRaw(['scp', '-r', './monitoring', `${config.manager.name}:/tmp/monitoring/`]))
        // .then(() => dockerMachineSSHRaw('sudo cp -r /tmp/prometheus /etc/prometheus', config.manager.name))
        .then(() => dockerMachine('ip', config.manager.name))
        .then(ip => 'http://' + ip.replace("\n", "") +':9093')
        .then(url => dockerMachineSSHRaw('docker run --name=prometheus -d -p 9090:9090 -v /tmp/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus'
        // -alertmanager.url=http://' + url,
            , config.manager.name))
        .catch(error => console.log(error));

let grafanaPromise = managerNodePromise
    .then(() => dockerMachine('config', config.manager.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
        // default credentials admin / admin
        // More info at https://prometheu s.io/docs/visualization/grafana/
    .then((config) => docker(config.concat(['run', '--name', 'graphana', '-d', '-p', '3000:3000',
            "-v", "/var/lib/grafana:/var/lib/grafana", 'grafana/grafana:develop'])))
    .then(prometheusUtils.delayPromise(5000));

let managerIpPromise = managerNodePromise
    .then(() => dockerMachine("ip", config.manager.name))
    .then(ip => ip.replace("\n", ""));

let keyTokenPromise = Promise.all([managerIpPromise, grafanaPromise])
    .then(promises => {
        let options = {
            'method': 'POST',
            'uri': "http://admin:admin@" + promises[0] + ":3000/api/auth/keys",
            'headers': {
                "Content-Type": "application/json",
            },
            'body': {
                "name":"Grafana API",
                "role": "Admin"
            },
            'json': true
        };
        return rp(options)
    })
    .then(response => response.key);

Promise.all([managerIpPromise, keyTokenPromise])
    .then(promises => {
        let options = {
            'method': 'POST',
            'uri': "http://" + promises[0] + ":3000/api/datasources",
            'headers': {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + promises[1]
            },
            'body': {
                "id": 1,
                "orgId": 1,
                "name": "DS_PROMETHEUS",
                "type": "prometheus",
                "url":  'http://' + promises[0] + ":9090",
                "access": "proxy",
                "idDefault": true,
                "basicAuth": false,
                "password": "",
                "user": "",
                "database": "",
                "basicAuthUser": "",
                "basicAuthPassword": "",
                "jsonData": null
            },
            'json': true
        };
        return rp(options)
    });

let grafanDashboardPromise = Promise.all([managerIpPromise, keyTokenPromise, prometheusUtils.getGrafanaDashboard()])
    .then((promises) => {
        let options = {
            'method': 'POST',
            'uri': "http://" + promises[0] + ":3000/api/dashboards/db",
            'headers': {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + promises[1]
            },
            'body': {
                'dashboard': promises[2]
            },
            'json': true};
        return rp(options)
    });


// grafanDashboardPromise.then(() =>
//     Promise.all((config.agents).map(machine =>
//         dockerMachine('config', machine.name)
//             .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
//             .then((config) => ([1]).map(id =>
//                 docker(config.concat(['run', '--name=molecular-dynamics-' + machine.name, '-d', 'blost/molecular:latest']))))))
    // )


// let prometheusPromise = cAdvisorsPromise.then(() => Promise.all(config.agents.concat([config.manager]).map(machine => dockerMachine("ip", machine.name))))
//     new Promise(function (resolve, reject) {
//         return resolve(['40.68.162.23\n', '13.93.93.81\n'])
//     })
//     .then(ips => Promise.all(ips.map((ip => "'" + ip.replace('\n', ':1111') + "'"))))
//     .then(t => prometheusUtils.customizePrometheusConfigFile((" [" + t + "]\n")))
//     .then(() => dockerMachineRaw(['scp', '-r', './monitoring', `${config.manager.name}:/tmp/monitoring/`]))
//     // .then(() => dockerMachineSSHRaw('sudo cp -r /tmp/prometheus /etc/prometheus', config.manager.name))
//     .then(() => dockerMachine('ip', config.manager.name))
//     .then(ip => 'http://' + ip.replace("\n", "") +':9093')
//     .then(url => dockerMachineSSHRaw('docker run --name=prometheus -d -p 9090:9090 -v /tmp/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus'
//         // -alertmanager.url=http://' + url,
//         , config.manager.name))
//     .catch(error => console.log(error));
