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
    unique: true,
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