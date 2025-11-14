const Assign = require('../models/assign.model'); // Adjust path as needed

exports.updateAssignHistory = async (req, res) => {
  try {
    const { newHistoryEntry } = req.body;
    const { id } = req.params;

    // 1. Validation
    if (!newHistoryEntry || typeof newHistoryEntry !== 'string') {
      return res.status(400).json({ 
        message: 'Request body must contain a "newHistoryEntry" string.' 
      });
    }

    // 2. Find the document and update it using the $push operator
    // $push appends the new string to the 'history' array
    const updatedDocument = await Assign.findByIdAndUpdate(
      id,
      { 
        $push: { history: newHistoryEntry } 
      },
      { 
        new: true, // Returns the modified document
        runValidators: true // Runs schema validators
      }
    );

    // 3. Handle 'Not Found'
    if (!updatedDocument) {
      return res.status(404).json({ message: 'Document not found with this ID.' });
    }

    // 4. Send success response
    res.status(200).json({
      message: 'History updated successfully.',
      data: updatedDocument,
    });

  } catch (error) {
    console.error('Error updating history:', error);
    // Handle potential CastError (invalid ObjectId format)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
