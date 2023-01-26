const express = require('express');
const app = express();
const users = require('./routes/users');
const games = require('./routes/games');
const orders = require('./routes/orders');
const comments = require('./routes/comments');
require('dotenv').config();

app.use(express.json());

try {
  require('./config/neo4jDriver');
  app.use('/users', users);  
  app.use('/games', games);
  app.use('/orders', orders);
  app.use('/comments', comments);  

  console.log(`Connected to Neo4J.`)
  const port = process.env.PORT || 5000
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
} catch(ex) {
  console.error('Error connecting to Neo4J', ex);

}