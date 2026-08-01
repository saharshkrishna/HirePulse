const SourceHealth = require('../models/SourceHealth');
const { sourceHealth: mockSourceHealth } = require('../data');

exports.getSourceHealth = async (req, res) => {
  try {
    let health = await SourceHealth.find();
    if (!health || health.length === 0) {
      health = mockSourceHealth;
    }
    res.json(health);
  } catch (error) {
    res.json(mockSourceHealth);
  }
};
