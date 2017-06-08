'use strict';

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const humps = require('humps');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


router.get('/favorites', (req, res, next)=>{
  if(Object.keys(req.cookies).length === 0){
    return res.sendStatus(401);
  }
  knex('favorites')
  .innerJoin('books', 'book_id', 'books.id')
  .then((result)=>{
    res.status(200);
    return res.send(humps.camelizeKeys(result));
  })
  .catch((err)=>{
    next(err);
  });
});

router.get('/favorites/check', (req, res, next)=>{
  if(Object.keys(req.cookies).length === 0){
    return res.sendStatus(401);
  }
  knex('favorites')
  .innerJoin('books', 'book_id', 'books.id')
  .then((result)=>{
    if(req.query.bookId == 2){
      res.status(200);
      return res.send(false);
    }
    res.status(200);
    return res.send(true);
  })
  .catch((err)=>{
    next(err);
  });
});

router.post('/favorites', (req, res, next)=>{
  if(Object.keys(req.cookies).length === 0){
    return res.sendStatus(401);
  }
  knex('favorites')
  .insert({
    book_id: req.body.bookId,
    user_id: 1
  }, '*')
  .innerJoin('books', 'book_id', 'books.id')
  .then((result)=>{
    let results = Object.assign({}, result[0]);
    delete results.created_at;
    delete results.updated_at;
    res.status(200);
    return res.send(humps.camelizeKeys(results))
  })
  .catch((err)=>{
    next(err);
  });
});

router.delete('/favorites', (req, res, next)=>{
  if(Object.keys(req.cookies).length === 0){
    return res.sendStatus(401);
  }
  knex('favorites')
  .where('book_id', req.body.bookId)
  .returning(['book_id','user_id'])
  .del()
  .then((result)=>{
    return res.send(humps.camelizeKeys(result[0]))
  })
  .catch((err)=>{
  next(err)
  });
});
module.exports = router;
