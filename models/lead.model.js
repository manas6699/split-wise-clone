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
    type: String,
    unique: true,
    required: [true, 'Phone number is required'],
},

source:{
    type: String,
    required: true,
},
status: {
    type: String,
    enum: ['assigned', 'not-assigned' , 'reassigned' , 'auto-assigned'],
    default: 'not-assigned',
},
assigned_to: {
    type: mongoose.Schema.Types.ObjectId , ref: 'User'
},
assignee_name:{
    type:mongoose.Schema.Types.String, ref: 'User'
}
},
{
    timestamps:true
}
);

module.exports = mongoose.model('Leads', leadSchema);