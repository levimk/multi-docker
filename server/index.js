const keys = require('./keys');

//Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express(); // Object that receives and responds to HTTP requests
app.use(cors()); // Allow requests from one domain (React app) to another (Express API)
app.use(bodyParser.json()); // Turn *body* of reqs into JSON

// Postgres client setup
//  Logic to get our Express app (above) to communicate with the
//  running Postgres server

// Create a pool of connections, allowing multiple clients to
// share connections with the DB -> optimised performance,
// Pool object takes care of connecting and deconnecting
const { Pool } = require('pg');

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})

// Create a table if it doesn't already exist when we connect to the DB
pgClient.on('connect', () => {
  pgClient 
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));
})

// Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000 // try reconnecting every 1000ms
});

// Redis JS API: if we have a client that is subscribing or publishing,
// that client *cannot* be used for other purposes so we MUST create a duplicate
const redisPublisher = redisClient.duplicate();


// Routes
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  })
});

app.post('/values', async (req, res) => {
  const index = req.body.index;
  console.log(`\n+========+\n\tindex=${index} to /values\n`);

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  // Not yet calculated a Fib value for this particular index
  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO  values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, err => {
  console.log('Listening');
})