const sequelize = require("../sequelize"); // import din fisierul sequelize.js baza de date
const { DataTypes } = require("sequelize"); // import DataTypes din biblioteca sequelize

// definesc modelul grup
const Group = sequelize.define("Group", {
  // campul id care e cheie primara va fi generat automat
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 50] // vreau ca numele sa aiba o lungime de minim 1 caracter si maxim 50 de caractere
    }
  }
});

module.exports = Group; // export modelul creat
