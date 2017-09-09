'use strict';
const spawn = require('./../utils/promisifiedSpawn');

module.exports = function docker(commands, machine) {
    return spawn('docker', commands, {
        stdio: [
            0, // Use parents stdin for child
            'pipe', // Pipe child's stdout to parent
            'pipe'
        ]
    }, machine)

}