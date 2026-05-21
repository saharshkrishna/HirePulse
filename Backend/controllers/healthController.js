const SourceHealth = require('../models/SourceHealth');

exports.getSourceHealth = async (req, res) => {
  try {
    const health = await SourceHealth.find();
    res.json(health);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
