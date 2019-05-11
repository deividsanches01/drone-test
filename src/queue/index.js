const amqlib = require('amqplib')
const { integrateUsers } = require('../services/request')
const { insertOne } = require('../db')
const { beneficiaryFormatter } = require('../utils/beneficiary')

const queueInit = async () => {
  try {
    const queue = process.env.QUEUE_NAME
    const connection = await amqlib.connect(process.env.QUEUE_HOST)
    connection.on('error', function(err) {
      if (err.message !== 'Connection closing') {
        console.error('[AMQP] conn error', err.message)
      } else {
        console.error(err.message)
      }
    })
    connection.on('close', function() {
      console.error('[AMQP] reconnecting')
      return setTimeout(queueInit, 500)
    })
    const channel = await connection.createChannel()
    await channel.assertQueue(queue)
    channel.consume(queue, async msg => {
      const { name, gender, cpf, dateOfBirth, accountId } = JSON.parse(
        msg.content.toString()
      )
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
        await channel.ack(msg)
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
        //log de sucesso no mongo
      } else {
        //log de error no mongo
      }
    })
  } catch (error) {
    console.error(error)
  }
}

module.exports.queueInit = queueInit
