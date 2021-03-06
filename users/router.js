const User = require('./model')
const Router = require('express').Router
const bcrypt = require('bcrypt')

const sign = require('../jwt').sign

const router = new Router()

router.get('/secret', (req, res) => {
	if (req.user) {
		res.send({
			message: `Welcome, you should be the user with email ${req.user.email}`
		})
	}
	else {
		res.status(401).send({
			message: 'Please login!'
		})
	}
})

router.post('/users', (req, res) => {
	// console.log(req.body.preferredbreed);
	 const a=(req.body.preferredbreed)?req.body.preferredbreed.slice(1,-1).split(','):[]

	//console.log(typeof(req.body.preferredbreed.slice(1,-1).split(',')));
  const user = {
  	email: req.body.email,
  	password: bcrypt.hashSync(req.body.password, 10),
		name: req.body.name,
		description: req.body.description,
		preferredbreed: a
  }
	//console.log('[3,4,5]'.slice(1,-1));

  User.create(user)
    .then(entity => {
      res.status(201)
      res.json({
        id: entity.id,
				name: entity.name,
        email: entity.email,
				description: entity.description,
				preferredbreed: entity.preferredbreed
      })
    })
    .catch(err => {
      console.error(err)
      res.status(500).send({
        message: 'Something went wrong'
      })
    })

})

router.post('/logins', (req, res) => {
    const user = {
    	email: req.body.email,
    	password: req.body.password
    }

		User.findOne({
    	where: {
    		email: req.body.email
    	}
    })
    .then(entity => {
    	if (bcrypt.compareSync(req.body.password, entity.password)) {
    		 res.send({
					  details: entity,
    				jwt: sign(entity.id)
    			})
    		}
     else {
    		res.status(400).send({
    			message: 'Password was incorrect'
    			})
    		}
    	})

  .catch(err => {
    		console.error(err)
    		res.status(500).send({
    			message: 'Something went wrong'
    		})
    	})
})

router.get('/users', (req, res) => {
  User.findAll({
    attributes: ['id','email', 'name', 'description', 'preferredbreed']
  })
    .then(result => {
      res.json(result)
    })
    .catch(err => {
      res.status(500)
      res.json({message: 'Something went wrong'})
    })
})

router.get('/users/:id', (req, res) => {
  User.findById(req.params.id)
    .then(result => {
      if (result) {
				//console.log(result.dataValues);
        res.json({id:result.dataValues.id,name:result.dataValues.name,email:result.dataValues.email,
				description:result.dataValues.description,preferredbreed:result.dataValues.preferredbreed})
      } else {
        res.status(404)
        res.json({ message: 'Not Found' })
      }
    })
    .catch(err => {
      res.status(500)
      res.json({ message: 'There was an error' })
    })
})

router.delete('/users/:id', (req, res) => {
  User.findById(req.params.id)
    .then(entity => {
      return entity.destroy()
    })
    .then(_ => {
      res.send({
        message: 'The user was deleted succesfully'
      })
    })
    .catch(error => {
      res.status(500).send({
        message: `Something went wrong`,
        error
      })
    })
})

const updateOrPatch = (req, res) => {
  //const productId = Number(req.params.id
  let updates = req.body
  // if (req.body.preferredbreed) {
	// 	//const a=updates.preferredbreed.concparseInt(req.body.preferredbreed)
	// 	console.log(updates.preferredbreed);
	//   //updates.preferredbreed.push(parseInt(req.body.preferredbreed))
	// }

  // find the product in the DB
  User.findById(req.params.id)
    .then(entity => {
			if (updates.preferredbreed){
				console.log('=====================');
				console.log(updates.preferredbreed);
				console.log(entity.preferredbreed.includes(updates.preferredbreed));
			  const a = (entity.preferredbreed.includes(updates.preferredbreed))?
				           entity.preferredbreed:
									 entity.preferredbreed.concat(updates.preferredbreed)
				updates.preferredbreed=a
				console.log(a);
			}
			return entity.update(updates)
		})

    .then(final => {
      // respond with the changed product and status code 200 OK
			const {password,...rest} = final.dataValues
      res.send(rest)
    })
    .catch(error => {
      res.status(500).send({
        message: `Something went wrong`,
        error
      })
    })
}

router.put('/users/:id', updateOrPatch)
router.patch('/users/:id', updateOrPatch)



module.exports = router
