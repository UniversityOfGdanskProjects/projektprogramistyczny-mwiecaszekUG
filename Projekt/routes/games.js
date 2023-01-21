

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
            const scores = result.comments.map(x => {
                x.score
            })
            const score = scores.reduce((a, b) => a + b , 0) / scores.length
            games.push({"id": id, ...result, "score": score})
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
            
            const scores = game.comments.map(x => {
                x.score
            })
            const score = scores.reduce((a, b) => a + b , 0) / scores.length
            result = {"id": id, ...game, "score": score}
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
            comments: [] })`)
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

// zwracanie score jako avg
//

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