const database = require('./db')

module.exports.insertOne = async ({ collection, body }) => {
  try {
    const db = await database.connect()
    const result = await db.collection(collection).insertOne(body)
    return { ...body, _id: result.insertedId }
  } catch (error) {
    console.error(error)
    throw new Error('Internal Server Error')
  }
}

module.exports.findOne = async ({
  collection,
  query,
  desiredFieldList = []
}) => {
  try {
    const fields = {}
    if (desiredFieldList.length > 0) {
      desiredFieldList.forEach(key => {
        fields[key] = 1
      })
    }
    if (query._id) {
      query._id = database.ObjectID(query._id)
    }
    const db = await database.connect()
    return db.collection(collection).findOne(query, { fields })
  } catch (error) {
    console.error(error)
    throw new Error()
  }
}
