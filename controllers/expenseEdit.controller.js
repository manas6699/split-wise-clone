const Expense = require("../models/expense.model");

const jwt = require("jsonwebtoken");

// Edit Expense Handler

// BUG lent and borrowed logic is not correct
const editExpenseHandler = async (req, res) => {
  try {
    const { expense_id } = req.params; // Get the expense ID from the route parameters
    const {
      expense_amount,
      expense_by,
      group_name,
      expense_title,
      member_expenses,
      equally_splitted,
    } = req.body; // Destructure updated fields from the request body

    // Validate input
    if (
      !expense_amount ||
      !expense_by ||
      !group_name ||
      !expense_title ||
      !member_expenses ||
      equally_splitted === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Find the existing expense
    const existingExpense = await Expense.findById(expense_id);

    // If the expense doesn't exist
    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    // Decode the user token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is missing." });
    }

    let currentUser;
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Ensure you set JWT_SECRET in your environment variables
      currentUser = decodedToken.name;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Handle 'you_lent' and 'you_borrowed' fields
    let you_lent = 0;
    let you_borrowed = 0;

    // If the current user is the one who added the expense
    if (expense_by === existingExpense.expense_by) {
      // Calculate 'you_lent' if the user who created the expense is lending money
      for (const [member, amount] of Object.entries(member_expenses)) {
        if (member !== expense_by) {
          you_lent += amount;
        }
      }
    } else {
      // If the current user is part of the group, calculate 'you_borrowed'
      if (member_expenses[expense_by]) {
        you_borrowed = member_expenses[expense_by];
      }
    }

    // Update the expense document
    const updatedExpense = await Expense.findByIdAndUpdate(
      expense_id, // Expense ID
      {
        expense_amount,
        expense_by,
        group_name,
        expense_title,
        member_expenses,
        equally_splitted,
        you_lent,
        you_borrowed,
      },
      { new: true, runValidators: true } // Options: return updated document and run validators
    );

    // Send success response
    res.status(200).json({
      message: "Expense updated successfully.",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error editing expense:", error);
    res
      .status(500)
      .json({ message: "An error occurred while editing the expense." });
  }
};

module.exports = editExpenseHandler;
