const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const User = new Schema({
	name: String,
	password: String,
	email: String
}, {collection: "User"});

// @TODO: use bcrypt to encrypt the password, as example, with mongoose API.

module.exports = mongoose.model("User", User);