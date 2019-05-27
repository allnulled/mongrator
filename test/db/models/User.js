const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
	name: String,
	password: String,
	email: String
}, {collection: "User"});

module.exports = mongoose.model("User", User);