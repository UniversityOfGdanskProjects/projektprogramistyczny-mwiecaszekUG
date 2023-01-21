

const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');
const session = driver.session();

router.get('/', async(req, res) => {
    const session = driver.session();
    const games = []
    await session
    .run(`MATCH (n:Game) RETURN n`)
    .subscribe({
        onNext: async record => {
            const result = await record.get('n').properties
            const id = await record.get('n').elementId
            let score = 0
            if (result.scores) {
                score = result.scores.reduce((a, b) => parseInt(a) + parseInt(b) , 0) / result.scores.length

            } else {
                score = 0
            }
            delete result.scores
            games.push({"id": id, ...result, "score": String(score)})
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
    await session
      .run(`MATCH (n:Game) where id(n) = ${req.params.id} RETURN n`)
      .subscribe({
        onNext: async record => {
            const game = await record.get('n').properties
            const id = await record.get('n').elementId
            let score = 0
            if (game.scores) {
                score = game.scores.reduce((a, b) => parseInt(a) + parseInt(b) , 0) / game.scores.length

            } else {
                score = 0
            }
            delete game.scores
            result = {"id": id, ...game, "score": String(score)}
        },
        onCompleted: () => {
          session.close();      
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
            release_year: "${game.release_year}",
            scores: [] })`)
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
        SET n.release_year = "${game.release_year}"`)
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


// sortowanie/filtrowanie przy get

// game_id
// title
// image_url
// developer
// category
// age_restricted
// description
// release_year
// comments (z powiązanych comments)


module.exports = router;