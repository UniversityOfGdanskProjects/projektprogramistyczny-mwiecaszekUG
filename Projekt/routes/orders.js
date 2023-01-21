// order_id
// user_id (Ordered_By)
// [games_id's] (In_Order)
// cost
// payment_method
// status
// discount
// expected_delivery


const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');
const session = driver.session();



module.exports = router;