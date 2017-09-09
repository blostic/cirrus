'use strict';
const spawn = require('./../utils/promisifiedSpawn');

module.exports = function dockerMachine(action, machine, options) {
    let args = [action];
    for (let key in options) {
        if (Array.isArray(options[key])) {
            options[key].forEach(option => {
                args.push(`--${key}`);
                args.push(option)
            })
        } else if (options[key] !== '') {
            args.push(`--${key}`);
            args.push(options[key])
        } else {
            args.push(`--${key}`);
        }
    }
    args.push(machine);
    console.log(args)
    return spawn('docker-machine', args, {
        stdio: [
            0, // Use parents stdin for child
            'pipe', // Pipe child's stdout to parent
            'pipe'
        ]
    }, machine)




}