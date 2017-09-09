const dockerMachine = require('../programs/dockerMachine');

module.exports = function() {
    return {
        create(machineName) {
            throw new Error('Cannont create generic machine. Please extend for proper provider')
        },

        remove(machineName) {
            return dockerMachine('rm', machineName, {
                y: ''
            })
        },

        start(machineName) {
            return dockerMachine('start', machineName, {})
        },

        stop(machineName) {
            return dockerMachine('stop', machineName, {})
        },

        restart(machineName) {
            return dockerMachine('restart', machineName, {})
        },

        showStatus(machineName) {
            return dockerMachine('status', machineName, {})
        },

        showInfo(machineName) {
            return dockerMachine('inspect', machineName, {})
        }
    }
};