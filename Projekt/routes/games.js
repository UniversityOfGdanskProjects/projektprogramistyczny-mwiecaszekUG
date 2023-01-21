// game_id
// title
// developer
// category
// age_restricted
// description
// release_year
// score (AVG z powiązanych comments)

const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');
const session = driver.session();



module.exports = router;