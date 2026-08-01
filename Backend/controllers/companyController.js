const Company = require('../models/Company');
const { companies: mockCompanies } = require('../data');

exports.getCompanies = async (req, res) => {
  try {
    let companies = await Company.find();
    if (!companies || companies.length === 0) {
      companies = mockCompanies;
    }
    res.json(companies);
  } catch (error) {
    res.json(mockCompanies);
  }
};
