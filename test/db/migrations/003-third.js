require(__dirname + "/../models/User.js");

module.exports = {
	up: async function(mongoose, migrator) {
		const User = mongoose.model("User");
		const user = new User({
			name: "xxx 3",
			password: "xxx",
			email: "xxx@xxx.xxx"
		});
		await user.save();
	},
	down: async function(mongoose, migrator) {
		const User = mongoose.model("User");
		return await new Promise(resolve => setTimeout(ok => resolve(), 2000));
	}
};