const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expense_amount: {
    type: Number,
    required: true
  },
  expense_by: {
    type: String,
    required: true
  },
  group_name: {
    type: String,
    required: true
  },
  expense_title: {
    type: String,
    required: true
  },
  member_expenses: {
    type: Map,
    of: Number,
    required: true
  },
  equally_splitted: {
    type: Boolean,
    required: true
  },
  you_lent: {
    type: Number,
    default: 0
  },
  you_borrowed: {
    type: Number,
    default: 0
  },
  date_time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
