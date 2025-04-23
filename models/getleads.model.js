const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({


name: {
    type: String,
    required: true,
},
email: {
    type: String,
    required: true,
},
phone: {
    type: Number,
    required: true,
    length: 10,
    // unique mobile number removed , infuture can implement with multiple api and download brochure / floor plans section
    // unique: true,
},
source:{
    type: String,
    required: true,
}
},
{
    timestamps:true
}
);

module.exports = mongoose.model('Leads', leadSchema);