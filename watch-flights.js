
//GLOBAL CONSTANTS

// Connection URL
// const url = 'mongodb://localhost:27017';
const url = process.env.MONGODBURL;

// Database Name
const dbName = 'airlines';
const collName = 'flightInventory';
const origin = 'TUS';
const dest = 'DEN';
const date = "2018-01-28"

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

//find all flights between the origin and dest on this date whether there is inventory or not
const findFlights = function(coll, origin, dest, date, callback) {
  // Find flights with inventory
  coll.find({Origin: origin, Dest: dest, FlightDate: date}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs);
    callback(docs);
  });
}


const watchFlights = function(coll, origin, dest, date, curFlightResults, callback) {

	watchNewFlights(coll, origin, dest, date);		//we want to see any flights added with availability
	watchInventoryChanges(coll, curFlightResults);	//listen for inventory changes on our current flight results
}

//watch for new flights added
const watchNewFlights = function(coll, origin, dest, date, callback) {

	const [dbName,collName] = coll.namespace.split(".");

	const pipeline = [
		{$match:
			{
				"operationType": "insert",
				ns: {db: dbName, coll: collName},
				"fullDocument.Origin": origin,
				"fullDocument.Dest": dest,
				"fullDocument.FlightDate": date,
				"fullDocument.seatsAvail": {$gt: 0}
			}
		}
	];
	const changeStream = coll.watch(pipeline);

	changeStream.on("change", function(newFlight) {
		console.log(newFlight);
	});
}

//watch for inventory added on already existing flights
const watchInventoryChanges = function(coll, curFlightResults, callback) {

	//loop through results and build a list of _ids for those with 0 inventory and another list of those with positive inventory
	var unavailList = new Array();
	var availList = new Array();

	for (i=0; i<curFlightResults.length; i++) {
		flight = curFlightResults[i];
		if (flight.seatsAvail == 0) {
			unavailList.push(flight._id);
		} else {
			availList.push(flight._id);
		}
	}

	watchNewInventory(coll, unavailList);
	watchRemovedInventory(coll, availList);
}

const watchNewInventory = function(coll, unavailList, callback) {

	const [dbName,collName] = coll.namespace.split(".");

	//watch flights that free up inventory
	const pipeline = [
		{$match:
			{
				"operationType": "replace",			//could also look for 'update' for individual field changes
				ns: {db: dbName, coll: collName},
				"documentKey._id": {$in: unavailList},
				"fullDocument.seatsAvail": {$gt: 0}
			}
		}
	];
	const changeStream = coll.watch(pipeline, {fullDocument: "updateLookup"});

	changeStream.on("change", function(addedSeats) {
		console.log(addedSeats);
	});
}

const watchRemovedInventory = function(coll, unavailList, callback) {

	const [dbName,collName] = coll.namespace.split(".");

	//watch flights whose seats fill up
	const pipeline = [
		{$match:
			{
				"operationType": "replace",			//could also look for 'update' for individual field changes
				ns: {db: dbName, coll: collName},
				"documentKey._id": {$in: unavailList},
				"fullDocument.seatsAvail": 0
			}
		},
		{$project:
			{
				"documentKey._id": 1
			}
		}
	];
	const changeStream = coll.watch(pipeline, {fullDocument: "updateLookup"});

	changeStream.on("change", function(removedSeats) {
		console.log("Delete these IDs:");
		console.log(removedSeats);
	});
}

// Connect to server and get handle for DB
MongoClient.connect(url, function(err, client) {
	assert.equal(null, err);
  	console.log("Connected successfully to server");

  	const db = client.db(dbName);
  	const coll = db.collection(collName);

	findFlights(coll, origin, dest, date, function(results) {
		watchFlights(coll, origin, dest, date, results);
		assert.equal(err, null);
	});
  }
);
