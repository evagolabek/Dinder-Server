const Sequelize = require('sequelize')
const sequelize = require('../db')

const Breed = sequelize.define('breed', {
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  numberoflikes: {
    type: Sequelize.INTEGER,
  },
}, {
  tableName: 'breeds',
  timestamps: false
})


module.exports = Breed //ES6-style module export
