#!/usr/bin/env bash
echo "connecting to docker-machine..."
eval $(docker-machine env default)
echo "building..."
docker-compose build --no-cache
echo "running..."
docker-compose up