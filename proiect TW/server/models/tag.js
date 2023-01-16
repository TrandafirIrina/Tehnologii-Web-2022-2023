const sequelize = require("../sequelize");
const { DataTypes } = require("sequelize");

const Tag = sequelize.define("Tag", {
  //camp generat automat
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

module.exports = Tag;
