module.exports = {
    getJoinSwarmCommandFromString: function (swarmInitString){
        return swarmInitString.match(/docker swarm join .*/)[0];
    }
};
