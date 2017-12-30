# watch-flights
Simple [incomplete] node.js example of using MongoDB change streams for monitoring flight inventory in real-time as it changes in the database.

This only handles the following cases, for 1 seat
* Finding initial flights available
* Showing flights added (inserted)
* Showing any inventory made available for the initial flight results
* Noting a flight needs to be deleted if any initial flights get full

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

# Create Replica Set

1. Run create script

```
sh scripts/start-replica.sh
```
This will launch mongod running on localhost ports 27018, 27019, and 27020.

2. Run replica init script

```
sh scripts/create-replica.sh
```

This will connect to one instance running locally and initialize the replica set `watchflights`.

# Stop Replica Set

If you need to stop the replica set for any reason, use the following:

```
sh scripts/stop-replica.sh
```


