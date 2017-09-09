module.exports = {
    providers: {
        virtualbox: {},
        digitalocean: {
            apiToken: '',
            publicNetworkInterface: 'eth0'
        },
        aws: {
            accessKey: '',
            secretKey: '',
            publicNetworkInterface: 'eth0' //aws exposes only private interface, cant be mixed with other providers
        },
        azure: {
            subscriptionId: ""
        },
        google: {
            projectId: ""
        }
    },
    manager: {
        name: 'manager',
        provider: 'virtualbox'
    },
    swarmMaster: {
        name: 'swarm-master',
        provider: 'virtualbox'
    },
    agents: [

        // DigitalOcean
        // {
        //     name: 'swarm-agent-01',
        //     provider: 'digitalocean',
        //     size: '512mb'
        // },
        // {
        //     name: 'swarm-agent-02',
        //     provider: 'digitalocean',
        //     size: '4gb'
        // },
        // {
        //     name: 'swarm-agent-03',
        //     provider: 'digitalocean',
        //     size: '8gb'
        // },

        // AWS
        // {
        //     name: 'swarm-agent-01',
        //     provider: 'aws',
        //     size: 't2.nano'
        // },
        // {
        //     name: 'swarm-agent-02',
        //     provider: 'aws',
        //     size: 't2.medium'
        // },
        // {
        //     name: 'swarm-agent-03',
        //     provider: 'aws',
        //     size: 't2.xlarge'
        // }


        //AZURE
        //{
        //    name: 'swarm-agent-01',
        //    provider: 'azure',
        //    size: 'Standard_A0'
        //},
        //{
        //     name: 'swarm-agent-02',
        //     provider: 'azure',
        //     size: 'Standard_A2'
        // },
        // {
        //     name: 'swarm-agent-03',
        //     provider: 'azure',
        //     size: 'Standard_A3'
        // }

        //Gooogle
         {
             name: 'swarm-agent-01',
             provider: 'google',
             size: 'n1-standard-1'
         },
         {
             name: 'swarm-agent-02',
             provider: 'google',
             size: 'n1-standard-2'
         },
         {
             name: 'swarm-agent-03',
             provider: 'google',
             size: 'n1-standard-4'
         }
    ]
};
