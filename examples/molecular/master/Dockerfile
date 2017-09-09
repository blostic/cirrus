FROM ubuntu:16.04
MAINTAINER Piotr Skibiak <piotr.skibiak@gmail.com>

# update apt repository, install curl
RUN apt-get update && apt-get install -y \
	sudo \
	curl \
	build-essential \
	unzip

# install nodejs with latest npm
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash
RUN apt-get update && apt-get install -y nodejs
# RUN npm install npm@latest -g

# install and start Redis 
RUN apt-get update && apt-get install redis-server -y

# install rabitmq
# RUN apt-get install -y rabbitmq-server

# install hyperflow engine
RUN npm install https://github.com/hopped/hyperflow/archive/develop.tar.gz
ENV PATH=$PATH:/node_modules/hyperflow/bin/

# install hyperflow-amqp-executor
RUN apt-get update && apt-get install -y libxml2-dev libxslt-dev zlib1g-dev ruby ruby-dev
RUN gem install hyperflow-amqp-executor 
COPY ./config.yml.erb /etc/hyperflow-amqp-executor.yml
RUN chmod 777 /etc/hyperflow-amqp-executor.yml

# install povray
RUN apt-get update && apt-get install -y gcc gfortran p7zip-full gawk autoconf automake mencoder wget
RUN wget http://www.povray.org/redirect/www.povray.org/ftp/pub/povray/Old-Versions/Official-3.62/Unix/povray-3.6.tar.gz 
RUN mv povray-3.6.tar.gz /tmp/povray-3.6.tar.gz
WORKDIR /tmp
RUN tar zxv --no-same-owner --no-same-permissions -f /tmp/povray-3.6.tar.gz
WORKDIR /tmp/povray-3.6.1
RUN ./configure --prefix=/usr COMPILED_BY="Piotr Skibiak <piotr.skibiak@gmail.com>"
RUN make && make install

#install molecular-dynamics-openmp
RUN apt-get update && apt-get install -y git
RUN mkdir /MD_v4_OMP
WORKDIR /MD_v4_OMP
RUN git clone https://github.com/hopped/molecular-dynamics-simulation
RUN cd ./molecular-dynamics-simulation/src && make TARGET=RELEASE OMP=1 ARCH=CPU COMPILER=gcc && cp CMD_CPU main
WORKDIR /

RUN cp -r /node_modules/hyperflow/examples/MolecularDynamicsParameterStudy/ .
RUN mkdir /MolecularDynamicsParameterStudy/src
RUN cp /MD_v4_OMP/molecular-dynamics-simulation/src/main /MolecularDynamicsParameterStudy/src
RUN cp /MD_v4_OMP/molecular-dynamics-simulation/pov-template.inc /MolecularDynamicsParameterStudy

ADD ./kill-hflow.sh /MolecularDynamicsParameterStudy/kill-hflow.sh
ADD ./md_dag_generator_with_exit.js /MolecularDynamicsParameterStudy/md_dag_generator_with_exit.js
ADD ./mgr.json /MolecularDynamicsParameterStudy/mgr.json
RUN chmod 777 /MolecularDynamicsParameterStudy/kill-hflow.sh

# runing start script
COPY start.sh /start.sh
RUN chmod 777 /start.sh

ENTRYPOINT /start.sh

# # RUN Moleculer Dynamics Generator
# WORKDIR /home/ubuntu/MolecularDynamicsParameterStudy
# RUN node md_dag_generator.js 600 0.5 0.6 0.1 > md_2.json
