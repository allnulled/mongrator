require(__dirname + "/../models/User.js");

module.exports = {
	up: async function(mongoose, migrator) {
		const User = mongoose.model("User");
		const user = new User({
			name: "xxx 1",
			password: "xxx",
			email: "xxx@xxx.xxx"
		});
		await user.save();
		// Example of a query in async/await notation for mongoose
		const users = await User.find().exec();
		migrator.log(users);
	},
	down: async function(mongoose) {
		const User = mongoose.model("User");
		await User.deleteMany({});
	}
}