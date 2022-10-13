/*
Adding this quickly a the top,I timed myself for an hour and 10 minutes making this, theres plenty of
bugs or things I would want to add that I never got fixing/implementing to due to wanting to
remain within the one hour(ish) time constraint.

Documented bugs:
1. randDomLat/Long do not produce coodinates with decimal point values due to the nature of using ints with random.
2. retrieveByDistance() does not properly print, or even from what I can tell save, the distances between the merchants into the distances array for printing.  I believe this is to due to my rusty-ness with javascript arrays when creating this.
3. There are definitely more but I'm writing this here right after the interview just so I can have down what I would've discussed in the interview if there was a bit more time to show this off.

How I'd improve the project:
1. I would'nt just be inserting random data, updating with random data and really I'd be trying to fully remove the randomness aspect entirely.  I had it in here for the sake of being able to interact with the database but didn't come back to it as I wanted to stay as close to the recommended time as possible. 
2. I'd get retrieveByDistance() working properly.
3. I would allow for command line inputs for creating, updating, finding(one) and deleting a merchant.  Could even do it on a html webpage if I find the time.
4. Obviously I'd also want to implement the extra-credit authentication.
*/

//=====================Database Connection=======================//
const { MongoClient, ServerApiVersion } = require('mongodb');
const url = "mongodb+srv://Harry_Keogh:Password@cluster0.vaehx8d.mongodb.net/?retryWrites=true&w=majority"; //The password is "Password", unsecure?  Yes, easy for you to understand?  Yes.
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const dbName = "API";

//=====================Information Generation====================//
//Will randomly create a Latitude.
function randomLat() { // min and max included 
    return Math.floor(Math.random() * (190) + 90) - 90;  //Latitudes range between +90 and -90, so this should produce an output within those bounds.
  }
//Will randomly create a Longitude.
function randomLong() { // min and max included 
    return Math.floor(Math.random() * (280) + 180) - 180;  //Longitudes range between +180 and -180, so this should produce an output within those bounds.
  }
//Will store various marchant names for picking out on creation.
var merchNames = ["Tesco", "Londis", "Aldi", "Lidl", "Morrisons", "River Island", "Trader Joe's", "Iceland"];
//Will hold the Merchant Details.
var merchantDetails = [];

