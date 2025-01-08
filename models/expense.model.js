const mongoose = require('mongoose');


const expenseSchema = new mongoose.Schema(
    {
        expenseName: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
)


module.exports = mongoose.model("Expense", expenseSchema);