var mongoose = require('mongoose')

var ClientSchema = new mongoose.Schema({
    company: String,
    email: String,
    contactPerson: String,
    phone: String,
    address: String
})

module.exports = mongoose.model("Client", ClientSchema)