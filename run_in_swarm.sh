### RESTART DEFAULT NODE
docker-machine stop default
docker-machine start default

### RUN LOCALLY
# docker-machine create -d virtualbox manager
# docker-machine create -d virtualbox agent1
# docker-machine create -d virtualbox agent2

### RUN ON DIGITALOCEAN
docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxx manager
docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxx agent1
docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxx agent2

### REGENERATE CERTS
eval "$(docker-machine env default)"
docker-machine regenerate-certs manager agent1 agent2

### CREATE SWAARM AND SWARM MANAGER
eval $(docker-machine env manager)
export SWARM_TOKEN=$(docker run --rm swarm create)
docker run -d -p 3376:3376 -t -v /var/lib/boot2docker:/certs:ro swarm manage -H 0.0.0.0:3376 --tlsverify --tlscacert=/certs/ca.pem --tlscert=/certs/server.pem --tlskey=/certs/server-key.pem token://$(SWARM_TOKEN)

### JOIN NODE1 TO SWARM
eval $(docker-machine env node1)
docker run -d swarm join --addr=$(docker-machine ip agent1):2376 token://$(SWARM_TOKEN)

### JOIN NODE2 TO SWARM
eval $(docker-machine env node2)
docker run -d swarm join --addr=$(docker-machine ip agent2):2376 token://$(SWARM_TOKEN)

### RUN CONTAINERS ON EACH agent1 AND agent2
docker tcp://$(docker-machine ip manager):3376 run -d -P -e constraint:node==agent1 blost/server java -jar
docker tcp://$(docker-machine ip manager):3376 run -d -P -e constraint:node==agent2 blost/client java -jar $(docker-machine ip agent1)
