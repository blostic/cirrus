module.exports = {
    providers: {
        aws: {
            accessKey: '',
            secretKey: '',
            region: 'eu-central-1',
            publicNetworkInterface: 'eth0' //aws exposes only private interface, cant be mixed with other providers
        },
        softlayer: {
            user: '',
            apiKey: '',
            publicNetworkInterface: 'eth1'
        },
        digitalocean: {
            apiToken: '',
            publicNetworkInterface: 'eth0'
        }
    },
    manager: {
        name: 'manager',
        provider: 'digitalocean'
    },
    swarmMaster: {
        name: 'swarm-master',
        provider: 'digitalocean'
    },
    agents: [
        {
            name: 'swarm-agent-01',
            provider: 'digitalocean'
        },
        {
            name: 'swarm-agent-02',
            provider: 'digitalocean'
        }
    ]
};