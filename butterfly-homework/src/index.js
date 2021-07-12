'use strict';

const express = require('express');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const shortid = require('shortid');

const constants = require('./constants');
const { validateButterfly, validateUser, validateRating } = require('./validators');

async function createApp(dbPath) {
  const app = express();
  app.use(express.json());

  const db = await lowdb(new FileAsync(dbPath));
  await db.read();

  app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  /* ----- BUTTERFLIES ----- */

  /**
   * Get an existing butterfly
   * GET
   */
  app.get('/butterflies/:id', async (req, res) => {
    const butterfly = await db.get('butterflies')
      .find({ id: req.params.id })
      .value();

    if (!butterfly) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(butterfly);
  });

  /**
   * Create a new butterfly
   * POST
   */
  app.post('/butterflies', async (req, res) => {
    try {
      validateButterfly(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const newButterfly = {
      id: shortid.generate(),
      ...req.body
    };

    await db.get('butterflies')
      .push(newButterfly)
      .write();

    res.json(newButterfly);
  });


  /* ----- USERS ----- */

  /**
   * Get an existing user
   * GET
   */
  app.get('/users/:id', async (req, res) => {
    const user = await db.get('users')
      .find({ id: req.params.id })
      .value();

    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(user);
  });

  /**
   * Create a new user
   * POST
   */
  app.post('/users', async (req, res) => {
    try {
      validateRating(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const newUser = {
      id: shortid.generate(),
      ...req.body
    };

    await db.get('users')
      .push(newUser)
      .write();

    res.json(newUser);
  });
  /**
   * Rate a butterfly
   * POST
   */
  app.post('/users/ratings', async (req, res) => {
    try {
      validateRating(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body'});
    }
    const user = await db.get('users')
      .find({ id: req.body.id })
      .value();
    if (!user) {
      return res.status(404).json({ error: 'User Not found' });
    }
    if(req.body.rating > 5 || req.body.rating < 0){
      return res.status(404).json({ error: 'Invalid Rating' });
    }
    //Does user have ratings
    const rate = await db.get('users')
      .find('butterflyRatings')
      .value();
    //If no ratings exists create new field to store
    if (!rate) {
      await db.get('users')
        .find({id: req.body.id})
        .assign({butterflyRatings:[]})
        .write();
    }
    const butterfly = await db.get('users')
      .find({id: req.body.id})
      .get('butterflyRatings')
      .find({butterfly:req.body.butterfly})
      .value();
    //If butterfly not stored in ratings, add
    if (!butterfly){
       await db.get('users')
        .find({id: req.body.id})
        .get('butterflyRatings')
        .push({butterfly:req.body.butterfly, rating:req.body.rating})
        .write();
    //If in stored ratings, update the value 
    }else{
       await db.get('users')
        .find({id: req.body.id})
        .get('butterflyRatings')
        .find({butterfly:req.body.butterfly})
        .assign({rating:req.body.rating})
        .write();
    }
    res.json(req.body);
  });

  /**
   * Get a users butterfly ratings
   * GET
   */
  app.get('/users/ratings/:userid', async (req, res) => {
    const ratings = await db.get('users')
      .find({id: req.params.userid})
      .get('butterflyRatings')
      .value();
    if (!ratings) {
      return res.status(404).json({ error: 'Not ratings found' });
    }
    res.json(ratings);
  });

  //Get ratings endpoint will look like users/ratings/:user_id
  return app;
}


/* istanbul ignore if */
if (require.main === module) {
  (async () => {
    const app = await createApp(constants.DB_PATH);
    const port = process.env.PORT || 8000;

    app.listen(port, () => {
      console.log(`Butterfly API started at http://localhost:${port}`);
    });
  })();
}

module.exports = createApp;
