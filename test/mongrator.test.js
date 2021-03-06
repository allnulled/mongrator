const { expect } = require("chai");
const exec = require("execute-command-sync");
const mongoose = require("mongoose");
const Mongrator = require(__dirname + "/../src/mongrator.js");
const User = require(__dirname + "/db/models/User.js");
const globby = require("globby");
const path = require("path");
const rimraf = require("rimraf");

describe("Mongrator API", function() {
	this.timeout(10000);

	const migrator = new Mongrator({
		url: "mongodb://localhost:27017/test",
		logger: console.log,
		colorize: true,
		folder: "test/db/migrations",
		mongoose: undefined,
		keepAlive: true,
		options: {}
	});

	before(async function() {
		await mongoose.connect(Mongrator.DEFAULT_PARAMETERS.url, { useNewUrlParser: true });
		await User.deleteMany({});
		await mongoose.connection.close();
		await migrator.init();
	});

	after(function() {
		migrator.mongoose.connection.close();
	});

	it("can migrate one", async function() {
		const query = User.find();
		const users0 = await User.find().exec();
		expect(users0.length).to.equal(0);
		await migrator.migrate("up", 1);
		const users1 = await User.find().exec();
		expect(users1.length).to.equal(1);
	});

	it("can list migrations status (1/3)", async function() {
		await migrator.list();
	});

	it("can migrate many", async function() {
		const query = User.find();
		const users0 = await User.find().exec();
		expect(users0.length).to.equal(1);
		await migrator.migrate("up");
		const users1 = await User.find().exec();
		expect(users1.length).to.equal(3);
	});

	it("can list migrations status (2/3)", async function() {
		await migrator.list();
	});

	it("can undo one migration", async function() {
		const query = User.find();
		const users0 = await User.find().exec();
		expect(users0.length).to.equal(3);
		await migrator.migrate("down", 1);
		const users1 = await User.find().exec();
		expect(users1.length).to.equal(3);
	});

	it("can list migrations status (3/3)", async function() {
		await migrator.list();
	});

	it("can undo many migrations", async function() {
		const query = User.find();
		const users1 = await User.find().exec();
		expect(users1.length).to.equal(3);
		await migrator.migrate("down");
		const users2 = await User.find().exec();
		expect(users2.length).to.equal(0);
	});
});

describe("Mongrator CLI", function() {
	this.timeout(10000);

	it("can create migrations", async function() {
		expect(globby.sync(`${__dirname}/db/migrations/*-sample1.js`).length).to.equal(0);
		exec("./bin/mongrator create --name sample1 --folder test/db/migrations", {
			cwd: path.resolve(`${__dirname}/..`)
		});
		expect(globby.sync(`${__dirname}/db/migrations/*-sample1.js`).length).to.equal(1);
		rimraf.sync(`${__dirname}/db/migrations/*-sample1.js`);
		expect(globby.sync(`${__dirname}/db/migrations/*-sample1.js`).length).to.equal(0);
	});

});
