const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})

// sub = subcription
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index -1) +fib(index-2);
}

// Anytime a new message arrives...
sub.on('message', (channel, message) => {
  // Calculate that messaage's Fib then insert the result into
  // the hashset called "values", and associated with the key of 'message'
  redisClient.hset('values', message, fib(parseInt(message)))
});
sub.subscribe('insert'); // Reinsert that value into the Redis instance