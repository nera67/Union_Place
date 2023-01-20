// @ts-check
const express = require('express')
const app = express()
const { Sequelize, DataTypes, Model } = require('sequelize');
const validator = require('validator').default
const cors = require('cors')
const { createToken, verifyToken, createPasswordHash, comparePassword} = require('./auth-service')
const path = require('path')

const sequelize = new Sequelize('feedback', 'feedback_user', 'unionplace', {
  host: 'localhost',
  dialect: 'mysql'
})

class Feedback extends Model {}
class Admin extends Model {}

function stringType() {
  return {
    type: DataTypes.STRING,
    allowNull: false
  }
}

Feedback.init({
  fio: stringType(),
  phone: stringType(),
  email: stringType(),
  info: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  modelName: 'Feedback',
  sequelize
})

Admin.init({
  name: stringType(),
  password: stringType()
}, {
  modelName: 'Admin',
  sequelize
})

start()

async function start() {
  try {
    // await sequelize.authenticate()
    // await sequelize.sync()
    startApp()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

function startApp() {
  app.use(cors())
  app.use(express.json())

  app.post('/api/admin', async function(req, res) {
    const passwordHash = createPasswordHash(req.body.password)
    const newAdmin = await Admin.create({
      name: req.body.name,
      password: passwordHash
    })
    res.send(newAdmin)
  })

  app.post('/api/login', async function(req, res) {
    const userFromDb = await Admin.findOne({where: {name: req.body.name}})
    //@ts-ignore
    if (comparePassword(req.body.password, userFromDb.password)) {
      const token = createToken(userFromDb)
      res.send({
        token
      })
    } else {
      res.status(403).send({
        message: 'Wrong password'
      })
    }
  })

  app.get('/api/feedback', verifyToken, async function(req, res) {
    const orders = await Feedback.findAll()
    res.send(orders)
  })

  app.post('/api/feedback', async function(req, res) {
    const feedbackInfo = req.body
    let validationError = []
    if (!validator.isMobilePhone(feedbackInfo.phone.replaceAll(/\D/g, ''), ['ru-RU'])) 
      validationError.push("Wrong phone number")
    if (!validator.isLength(feedbackInfo.fio, {min: 5, max: 100})) 
      validationError.push("Wrong fio")
    if (!validator.isEmail(feedbackInfo.email)) 
      validationError.push("Wrong email")
    if (!validator.isLength(feedbackInfo.info, {min: 0, max: 5000})) 
      validationError.push("Wrong info")

    if (validationError.length) {
      res.status(400).send({messages: validationError})
    } else {
      const feedbackFromDb = await Feedback.create(feedbackInfo)
      res.send(feedbackFromDb)
    }
  })

  app.use(express.static(path.join(__dirname, 'public')))

  app.listen(3000, function() {
    console.log('listening')
  })
}

