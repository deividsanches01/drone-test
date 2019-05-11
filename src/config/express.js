const express = require('express')
const logger = require('../services/logger')
const { integrateUsers } = require('../services/request')
const { insertOne } = require('../db')
const { findOne } = require('../db')
const { beneficiaryFormatter, cardFormatter } = require('../utils/beneficiary')
const app = express()

app.use(require('body-parser').json())

app.get('/wallet', async (req, res) => {
  try {
    let accountId
    const { authorization } = req.headers
    if (!authorization) res.status(401).send({ error: 'Missing Token' })
    const [accountIdAndType, accessToken] = authorization.split(/_(.+)/)
    if (
      accountIdAndType.includes('Bearer') ||
      accountIdAndType.includes('bearer')
    ) {
      accountId = accountIdAndType.split(' ')[1]
    } else {
      accountId = accountIdAndType
    }
    const user = await findOne({
      collection: 'users',
      query: { accountId }
    })
    res.status(user ? 200 : 404).send(cardFormatter(user))
  } catch (error) {
    console.error(error)
    res.status(500).send()
  }
})

//only for testing purposes
app.post('/wallet', async (req, res) => {
  try {
    const { name, gender, cpf, dateOfBirth, accountId } = req.body
    if (!name || !gender || !cpf || !dateOfBirth || !accountId) {
      throw new Error('Missing integration Fields')
    }
    const beneficiaryPayload = beneficiaryFormatter({
      name,
      gender,
      cpf,
      dateOfBirth
    })
    const integratedUser = await integrateUsers({
      users: [beneficiaryPayload]
    })
    if (integratedUser && integratedUser.status !== 'Erro') {
      const body = {
        accountId,
        name,
        gender,
        cpf,
        dateOfBirth,
        plan: integratedUser.plano,
        validityStart: beneficiaryPayload.inicioVigencia,
        integratedAt: integratedUser.processamento,
        integrationId: integratedUser.cliente
      }
      await insertOne({
        collection: 'users',
        body
      })
    }
    res.status(integratedUser.status !== 'Erro' ? 201 : 400).send()
  } catch (error) {
    res.status(500).send()
  }
})

module.exports = app
