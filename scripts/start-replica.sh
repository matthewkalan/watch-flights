#!/bin/sh
mkdir ./data-1 ./data-2 ./data-3
mkdir logs
mongod --port 27020 --dbpath ./data-1 --smallfiles --replSet watchflights --fork --logpath logs/mongodb-1.log
mongod --port 27018 --dbpath ./data-2 --smallfiles --replSet watchflights --fork --logpath logs/mongodb-2.log
mongod --port 27019 --dbpath ./data-3 --smallfiles --replSet watchflights --fork --logpath logs/mongodb-3.log
