

const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');

router.get('/', async(req, res) => {
    const session = driver.session();
    const games = []
    await session
    .run(`MATCH (n:Game) RETURN n`)
    .subscribe({
        onNext: async record => {
            const result = await record.get('n').properties
            const id = await record.get('n').elementId
            games.push({"id": id, ...result,})
        },
        onCompleted: () => {
            session.close()
            res.send({"games": games})
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
    let score = []
    await session
      .run(`MATCH (n:Game) where id(n) = ${req.params.id}
      OPTIONAL MATCH (c:Comment)-[:RATES]->(n)
      RETURN n, c`)
      .subscribe({
        onNext: async record => {
            const game = await record.get('n').properties
            const id = await record.get('n').elementId
            if (record.get('c')) {
                score.push(record.get('c').properties.score)
            }
            result = {"id": id, ...game}
        },
        onCompleted: () => {
          session.close();      
          score = score.reduce((a, b) => parseInt(a) + parseInt(b) , 0) / score.length
          result = {...result, "score": score}
          res.send({"game": result});
        },
        onError: error => {
          console.log(error)
        },
      })  
  });

router.post('/create', async (req, res) => {
    const session = driver.session();
    const game = req.body
    await session
      .run(`CREATE (n:Game {title: "${game.title}",
            image_url: "${game.image_url}",
            developer: "${game.developer}",
            category: "${game.category}",
            age_restricted: "${game.age_restricted}",
            description: "${game.description}",
            release_year: "${game.release_year}"`)
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
    const game = req.body
    const session = driver.session();
        await session
      .run(`MATCH (n:Game) WHERE id(n)=${req.params.id}
        SET n.title = "${game.title}"
        SET n.image_url = "${game.image_url}"
        SET n.developer = "${game.developer}"
        SET n.category = "${game.category}"
        SET n.age_restricted = "${game.age_restricted}"
        SET n.description = "${game.description}"
        SET n.release_year = "${game.release_year}"
        SET n.price = "${game.price}"`)
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

router.delete('/:id', async (req, res) => {
    const session = driver.session();
    await session
    .run(`Match (n: Game) where id(n) = ${req.params.id}
    DETACH DELETE n`)
    return res.send("Deleted");
})

module.exports = router;