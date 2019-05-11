const winston = require('winston')
const Elasticsearch = require('winston-elasticsearch')

module.exports = winston.createLogger({
  transports: [
    new Elasticsearch({
      level: 'info'
    })
  ]
})
