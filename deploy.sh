#!/bin/bash
APPLICATION_NAME=react-intro

CONTAINER_ID=$(docker ps | grep react-intro | awk '{print $1}')

if [ $CONTAINER_ID ]
then
  docker stop $CONTAINER_ID
  docker rm $CONTAINER_ID
fi

cd /home/ec2-user/build

# GitHub Actions에서 rsync된 dist 폴더 복사
if [ ! -d "/home/ec2-user/react-dist" ]; then
  echo "Error: dist folder not found! GitHub Actions should rsync it first."
  exit 1
fi

echo "Copying dist folder from /home/ec2-user/react-dist..."
cp -r /home/ec2-user/react-dist /home/ec2-user/build/dist

echo "dist folder ready, proceeding with deployment..."

docker-compose -f /home/ec2-user/build/production.yml build --no-cache
docker-compose -f /home/ec2-user/build/production.yml up -d
