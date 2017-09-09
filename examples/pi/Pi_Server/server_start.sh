docker network create pi
docker run -itd --net=pi --name server pi_server java -jar Pi_server.jar