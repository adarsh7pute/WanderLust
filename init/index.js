//Local Host initiallization
const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const initData = require("./data.js");

main().then(()=>{
    console.log('connected to Db');
}).catch(err => console.log(err));

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data= initData.data.map((obj) => ({...obj,owner: '686024dfcc9082b676e5f252'}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

// initDB();


//Mongo Atlas Intialization
    const { MongoClient } = require('mongodb');
   const {sampleListings:sampleListings} = require('./data.js'); // Ensure this imports the array correctly

   // Check if sampleListings is an array
   if (!Array.isArray(sampleListings)) {
     throw new Error('sampleListings is not an array');
   }

   // Add the owner field to each listing
   const ownerId = '686024dfcc9082b676e5f252';
   const listingsWithOwner = sampleListings.map(listing => ({
     ...listing,
     owner: ownerId,
   }));

   async function run() {
     const uri = 'mongodb+srv://adarshsatpute2608:Adarsh7pute@cluster0.bw6at8n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB connection string
     const client = new MongoClient(uri);
     try {
       await client.connect();
       const database = client.db('test'); // Replace with your database name
       const collection = database.collection('listings'); // Replace with your collection name
       // Insert the listings into the collection
       const result = await collection.insertMany(listingsWithOwner);
       console.log(`${result.insertedCount} listings were inserted.`);
     } finally {
       await client.close();
     }
   }

   run().catch(console.dir);
   



