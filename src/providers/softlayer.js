const dockerMachine = require('../programs/dockerMachine');
const genericProvider = require('./generic');

module.exports = function(config) {
    return Object.assign(
        genericProvider(),
        {
            create(machineName, additionalOptions) {
                    return dockerMachine('create', machineName, Object.assign({
                        'driver': 'softlayer',
                        'softlayer-hourly-billing': '',
                        'softlayer-api-key': config.apiKey,
                        'softlayer-user': config.user,
                        'softlayer-domain': 'cirrus.cli'
                    },
                    additionalOptions)
                )
            }
        });

}