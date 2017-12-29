# watch-flights
Simple [incomplete] node.js example of using MongoDB change streams for monitoring flight inventory in real-time as it changes in the database.

This only handles the following cases, for 1 seat
* Finding initial flights available
* Showing flights added (inserted)
* Showing any inventory made available for the initial flight results
* Noting a flight needs to be deleted if any initial flights get full

This assumes you have a MongoDB running in a replica set (can still be one node) on localhost on the default port 27017, or otherwise you can change the constants in the beginning of watch-flights.js.

To start a mongod, you can create a directory for the data such as /data and then use this command
```
mongod --replSet "rs0" --dbpath=/data
```

More details on: [running MongoDB in a replica set](https://docs.mongodb.com/manual/tutorial/deploy-replica-set/)

It uses a few example documents in the dump directory, which you can import with a command like
```
cd watch-flights
mongorestore
```

