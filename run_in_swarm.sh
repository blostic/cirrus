### RESTART DEFAULT NODE
# docker-machine stop default
# docker-machine start default

### RUN LOCALLY
# docker-machine create -d virtualbox manager
# docker-machine create -d virtualbox agent1
# docker-machine create -d virtualbox agent2

### RUN ON DIGITALOCEAN
# docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxxx manager
# docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxxx agent1
# docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxxx agent2

### CREATE SWAARM AND SWARM MANAGER
# eval $(docker-machine env manager)
# export SWARM_TOKEN=$(docker run --rm swarm create)
# docker run -d -p 3376:3376 -t -v /var/lib/boot2docker:/certs:ro swarm manage -H 0.0.0.0:3376 --tlsverify --tlscacert=/certs/ca.pem --tlscert=/certs/server.pem --tlskey=/certs/server-key.pem token://$SWARM_TOKEN

### JOIN NODE1 TO SWARM
# eval $(docker-machine env agent1)
# docker run -d swarm join --addr=$(docker-machine ip agent1):2376 token://$SWARM_TOKEN

### JOIN NODE2 TO SWARM
# eval $(docker-machine env agent2)
# docker run -d swarm join --addr=$(docker-machine ip agent2):2376 token://$SWARM_TOKEN

### RUN CONTAINERS ON EACH agent1 AND agent2
# docker run -P -p 9990:9990 -e constraint:node==agent1 blost/pi_server java -jar Pi_server.jar
# docker run -P -e constraint:node==agent2 blost/pi_client java -jar Pi_client.jar $(docker-machine ip agent1)

########################## NEW-WORKING-STARTING-SCRIPT ##########################  
export SWARM_TOKEN=$(docker run --rm swarm create)

docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxxx --swarm --swarm-master --swarm-discovery token://$SWARM_TOKEN --engine-label public=no master
docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxxx --swarm --swarm-discovery token://$SWARM_TOKEN --engine-label public=yes agent1
docker-machine create --driver digitalocean --digitalocean-region ams2 --digitalocean-access-token xxxxxx --swarm --swarm-discovery token://$SWARM_TOKEN --engine-label public=yes agent1

eval $(docker-machine env --swarm master)
docker run -P -p 9990:9990 -e constraint:node==agent1 blost/pi_server java -jar Pi_server.jar
docker run -P -e constraint:node==agent2 blost/pi_client java -jar Pi_client.jar $(docker-machine ip agent1)
