const dockerMachine = require('../programs/dockerMachine');
const genericProvider = require('./generic');

module.exports = function(config) {
    const queue = [];
    return Object.assign(
        genericProvider(),
        {
            create(machineName, additionalInstanceOptions, additionalOptions) {
                return dockerMachine('create', machineName, Object.assign({
                        'driver': 'azure',
                        'azure-subscription-id': config.subscriptionId,
                        'azure-location': 'westeurope',
                        'azure-size':  additionalInstanceOptions.size //config.instanceType || 't2.micro'
                    },
                    additionalOptions)
                )
            }
        });

}