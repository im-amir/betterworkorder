var mongoose = require('mongoose')

var OrderSchema = new mongoose.Schema({
    title: String,
    start: String,
    stop: String,
    totalHours: Number,
    totalMinutes: Number,
    dateNow: String,
    Services: [String],
    Recommendations: String,
    Notes: String,
    PartsAndMaterials: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
    // image: {
    //     data: Buffer,
    //     contentType: String
    // }
    // tempClientCompany: String,
    // tempClientContPerson: String,
    // tempClientEmail: String,
    // tempClientPhone: String,
    // tempClientAddress: String,
    // tempTechCompany: String,
    // tempTechContPerson: String,
    // tempTechEmail: String,
    // tempTechPhone: String,
    // tempTechAddress: String,
})

module.exports = mongoose.model("Order", OrderSchema)