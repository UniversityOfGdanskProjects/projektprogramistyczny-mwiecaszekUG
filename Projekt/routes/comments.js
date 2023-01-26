
const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');


router.get('/', async(req, res) => {
    const session = driver.session();
    const comments = []
    await session
    .run(`MATCH (n:Comment) RETURN n`)
    .subscribe({
        onNext: async record => {
            const result = await record.get('n').properties
            const id = await record.get('n').elementId
            comments.push({"id": id, ...result})
        },
        onCompleted: () => {
            session.close()
            res.send({"comments": comments})
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
      .run(`MATCH (n:Comment) where id(n) = ${req.params.id} RETURN n`)
      .subscribe({
        onNext: async record => {
            const comment = await record.get('n').properties
            const id = await record.get('n').elementId
            result = {"id": id, ...comment}
        },
        onCompleted: () => {
          session.close();      
          res.send({"comment": result});
        },
        onError: error => {
          console.log(error)
        },
      })  
  });


  router.get('/for/:game_id', async (req, res) => {
    const session = driver.session();
    let comments = []
    await session
      .run(`MATCH (n:Comment)-[r:RATES]->(g:Game) where id(g) = ${req.params.game_id} RETURN n`)
      .subscribe({
        onNext: async record => {
            const comment = await record.get('n').properties
            const id = await record.get('n').elementId
            comments.push({"id": id, ...comment})
        },
        onCompleted: () => {
          session.close();      
          res.send({"comments": comments});
        },
        onError: error => {
          console.log(error)
        },
      })  
  });

  router.get('/of/:user_id', async (req, res) => {
    const session = driver.session();
    let comments = []
    await session
      .run(`MATCH (n:User)-[r:WROTE]->(c:Comment) where id(n) = ${req.params.user_id} RETURN c`)
      .subscribe({
        onNext: async record => {
            const comment = await record.get('n').properties
            const id = await record.get('n').elementId
            comments.push({"id": id, ...comment})
        },
        onCompleted: () => {
          session.close();      
          res.send({"comments": comments});
        },
        onError: error => {
          console.log(error)
        },
      })  
  });

  router.post('/for/:game_id/by/:user_id', async (req, res) => {
    const session = driver.session();
    const comment = req.body
    if (! comment.text || ! comment.score) {
        return res.send("Niekompletne dane")
    }
    await session
      .run(`MATCH (u:User), (g:Game)
            WHERE id(u) = ${req.params.user_id}
            AND id(g) = ${req.params.game_id}
            CREATE (u)-[:WROTE]->(n:Comment {text: "${comment.text}",
            score: "${comment.score}"})
            CREATE (n)-[:RATES]->(g)`)
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
    const comment = req.body

    if (! comment.text || ! comment.score) {
        return res.send("Niekompletne dane")
    }

    await session
      .run(`MATCH (n:Comment) where id(n) = ${req.params.id} 
            SET n.text = "${comment.text}"
            SET n.score = "${comment.score}"`)
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
      .run(`MATCH (n:Comment) where id(n) = ${req.params.id} 
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