//=====================Connection====================//
client.connect(err => { 

    const db = client.db(dbName);
    const merchants = db.collection("merchants");

    //==================Merchant creation===================//
    const insert = function(db, callback)
    {
        merchantDetails = [
            {latitude: randomLat(), longitude: randomLong(), merchantName: merchNames[Math.round(Math.random()*(merchNames.length-1))]},
            {latitude: randomLat(), longitude: randomLong(), merchantName: merchNames[Math.round(Math.random()*(merchNames.length-1))]},
            {latitude: randomLat(), longitude: randomLong(), merchantName: merchNames[Math.round(Math.random()*(merchNames.length-1))]},
            {latitude: randomLat(), longitude: randomLong(), merchantName: merchNames[Math.round(Math.random()*(merchNames.length-1))]},
            {latitude: randomLat(), longitude: randomLong(), merchantName: merchNames[Math.round(Math.random()*(merchNames.length-1))]},
            {latitude: randomLat(), longitude: randomLong(), merchantName: merchNames[Math.round(Math.random()*(merchNames.length-1))]}
          ];

        merchants.insertMany(merchantDetails, function(err, result) {
            if (err) throw err;
            console.log("Number of merchants inserted: " + result.insertedCount + "\n");
            callback(result);
            });
    }

    //===============Single Merchant retrieval=========================//
    const retreieveOne = function(db, callback)
    {
        merchants.find({}, {projection: { }}).toArray(function(err, result) 
        {
          if(err) throw err;
          console.log("Merchant details returned: ");
          //Logs to the console a merchant from within the range of the array consisting of result, allowing for searching within a constantly expanding database.
          console.log(result[Math.round(Math.random()*(result.length-1))]);  //Returns a single result.
          callback(result);
        });
    }

    //=========Merchant retrieval ordered by location to each other, using Haversine Formula==========//
    const retrieveByDistance = function(db, callback)
    {
      if(err) throw err;
      merchants.find({}, {projection: { }}).toArray(function(err, result) 
        {
          if(err) throw err;
          console.log("Merchant details returned in order of closest coordinate: ");
          var distances = [];
          distances[0] = [ {latitude: randomLat(), longitude: randomLong(), merchantName: merchNames[Math.round(Math.random()*(merchNames.length-1))]} ]; //Not held in the database but rather acts as an input in the code.
          let distance = 6372;
          //Logs to the console a merchant from within the range of the array consisting of result, allowing for searching within a constantly expanding database.
          for(let i = 0; i < result.length-1; i++)
          {
              for(let j = i+1; j < result.length-1; j++)
              {
                let dlat = result[j].latitude - distances[0].latitude;
                let dlon = result[j].longitude - distances[0].longitude;
                let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(distances[0].latitude) * Math.cos(result[j].latitude) * Math.pow(Math.sin(dlon / 2),2);
                let c = 2 * Math.asin(Math.sqrt(a));
                //Radius of earth in kilometers.
                let r = 6371;
          
                if(c*r < distance)
                {
                  distance = c*r;
                  distances.pop;  //Get rid of the old nearest coordinate.
                  distances.push = result[j]; //Add newest coordinate.
                }
              }
          }

          for(let i = 0; i < distances.length-1; i++)
          {
            if(distances[i] != undefined)
            {
              console.log(distances[i]);
            }
          }
          
          callback(result);
        });
    }

    //============Update a merchant================//
    const updateMerchant = function(db, callback)
    {
      if(err) throw err;
      //Randomly pick a merchant to change the cordinates of.
      var found = findMerchant(db, function(){});
      var merchantQuery = {merchant: found };
      var merchantAssign = { $set: {latitude: randomLat(), longitude: randomLong() } };

      	merchants.updateOne(merchantQuery, merchantAssign, function(err, result)
        {
          if(err) throw err;
          console.log("\n" + result.matchedCount + " merchant(s) updated" + "\n");
          callback(result);
        });
    }

    //===============Delete a merchant===============//
    const deleteMerchant = function(db, callback)
    {
        if(err) throw err;
        //Randomly pick a merchant to change the cordinates of.
        var found = findMerchant(db, function(){});
        var merchantQuery = {merchant: found };

        merchants.deleteOne(merchantQuery, function(err, result) {
      
          if (err) throw err;
          //Result is used to display if there has been a deletion.
          console.log("\n" + result.deletedCount + " merchant(s) deleted" + "\n");
          callback(result);
        });
    }

    //==============Extra find merchant=============//
    const findMerchant = function(db, callback) //Exists solely for update and delete to be able to have an existing merchant to update or delete.
    {
        merchants.find({}, {projection: { }}).toArray(function(err, result) 
        {
          if(err) throw err;
          callback(result[Math.round(Math.random()*(result.length-1))]);  //Provides just one merchant from the found list.
        });
    }

    //=================Function calls====================//
    //It looks so "nice".  Also, db.close() is faster than anything else so needs to be wrapped in a bunch of promises.
    insert(db, function() {
      retreieveOne(db, function(){
        retrieveByDistance(db, function(){
          updateMerchant(db, function(){
            deleteMerchant(db, function(){
              client.close();
            });
          });
        });
      });
    });

});

//========Notes===========//
/*
//Haversine formula
		double dlat = lati2 - lati1;
		double dlon = longi2 - longi1;
		double a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lati1) * Math.cos(lati2) * Math.pow(Math.sin(dlon / 2),2);
		double c = 2 * Math.asin(Math.sqrt(a));
		//Radius of earth in kilometers.
		double r = 6371;
		//Calculate the result
		return(c * r);	//In km.
    Used in a previous school project, putting this here for when I need to use it in this.
*/