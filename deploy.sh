#!/bin/bash
APPLICATION_NAME=react-intro

CONTAINER_ID=$(docker ps | grep react-intro | awk '{print $1}')

if [ $CONTAINER_ID ]
then
  docker stop $CONTAINER_ID
  docker rm $CONTAINER_ID
fi

cd /home/ec2-user/build
sudo docker-compose -f /home/ec2-user/build/production.yml up -d --build
