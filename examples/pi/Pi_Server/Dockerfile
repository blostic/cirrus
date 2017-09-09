FROM ubuntu:14.04
MAINTAINER Piotr Skibiak <piotr.skibiak@gmail.com>

### update repository

RUN apt-get update
RUN apt-get install -y software-properties-common

### installing java8

RUN add-apt-repository -y ppa:webupd8team/java
RUN apt-get update
RUN echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
RUN apt-get install -y oracle-java8-installer

### add jar

ADD Pi_server.jar .

EXPOSE 9990