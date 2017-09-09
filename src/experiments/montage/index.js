const config = require('./config');
const provider = require('./../../Provider')(config.providers);
const docker = require('./../../programs/docker');
const dockerMachine = require('./../../programs/dockerMachine');
const dockerMachineRaw = require('./../../programs/dockerMachineRaw');
const prometheusUtils = require('./../../utils/prometheusUtils');

provider(config.manager.provider)
//create machine with docker for consul
    .create(config.manager.name)
    //run consul container
    .then(() => dockerMachine('config', config.manager.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then((config) => docker(config.concat(['run', '-d', '-p', '8500:8500', '-h', 'consul',
        'progrium/consul', '-server', '-bootstrap'])))
    .then(() => dockerMachineRaw(['scp', '-r', './monitoring', `${config.manager.name}:/`]))
    .then(() => dockerMachine('config', config.manager.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then((config) => docker(config.concat(['run', '-d', '-p', '9093:9093',
        "-v", "/monitoring:/alertmanager", 'prom/alertmanager', '-config.file=/alertmanager/alertmanager.conf'])))
    .catch(err => Promise.resolve()) //try process
    //create machine with swarm master
    .then(() => dockerMachine('ip', config.manager.name))
    .then(discoveryServiceIp => provider(config.swarmMaster.provider)
        .create(config.swarmMaster.name, {
            'swarm-master': '',
            'swarm': '',
            'swarm-discovery': `consul://${discoveryServiceIp.slice(0,-1)}:8500`,
            'engine-opt': [`cluster-advertise=${config.providers[config.swarmMaster.provider].publicNetworkInterface}:2376`,
                `cluster-store=consul://${discoveryServiceIp.slice(0,-1)}:8500`]
        })
    )
    .catch(errorCode => Promise.resolve()) //try process
    //create machines with swarm agents
    .then(() => dockerMachine('ip', config.manager.name))
    .then((discoveryServiceIp) => Promise.all(
        config.agents.map(machine => provider(machine.provider)
            .create(machine.name, {
                'swarm': '',
                'swarm-discovery': `consul://${discoveryServiceIp.slice(0,-1)}:8500`,
                'engine-opt': [`cluster-advertise=${config.providers[machine.provider].publicNetworkInterface}:2376`,
                    `cluster-store=consul://${discoveryServiceIp.slice(0,- 1)}:8500`]
            })
            //run monitoring cAdvisor on each node
            .then(() => dockerMachine('config', machine.name))
            .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
            .then((config) => docker(config.concat(['run', '--name=cadvisor' + machine.name, '-d', '-p', '1111:1111',
                "-v", "/var/run:/var/run:rw", "-v", "/sys:/sys:ro", "-v", "/var/lib/docker/:/var/lib/docker:ro",
                'google/cadvisor:latest', '--port=1111'])))
        ))
    )
    ////create overlay network on swarm master
    .catch(errorCode => Promise.resolve()) //try process
    .then(() => dockerMachine('config', config.swarmMaster.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then((config) => docker(config.concat(['network', 'create', '--driver', 'overlay', '--subnet', '12.0.9.0/24',
        'nodewrapper_default'])))
    .catch(() => Promise.resolve()) //try process
    .then(() => Promise.all(
        config.agents.map(machine =>
            dockerMachine('ip', machine.name)
                .then(machineIp => '\'' + machineIp.slice(0,-1) + ':1111' + '\'')
        )
    ))
    ////append prometheus config file
    .then((cAdvistorIPs) => prometheusUtils.customizePrometheusConfigFile( ' [' + cAdvistorIPs + ']'))
//    //run prometheus
    .then(() => {dockerMachineRaw(['scp', '-r', './monitoring', `${config.manager.name}:/`])})
    //.catch(() => Promise.resolve()) //try process
    .then(() => dockerMachine('config', config.manager.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    .then(dockerConf => dockerMachine('ip', config.manager.name)
        .then(ip => docker(dockerConf.concat(['run', '-d', '-p', '9090:9090',
            '-v', '/monitoring:/etc/prometheus',
            'prom/prometheus', '-config.file=/etc/prometheus/prometheus.yml',
            '-alertmanager.url=http://' + ip.slice(0,-1) +':9093']))
        )
    )
    .then(() => dockerMachine('config', config.manager.name))
    .then(rawConfiguration => Promise.resolve(rawConfiguration.slice(0,-1).split('\n')))
    // default credentials admin / admin
    // More info at https://prometheus.io/docs/visualization/grafana/
    .then((config) => docker(config.concat(['run', '-d', '-p', '3000:3000',
        "-v", "/var/lib/grafana:/var/lib/grafana", 'grafana/grafana:develop'])))
    .catch(err => Promise.resolve()) //try process
    .then(() => console.log("Configuration finished"));
