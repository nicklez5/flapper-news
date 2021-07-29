
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  password: {type: String }
});

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compare(password,this.password);
};

UserSchema.methods.setPassword = function(password){
  this.password = bcrypt.hash(password,10);

};

mongoose.model('User', UserSchema);
