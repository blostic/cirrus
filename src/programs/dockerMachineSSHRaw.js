'use strict';
const spawn = require('./../utils/promisifiedSpawn');

module.exports = function dockerMachineSSH(commands, machine) {
    return spawn('docker-machine', ["ssh", machine, commands], {
        stdio: [
            0, // Use parents stdin for child
            'pipe', // Pipe child's stdout to parent
            'pipe'
        ]
    }, machine)

};