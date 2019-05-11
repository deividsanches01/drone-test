const mongo = require('mongodb')
const mongoClient = mongo.MongoClient
const ObjectID = mongo.ObjectID

const url =
  process.env.MONGO_USER && process.env.MONGO_PASSWORD
    ? `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${
        process.env.MONGO_HOST
      }/${process.env.MONGO_MONGO_NAME}`
    : `mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DB_NAME}`

let db = null

module.exports.connect = async () => {
  try {
    if (db) return db
    const client = await mongoClient.connect(url, { useNewUrlParser: true })
    db = client.db(process.env.MONGO_NAME)
    return db
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

module.exports.ObjectID = ObjectID
