const mongoose = require('mongoose');


const groupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true,
        },

        // reference to the user model
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        expenses: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Expense' // Reference to the Expense schema
            }
        ]

    },
    {
        timestamps: true
    }
)


module.exports = mongoose.model("Group" , groupSchema );