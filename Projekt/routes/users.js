
const express = require('express');
const router = express.Router({mergeParams: true});
const driver = require('../config/neo4jDriver');

router.get('/', async(req, res) => {
    const session = driver.session();
    const users = []
    await session
    .run(`MATCH (n:User) RETURN n`)
    .subscribe({
        onNext: async record => {
            const result = await record.get('n').properties
            const id = await record.get('n').elementId
            users.push({"id": id, ...result})
        },
        onCompleted: () => {
            session.close()
            res.send({"users": users})
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
      .run(`MATCH (n:User) where id(n) = ${req.params.id} RETURN n`)
      .subscribe({
        onNext: async record => {
            const user = await record.get('n').properties
            const id = await record.get('n').elementId
            result = {"id": id, ...user}
        },
        onCompleted: () => {
          session.close();      
          res.send({"user": result});
        },
        onError: error => {
          console.log(error)
        },
      })  
  });

router.post('/create', async (req, res) => {
    const session = driver.session();
    const user = req.body
    await session
      .run(`CREATE (n:User {username: "${user.username}",
            password: "${user.password}",
            age: "${user.age}",
            email: "${user.email}",
            phone_number: "${user.phone_number}",
            address: "${user.address}" })`)
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
    const old_username = req.body.old_username
    const passowrd = req.body.old_password
    const user = req.body
    const session = driver.session();

    const return_result = async () => {
        const session = driver.session();
        await session
      .run(`MATCH (n:User) WHERE id(n)=${req.params.id}
            SET n.username = "${user.username}"
            SET n.password = "${user.password}"
            SET n.age = "${user.age}"
            SET n.email = "${user.email}"
            SET n.phone_number = "${user.phone_number}"
            SET n.address = "${user.address}"`)
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
    }

    let user_in_db = "Not found"
   
     await session
        .run(`MATCH (n:User) where id(n) = ${req.params.id} RETURN n`)
        .subscribe({
            onNext: async (record) => {
                const data = await record.get('n').properties;
                const id = await record.get('n').elementId;
                user_in_db = { "id": id, ...data };
                console.log(user_in_db);
            },
            onCompleted: async () => {
                await session.close();

                if (user_in_db.username !== old_username) {
                    return res.send("Incorrect user data");
                }
                if (user_in_db.password !== passowrd) {
                    return res.send("Incorrect user data");
                }
                return return_result()
            },
            onError: error => {
                console.log(error);
            },
        })
})

router.delete('/:id', async (req, res) => {
    const session = driver.session();
    await session
    .run(`Match (n: User) where id(n) = ${req.params.id}
    DETACH DELETE n`)
    return res.send("Deleted");
})

router.post('/login', async (req, res) => {
    const session = driver.session();
    const users = []
    await session
    .run(`MATCH (n:User) RETURN n`)
    .subscribe({
        onNext: async record => {
            const result = await record.get('n').properties
            const id = await record.get('n').elementId
            users.push({"id": id, ...result})
        },
        onCompleted: () => {
            session.close()
            let found_user = false
            users.forEach( u => {
                if (u.username == req.body.username & u.password == req.body.password) {
                    found_user = true
                }
            })
            if (found_user) return res.send("Zalogowano")
            return res.send("Niepoprawne dane logowania")
        },
        onError: error => {
            console.log(error);
            res.send("Sth went wrong")
        }
    })
})

router.post('/:id/favourite/:game', async (req, res) => {
    const session = driver.session();
    await session
      .run(`MATCH (u:User), (g:Game) WHERE id(u)=${req.params.id} AND id(g)=${req.params.game}
            CREATE (u)-[:LIKES]->(g)`)
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

router.delete('/:id/favourite/:game', async (req, res) => {
    const session = driver.session();
    await session
      .run(`MATCH (u:User)-[r:LIKES]->(g:Game) WHERE id(u)=${req.params.id} AND id(g)=${req.params.game}
            DETACH DELETE r`)
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

router.get('/:id/favourite/', async (req, res) => {
    const session = driver.session();
    const games = []
    await session
      .run(`MATCH (u:User)-[r:LIKES]->(g:Game) WHERE id(u)=${req.params.id}
            RETURN g`)
      .subscribe({
        onNext: async record => {
            const game = await record.get('g').properties
            const id = await record.get('g').elementId
            games.push({"id": id, ...game})
        },
        onCompleted: () => {
          session.close();      
          res.send({"games": games});
        },
        onError: error => {
          console.log(error)
        },
      })  
})

module.exports = router;