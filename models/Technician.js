var mongoose = require('mongoose')

var TechSchema = new mongoose.Schema({
    company: String,
    email: String,
    contactPerson: String,
    phone: String,
    address: String
})

module.exports = mongoose.model("Technician", TechSchema)