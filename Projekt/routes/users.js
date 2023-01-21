// username
// password
// age
// e-mail
// address
// phone_number
// [game_id's] (Favourites)

const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');
const session = driver.session();

router.get('/', async(req, res) => {
    res.send("Working")
})



module.exports = router;