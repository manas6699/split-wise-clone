const Expense = require("../models/expense.model");
const jwt = require("jsonwebtoken");

const editExpenseHandler = async (req, res) => {
  try {
    const { expense_id } = req.params; // Get the expense ID
    const {
      expense_amount,
      expense_by,
      group_name,
      expense_title,
      member_expenses,
      equally_splitted,
    } = req.body; // Get updated fields

    // Validate input fields
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
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      currentUser = decodedToken.name;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Validate `member_expenses` structure
    if (typeof member_expenses !== "object" || Array.isArray(member_expenses)) {
      return res
        .status(400)
        .json({ message: "`member_expenses` must be a valid object." });
    }
    for (const amount of Object.values(member_expenses)) {
      if (typeof amount !== "number" || amount < 0) {
        return res
          .status(400)
          .json({ message: "All expense amounts must be valid numbers." });
      }
    }

    // Initialize `you_lent` and `you_borrowed`
    let you_lent = 0;
    let you_borrowed = 0;

    // Calculate `you_lent` and `you_borrowed`
    if (currentUser === expense_by) {
      // Current user is the one who added the expense
      for (const [member, amount] of Object.entries(member_expenses)) {
        if (member !== currentUser) {
          you_lent += amount; // Money lent to others
        }
      }
    } else if (member_expenses[currentUser]) {
      // Current user owes money
      you_borrowed = member_expenses[currentUser];
    } else {
      return res
        .status(400)
        .json({ message: "Current user is not part of the expense group." });
    }

    // Update the expense document
    const updatedExpense = await Expense.findByIdAndUpdate(
      expense_id,
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
      { new: true, runValidators: true }
    );

    // Respond with success
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
