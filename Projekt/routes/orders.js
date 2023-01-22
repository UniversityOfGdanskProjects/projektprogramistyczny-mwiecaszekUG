
const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');

router.get('/', async(req, res) => {
    const session = driver.session();
    const orders = []
    await session
    .run(`MATCH (n:Order) RETURN n`)
    .subscribe({
        onNext: async record => {
            const result = await record.get('n').properties
            const id = await record.get('n').elementId
            orders.push({"id": id, ...result})
        },
        onCompleted: () => {
            session.close()
            res.send({"orders": orders})
        },
        onError: error => {
            console.log(error);
            res.send("Sth went wrong")
        }
    })
});

router.get('/:id', async (req, res) => {
    const session = driver.session();
    let result = "Not found"
    await session
      .run(`MATCH (n:Order) where id(n) = ${req.params.id} RETURN n`)
      .subscribe({
        onNext: async record => {
            const order = await record.get('n').properties
            const id = await record.get('n').elementId
            result = {"id": id, ...order}
        },
        onCompleted: () => {
          session.close();      
          res.send({"order": result});
        },
        onError: error => {
          console.log(error)
        },
      })  
  });


  router.get('/for/:game_id', async (req, res) => {
    const session = driver.session();
    let orders = []
    await session
      .run(`MATCH (n:Order)-[r:ORDER_FOR]->(g:Game) where id(g) = ${req.params.game_id} RETURN n`)
      .subscribe({
        onNext: async record => {
            const order = await record.get('n').properties
            const id = await record.get('n').elementId
            orders.push({"id": id, ...order})
        },
        onCompleted: () => {
          session.close();      
          res.send({"orders": orders});
        },
        onError: error => {
          console.log(error)
        },
      })  
  });

  router.get('/of/:user_id', async (req, res) => {
    const session = driver.session();
    let orders = []
    await session
      .run(`MATCH (n:User)-[r:ORDER_BY]->(c:Order) where id(n) = ${req.params.user_id} RETURN c`)
      .subscribe({
        onNext: async record => {
            const order = await record.get('c').properties
            const id = await record.get('c').elementId
            orders.push({"id": id, ...order})
        },
        onCompleted: () => {
          session.close();      
          res.send({"orders": orders});
        },
        onError: error => {
          console.log(error)
        },
      })  
  });

  router.post('/for/:game_id/by/:user_id', async (req, res) => {
    const session = driver.session();
    const order = req.body
    await session
      .run(`MATCH (u:User), (g:Game)
            WHERE id(u) = ${req.params.user_id}
            AND id(g) = ${req.params.game_id}
            CREATE (u)-[:ORDER_BY]->(n:Order {payment_method: "${order.payment_method}",
            status: "${order.status}",
            discount: "${order.discount}",
            expected_delivery: "${order.expected_delivery}",
            delivery_method: "${order.delivery_method}",
            cost: "${order.cost}"})
            CREATE (n)-[:ORDER_FOR]->(g)`)
      .subscribe({
        onCompleted: () => {
          session.close();      
          res.send("success")
        },
        onError: error => {
          console.log(error)
          res.send(error)
        },
      })  
})

router.put('/:id', async (req, res) => {
    const session = driver.session();
    const order = req.body

    await session
      .run(`MATCH (n:Order) where id(n) = ${req.params.id} 
            SET n.payment_method = "${order.payment_method}"
            SET n.status = "${order.status}"
            SET n.discount = "${order.discount}"
            SET n.expected_delivery = "${order.expected_delivery}"
            SET n.delivery_method = "${order.delivery_method}"
            SET n.cost = "${order.cost}"
            `)
      .subscribe({
        onCompleted: () => {
          session.close();      
          res.send("success");
        },
        onError: error => {
          console.log(error)
        },
      })  
})

router.delete('/:id', async (req, res) => {
    const session = driver.session();
    await session
      .run(`MATCH (n:Order) where id(n) = ${req.params.id} 
            DETACH DELETE n`)
      .subscribe({
        onCompleted: () => {
          session.close();      
          res.send("success");
        },
        onError: error => {
          console.log(error)
        },
      })  

})

module.exports = router;