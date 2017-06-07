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
const env = require('dotenv').config();


router.get('/token', (req, res, next)=>{

  if(Object.keys(req.body).length === 0 && Object.keys(req.cookies).length === 0){
    res.status(200);
    res.send(false);
  } else if(Object.keys(req.cookies).length > 0){
    res.status(200);
    res.send(true);
  }

});

router.post('/token', (req, res, next)=>{
  knex('users')
  // .where('email', req.body.email)
  .then((result)=>{
    if(result.length === 0){
      return res.sendStatus(400);
    }
    if(!req.body.email || !req.body.password){
      res.set({'Content-Type': 'plain/text'});
      res.status(400)
      return res.send('Bad email or password');
    }
    if(!bcrypt.compareSync(req.body.password,result[0].hashed_password)){
      res.set({'Content-Type': 'plain/text'});
      res.status(400)
      return res.send('Bad email or password');
    }
    if(req.body.email !== result[0].email){
      res.set({'Content-Type': 'plain/text'});
      res.status(400)
      return res.send('Bad email or password');
    }

    let userObj = {
      id: result[0].id,
      first_name: result[0].first_name,
      last_name: result[0].last_name,
      email: result[0].email
    };

    let jwToken = jwt.sign(userObj, process.env.JWT_SECRET);
    return res.cookie('token', jwToken, {httpOnly: true}).send(humps.camelizeKeys(userObj));
  });
});

router.delete('/token', (req,res,next)=>{
  knex('users')
  .then((result)=>{
    res.cookie('token', '');
    res.status(200);
    res.send(true);
  });
});
module.exports = router;
