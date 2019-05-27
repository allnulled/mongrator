const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const mongoose = require("mongoose");
const Timer = require("just-a-timer");

class Mongrator {
	static get DEFAULT_PARAMETERS() {
		return {
			url: "mongodb://localhost:27017/test",
			debug: true,
			logger: true,
			colorize: true,
			folder: "db/migrations",
			collection: "DatabaseMigrationsStatus",
			mongoose: undefined,
			keepAlive: true,
			name: `unnamed`,
			direction: "up",
			quantity: -1,
			templatePath: `${__dirname}/template/migration.js`,
			options: {}
		};
	}

	static padLeft(nr, n, str) {
		return Array(n - String(nr).length + 1).join(str || "0") + nr;
	}

	static formatDate(date) {
		return `${date.getFullYear()}.${this.padLeft(date.getMonth() + 1, 2)}.${this.padLeft(
			date.getDate(),
			2
		)}-${this.padLeft(date.getHours(), 2)}.${this.padLeft(date.getMinutes(), 2)}.${this.padLeft(
			date.getSeconds(),
			2
		)}.${this.padLeft(date.getMilliseconds(), 3)}`;
	}

	error(...message) {
		if (this.args.debug) {
			if (this.args.colorize) {
				this.args.logger(
					...message.map((msg) => chalk.red.bold(typeof msg !== "string" ? JSON.stringify(msg, null, 4) : msg))
				);
			} else {
				this.args.logger(...message);
			}
		}
	}

	log(...message) {
		if (this.args.debug) {
			if (this.args.colorize) {
				this.args.logger(
					...message.map((msg) => chalk.green.bold(typeof msg !== "string" ? JSON.stringify(msg, null, 4) : msg))
				);
			} else {
				this.args.logger(...message);
			}
		}
	}

	info(...message) {
		if (this.args.debug) {
			if (this.args.colorize) {
				this.args.logger(
					...message.map((msg) => chalk.blue.bold(typeof msg !== "string" ? JSON.stringify(msg, null, 4) : msg))
				);
			} else {
				this.args.logger(...message);
			}
		}
	}

	warn(...message) {
		if (this.args.debug) {
			if (this.args.colorize) {
				this.args.logger(
					...message.map((msg) => chalk.yellow.bold(typeof msg !== "string" ? JSON.stringify(msg, null, 4) : msg))
				);
			} else {
				this.args.logger(...message);
			}
		}
	}

	notice(...message) {
		if (this.args.debug) {
			if (this.args.colorize) {
				this.args.logger(
					...message.map((msg) =>
						chalk.bgWhite.black.bold.underline(
							typeof msg !== "string" ? JSON.stringify(msg, null, 4) : msg.toUpperCase()
						)
					)
				);
			} else {
				this.args.logger(...message);
			}
		}
	}

	async init() {
		await this._connect();
		if (!this.schema) {
			this.info("[ ] Defining <database migration status> schema.");
			this.schema = this.args.mongoose.Schema(
				{
					name: String,
					lastRun: Date,
					status: String
				},
				{ collection: this.args.collection }
			);
		}
		if (!this.model) {
			this.info("[ ] Defining <database migration status> model.");
			this.model = this.args.mongoose.model(this.args.collection, this.schema, this.args.collection);
		}
	}

	async migrate(direction = this.args.command, quantity = this.args.quantity) {
		this.notice(`[ ] Running migration ${direction} for ${quantity === -1 ? "any" : quantity} time(s).`);
		await this.init();
		const status = await this._getStatus(direction, quantity);
		const files = await this._getTransactions(this.args.folder);
		const pending = await this._getPending(status, files, direction, quantity);
		const statistics = await this._migrate(pending, direction);
		await this.disconnect();
		return statistics;
	}

	async disconnect() {
		if (!this.args.keepAlive) {
			try {
				await this.args.mongoose.connection.close();
			} catch (error) {}
		}
	}

	create(name = this.args.name, templatePath = this.args.templatePath) {
		const outputFile = path.resolve(this.args.folder, this._getFilename(name));
		const outputTemplate = path.resolve(templatePath);
		this.info("[ ] New migration file path:");
		this.info(`[ ]    - ${outputFile}`);
		const outputContents = fs.readFileSync(outputTemplate).toString();
		this.info("[ ] New migration template path:");
		this.info(`[ ]    - ${path.resolve(templatePath)} (${outputContents.length} characters)`);
		fs.writeFileSync(outputFile, outputContents, "utf8");
		this.info("[#] Creating new migration file...");
		this.log(`[✓] Successfully created migration at:`);
		this.log(`[✓]    - ${outputFile}.`);
	}

	async list() {
		await this.init();
		const query = this.args.mongoose.model(this.args.collection).find({});
		const status = await query.exec();
		const byNames = status.reduce((result, item) => {
			result[item.name] = item;
			return result;
		}, {});
		const names = Object.keys(byNames);
		const files = fs.readdirSync(this.args.folder);
		this.notice("[·] Showing migrations status:");
		files.forEach((file) => {
			if (names.indexOf(file) !== -1) {
				const migration = byNames[file];
				if (migration.status === "up") {
					this.log("[ ] File: " + migration.name);
					this.log("[ ]  - Status: up.");
					this.log("[ ]  - Last run: " + this.constructor.formatDate(new Date(migration.lastRun)));
				} else if (migration.status === "down") {
					this.info("[ ] File: " + migration.name);
					this.info("[ ]  - Status: down.");
					this.info("[ ]  - Last run: " + this.constructor.formatDate(new Date(migration.lastRun)));
				}
			} else {
				this.warn("[ ] File: " + file);
				this.warn("[ ]  - Status: not run yet");
				this.warn("[ ]  - Last run: not run yet");
			}
		});
		await this.disconnect();
	}

