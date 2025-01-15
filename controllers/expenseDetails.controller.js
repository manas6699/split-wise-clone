const Expense = require('../models/expense.model');

const expenseDetailsHandler = async (req, res) => {
    try {
        const { expense_id } = req.params;

        if (!expense_id) {
            return res.status(400).json({ message: 'Expense ID must be provided.' });
        }

        const expense = await Expense.findById(expense_id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found.' });
        }

        return res.status(200).json({ expense });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = expenseDetailsHandler;
