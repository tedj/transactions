#!/usr/bin/env bash
echo "connecting to docker-machine..."
eval $(docker-machine env default)
cleanup () {
  docker-compose -p ci kill
  docker-compose -p ci rm -f
}
echo "cleaning test docker containers..."
cleanup
echo "building containers..."
docker-compose -p ci build --no-cache
echo "creating containers..."
docker-compose -p ci up -d
