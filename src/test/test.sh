#!/usr/bin/env bash
echo "connecting to docker-machine..."
eval $(docker-machine env default)
echo "building containers..."
docker-compose -p ci build --no-cache
echo "creating containers..."
docker-compose -p ci up -d
