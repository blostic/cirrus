FROM ubuntu:14.04
MAINTAINER Piotr Skibiak <piotr.skibiak@gmail.com>

### update repository

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN apt-get install -y wget

### installing gcc
RUN sudo add-apt-repository -y ppa:ubuntu-toolchain-r/test
RUN sudo apt-get update
RUN sudo apt-get install -y gcc-4.9

### install build-essential
RUN sudo apt-get install -y build-essential

### install rabbilmq and redis server
RUN apt-get install -y rabbitmq-server redis-server

### install nodejs
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install -y nodejs

### create ubuntu home
RUN mkdir /home/ubuntu

### install Hyperflow
WORKDIR /home/ubuntu
RUN wget https://github.com/dice-cyfronet/hyperflow/archive/1.0.0.tar.gz
RUN tar zxvf 1.0.0.tar.gz
RUN mv hyperflow-1.0.0 hyperflow
WORKDIR /home/ubuntu/hyperflow
RUN npm install
ENV PATH=$PATH:/home/ubuntu/hyperflow/bin

### download MD_v4_OMP file and unpack
WORKDIR /home/ubuntu
RUN wget https://dl.dropboxusercontent.com/s/alho0mwrg4dg45b/MD_v4_OMP.tar.gz
RUN tar zxvf MD_v4_OMP.tar.gz

### compile donloaded file 
WORKDIR /home/ubuntu/MD_v4_OMP/src
RUN make TARGET=RELEASE OMP=1 ARCH=CPU COMPILER=gcc && cp CMD_CPU main

### copy scripts 
RUN mkdir /home/ubuntu/MolecularDynamicsParameterStudy
WORKDIR /home/ubuntu/MolecularDynamicsParameterStudy

ADD MolecularDynamicsParameterStudy .

RUN cp -r /home/ubuntu/hyperflow/node_modules/ /home/ubuntu/MolecularDynamicsParameterStudy
RUN cp /home/ubuntu/MD_v4_OMP/src/main /home/ubuntu/MolecularDynamicsParameterStudy
RUN cp /home/ubuntu/MD_v4_OMP/pov-template.inc /home/ubuntu/MolecularDynamicsParameterStudy

### RUN Moleculer Dynamics Generator
WORKDIR /home/ubuntu/MolecularDynamicsParameterStudy
RUN node md_dag_generator.js 600 0.5 0.6 0.1 > md_2.json

RUN apt-get install -y nano

