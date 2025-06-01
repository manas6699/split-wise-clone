const Expense = require('../models/expense.model');
const jwt = require('jsonwebtoken');


const addExpenseHandler = async (req, res) => {
  try {

    // Get the group_id from params
    const { group_id } = req.params;
    const {
      expense_amount,
      expense_by,
      group_name,
      expense_title,
      member_expenses,
      equally_splitted,
    } = req.body;


  

    if (!group_id) {
      return res.status(400).json({ message: 'Group ID is required.' });
    }
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


    // Decode the user token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing.' });
    }


    let currentUser;
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Ensure you set JWT_SECRET in your environment variables
      currentUser = decodedToken.name; 
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Calculate `you_lent` and `you_borrowed`
    let you_lent = 0;
    let you_borrowed = 0;


    if (currentUser === expense_by) {
      // If the current user is the one who added the expense
      for (const [member, amount] of Object.entries(member_expenses)) {
        if (member !== currentUser) {
          you_lent += amount;
        }
      }
    } else if (member_expenses[currentUser]) {
      // If the current user is a member who owes money
      you_borrowed = member_expenses[currentUser];
    } else {
      return res.status(400).json({ message: 'Current user is not part of the expense group.' });
    }
    console.log('Lent and borrowed  passed')

    // Create a new expense document
    const newExpense = new Expense({
      group_id,
      expense_amount,
      expense_by,
      group_name,
      expense_title,
      member_expenses,
      equally_splitted,
      you_lent,
      you_borrowed,
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
};


module.exports = addExpenseHandler;
