/********************************************************************************
 * WEB422 – Assignment 2
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Nguyen Huu Linh Student ID: 118197227 Date: Jan 29, 2024
 *
 * Published URL: https://orange-red-giraffe-cape.cyclic.app/
 *
 ********************************************************************************/

// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const cors = require('cors');
const ListingsDB = require('./modules/listingsDB.js');

// Create an Express application
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Enable Cross-Origin Resource Sharing (CORS) and JSON body parsing for incoming requests
app.use(cors());
app.use(express.json());
// Serve static files located in the root folder
app.use(express.static(__dirname));
// Create an instance of the ListingsDB class
const db = new ListingsDB();

// Initialize database connection and start the server if successful
db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on: ${HTTP_PORT}`);
      console.log(`App listening at http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error(err); // Log errors if the database connection fails
  });

// Route for the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Route to add a new listing to the database
app.post('/api/listings', (req, res) => {
  db.addNewListing(req.body)
    .then((listing) => res.status(201).json(listing)) // Respond with 201 status code and the new listing
    .catch((err) => res.status(500).json({ error: err.message })); // Handle errors
});

// Route to get all listings with optional paging and name filtering
app.get('/api/listings', (req, res) => {
  const { page, perPage, name } = req.query;
  db.getAllListings(page, perPage, name)
    .then((listings) => res.json(listings)) // Respond with the array of listings
    .catch((err) => res.status(500).json({ error: err.message })); // Handle errors
});

// Route to get a specific listing by its ID
app.get('/api/listings/:id', (req, res) => {
  db.getListingById(req.params.id)
    .then((listing) => {
      if (listing) {
        res.json(listing); // Respond with the found listing
      } else {
        res.status(404).send('Listing not found'); // Respond with 404 if not found
      }
    })
    .catch((err) => res.status(500).json({ error: err.message })); // Handle errors
});

// Route to update a specific listing by its ID
app.put('/api/listings/:id', (req, res) => {
  db.updateListingById(req.body, req.params.id)
    .then((result) => {
      if (result.modifiedCount === 0) {
        res.status(404).send('Listing not found or data unchanged'); // Respond with 404 if not found or unchanged
      } else {
        res.status(204).send(); // Respond with 204 status code for successful update
      }
    })
    .catch((err) => res.status(500).json({ error: err.message })); // Handle errors
});

// Route to delete a specific listing by its ID
app.delete('/api/listings/:id', (req, res) => {
  db.deleteListingById(req.params.id)
    .then((result) => {
      if (result.deletedCount === 0) {
        res.status(404).send('Listing not found'); // Respond with 404 if not found
      } else {
        res.status(204).send(); // Respond with 204 status code for successful deletion
      }
    })
    .catch((err) => res.status(500).json({ error: err.message })); // Handle errors
});
