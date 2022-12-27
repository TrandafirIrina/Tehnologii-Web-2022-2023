const sequelize = require("../sequelize");
const { DataTypes } = require("sequelize");

// definesc modelul note
const Note = sequelize.define("Note", {
  // generare automata a cheii primare
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 50] // vreau ca titlul sa aiba o lungime de minim 1 caracter si maxim 50 de caractere
    }
  },
  content: DataTypes.BLOB, // pentru ca notitele sa poata contine atat text cat si imagini
  subject: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 50] // vreau ca materia pentru care se adauga notita sa aiba o 
                  // lungime de minim 1 caracter si maxim 50 de caractere
    }
  }
});

module.exports = Note; //export modelul creat, pentru ca in fisierul /routes/router.js sa pot sa il import
