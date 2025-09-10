const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({


name: {
    type: String,
    required: true,
},
email: {
    type: String,
},
phone: {
    type: String,
    // unique: true,
    required: [true, 'Phone number is required'],
},

source:{
    type: String,
},
projectSource:{
    type:String,
},
alternate_phone: {
    type: String
},
client_budget:{
    type: String
},
interested_project:{
    type: String
},
location:{
    type: String
},
preferred_floor:{
    type: String
},
preferred_configuration:{
    type: String
},
furnished_status:{
    type: String
},
property_status:{
    type: String
},
lead_status:{
    type: String,
    enum:[  
        'Busy',
        'Not responding',
        'Network Error',
        'Not Valid',
        'Under Follow Up',
        'Redirection to voice-mail',
        'Site Visit Fixed',
        'Sold',
        'Site Visit Done',
        'Site Visit Cancelled',
        'Site Visit Rescheduled',
        'Already Booked',
        'Call Back',
        'Fraud',
        'Agent Switch',
        'Visited Followup',
        'Location Issue',
        'Budget Issue',
        'Duplicate',
        'Language barrier',
        'Not interested'
]
},
lead_type:{
    type: String
},
comments:{
    type: String
},
schedule_date: {
  type: String,
  default: null
},
schedule_time: {
  type: String,
  default: ''
},
status: {
    type: String,
    enum: ['assigned', 'not-assigned' , 'processed', 'reassigned' , 'auto-assigned'],
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