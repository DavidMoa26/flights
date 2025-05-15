export const createFlight = async (req, res) => {
  try {
    res.status(201).json('createFlight!');
  } catch (error) {
    console.error('Create product error:', error);
    res
      .status(500)
      .json({ message: 'Error creating product', details: error.message });
  }
};
