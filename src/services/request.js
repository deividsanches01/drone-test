const request = require('request-promise')

let token = null
let tokenType = null
let authRefreshToken = null

const getToken = async () =>
  request({
    method: 'POST',
    uri: process.env.INTEGRATION_HOST + '/oauth/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    form: {
      grant_type: process.env.INTEGRATION_GRANT_TYPE,
      client_id: process.env.INTEGRATION_CLIENT_ID,
      client_secret: process.env.INTEGRATION_CLIENT_SECRET,
      username: process.env.INTEGRATION_USERNAME,
      password: process.env.INTEGRATION_PASSWORD
    }
  })
    .then(response => JSON.parse(response))
    .then(({ access_token, token_type, auth_refresh_token }) => {
      token = access_token
      tokenType = token_type
      authRefreshToken = auth_refresh_token
    })
    .catch(err => {
      console.error(err)
      throw new Error('Internal Server Error')
    })

module.exports.integrateUsers = async ({ users }) => {
  if (!token || !tokenType || !authRefreshToken) {
    await getToken()
  }
  return request
    .post({
      uri:
        process.env.INTEGRATION_HOST +
        '/api/ManutencaoBeneficiario/BeneficiariosCartaoCliente',
      headers: {
        Authorization: `${tokenType} ${token}`
      },
      body: {
        beneficiario: users
      },
      json: true
    })
    .then(response => response.data[0])
    .catch(err => {
      console.error(err)
      throw new Error('Internal Server Error')
    })
}
