const planEnum = require('./enums/plans')
module.exports.beneficiaryFormatter = ({ name, gender, dateOfBirth, cpf }) => {
  return {
    cartaoTitular: cpf,
    cartaoUsuario: cpf,
    planoCodigo: 52821, //código definido pela ePharma
    inicioVigencia: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) //um dia para frente como consta na documentação da API da ePharma
      .toISOString()
      .split('T')[0]
      .split('-')
      .reverse()
      .join('/'),
    fimVigencia: '',
    matricula: '',
    grauDependencia: '',
    tipoBeneficiario: 'T',
    dadosBeneficiario: {
      nomeBeneficiario: name,
      cpf: cpf,
      dataNascimento: dateOfBirth,
      sexo: gender
    },
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    },
    telefones: {}
  }
}

module.exports.cardFormatter = ({ name, plan, validityStart }) => {
  return [
    {
      type: 'string',
      label: 'Nome',
      value: name
    },
    {
      type: 'string',
      label: 'Plano',
      value: planEnum[`${plan}`]
    },
    {
      type: 'string',
      label: 'Membro desde',
      value: validityStart
    }
  ]
}
