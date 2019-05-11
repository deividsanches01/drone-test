require('dotenv').config()
const app = require('./config/express')
const { queueInit } = require('./queue')

app.listen(process.env.PORT || 3000, () => {
  queueInit()
  console.log('server running')
})
