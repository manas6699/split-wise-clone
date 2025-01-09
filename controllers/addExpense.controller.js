const Expense  = require('../models/expense.model')

  const addExpenseHandler = async(req , res) =>{
    try {
        const {
          expense_amount,
          expense_by,
          group_name,
          expense_title,
          member_expenses,
          equally_splitted,
        } = req.body;
    
        // Validate input fields
        if (
          !expense_amount ||
          !expense_by ||
          !group_name ||
          !expense_title ||
          !member_expenses ||
          equally_splitted === undefined
        ) {
          return res.status(400).json({ message: 'All required fields must be provided.' });
        }
    
        // Create a new expense document
        const newExpense = new Expense({
          expense_amount,
          expense_by,
          group_name,
          expense_title,
          member_expenses,
          equally_splitted,
          you_lent: 0, // Default values for `you_lent`
          you_borrowed: 0, // Default values for `you_borrowed`
          date_time: new Date(), // Automatically handled but can be overridden
        });
    
        // Save to database
        const savedExpense = await newExpense.save();
    
        res.status(201).json({
          message: 'Expense added successfully!',
          expense: savedExpense,
        });
      } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'An error occurred while adding the expense.' });
      }
  }

  module.exports = addExpenseHandler;