// comment_id
// user_id (Written_by)
// text
// score
// game_id (Rates)


const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');
const session = driver.session();



module.exports = router;