	constructor(args = {}) {
		this.args = Object.assign({}, this.constructor.DEFAULT_PARAMETERS, args);
		if (!this.args.mongoose) {
			this.args.mongoose = mongoose;
		}
		if (
			this.args.logger === true ||
			this.args.logger === console ||
			this.args.logger === console.log ||
			typeof this.args.logger === "undefined"
		) {
			this.args.logger = console.log.bind(console);
		} else if (!this.args.logger) {
			this.args.logger = false;
		}
		this.mongoose = this.args.mongoose;
	}

	_getFilename(name = "unnamed") {
		return `${this.constructor.formatDate(new Date())}-${name}.js`;
	}

	async _connect() {
		if (this.mongoose.connection.readyState !== 1) {
			this.info("[·] Connecting to database. Please, wait...");
			await this.args.mongoose.connect(this.args.url, { useNewUrlParser: true, ...this.args.options });
			this.info("[ ] Successfully connected to database.");
		}
	}

	async _getStatus(direction, quantity) {
		this.info("[·] Loading status from database.");
		const query = this.args.mongoose
			.model(this.args.collection)
			.find({})
			.sort({
				name: direction === "up" ? 1 : -1
			});
		const results = await query.exec();
		return results;
	}

	async _getTransactions(folder = this.args.folder) {
		this.info("[ ] Loading files.");
		return fs.readdirSync(folder).map((file) => {
			this.info(`[#] Loading file <${file}>.`);
			const transaction = require(path.resolve(folder, file));
			return { name: file, ...transaction };
		});
	}

	async _getPending(status, files, direction, quantity) {
		this.info("[ ] Getting all pendings.");
		let index = 0;
		let pending = [].concat(files).filter((file) => {
			let isPending = undefined;
			let isInStatus = false;
			status.forEach((stat) => {
				if (stat.name === file.name) {
					isInStatus = true;
					isPending = stat.status !== direction;
				}
			});
			if (direction === "up" && !isInStatus) {
				isPending = true;
			}
			return isPending;
		});
		if (direction === "down") {
			pending = pending.reverse();
		}
		if (quantity !== -1) {
			pending = pending.splice(0, quantity);
		}
		this.info(`[ ] Got ${pending.length} pending(s).`);
		pending.forEach((file) => {
			this.info(`[ ] Pending file: <${file.name}>.`);
		});
		return pending;
	}

	async _migrate(pendings, direction) {
		const statistics = {};
		const timer = new Timer();
		let lastTime = timer.time() / 1000;
		let index = 0;
		const runNext = async () => {
			if (!(index in pendings)) {
				this.info("[ ] No more pending transactions.");
				this.info(`[ ] Migration ${direction.toUpperCase} finished successfully.`);
				this.notice("[✓] Statistics:");
				this.warn("[✓]  - Total duration: " + timer.time() / 1000 + " seconds");
				Object.keys(statistics).forEach((i) => {
					const item = statistics[i];
					this.warn(`[✓]    · File <${item.file}> took ${item.time} seconds.`);
				});
				return;
			}
			const pending = pendings[index];
			this.notice(
				`[#] Starting (${index + 1} out of ${pendings.length}) migration ${direction} of file <${pending.name}>.`
			);
			try {
				await pending[direction](this.args.mongoose, this);
				this.log("[#] Successful transaction committed.");
				index++;
				const Operation = this.args.mongoose.model(this.args.collection);
				const ops = await Operation.find({});
				let operation = await Operation.findOne({
					name: pending.name
				});
				if (!operation) {
					operation = new Operation({
						name: pending.name,
						status: direction
					});
				}
				operation.lastRun = new Date();
				operation.status = direction;
				await operation.save();
				const currTime = timer.time() / 1000;
				const duration = currTime - lastTime;
				this.log("[#] Successful transaction registered in database.");
				this.log(`[ ]   - File: <${pending.name}>.`);
				this.log(`[ ]   - Status: ${direction}.`);
				this.log(`[ ]   - Duration: ${duration.toFixed(3)} seconds.`);
				this.log(`[ ]   - Operation: migration.`);
				lastTime = currTime;
				statistics["" + index] = {
					file: pending.name,
					time: duration.toFixed(3)
				};
				return await runNext();
			} catch (error) {
				this.error("[!] Error.");
				this.error("[!]", error);
				this.error(`[!] Conflictive file: <${pending.name}>`);
				return;
			}
		};
		return await runNext(index);
	}

	async execute() {
		switch (this.args.command) {
			case "up":
			case "down":
				return await this.migrate();
			case "list":
				return await this.list();
			case "create":
				return await this.create();
		}
	}
}

module.exports = Mongrator;
