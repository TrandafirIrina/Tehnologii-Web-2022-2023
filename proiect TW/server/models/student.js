const { DataTypes } = require("sequelize")
const sequelize = require("../sequelize")

// definesc modelul Student
const Student = sequelize.define(
  "Student", 
{
  //camp generat automat
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING, 
    allowNull: false, // nu permit valori nule pentru numele de utilizator
    validate:{
      len: [1, 100] // vreau ca numele utilizatorului sa aiba o lungime de minim 1 caracter si maxim 100 de caractere
    },
  },
  email: {
    type: DataTypes.STRING,
    validate:{
      isEmail: true // verific faptul ca emailul are formatul potrivit
    }
  },
  password: {
    type: DataTypes.STRING,
    validate:{
      len: [5, 20] // vreau ca parola sa aiba o lungime de minim 5 caracter si maxim 20 de caractere
    }
  }
});

module.exports = Student; //export modelul creat
