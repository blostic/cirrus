const dockerMachine = require('../programs/dockerMachine');
const genericProvider = require('./generic');

module.exports = function(config) {
    const queue = [];
    return Object.assign(
        genericProvider(),
        {
            create(machineName, additionalInstanceOptions, additionalOptions) {
                return dockerMachine('create', machineName, Object.assign({
                        'driver': 'google',
                        'google-project': config.projectId,
                        'google-zone': config.region || 'europe-west1-b',
                        'google-machine-image': 'https://www.googleapis.com/compute/v1/projects/ubuntu-os-cloud/global/images/ubuntu-1704-zesty-v20170811',
                        'google-machine-type':  additionalInstanceOptions.size //config.instanceType || 't2.micro'
                    },
                    additionalOptions)
                )
            }
        });

}