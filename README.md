# mongrator

![](https://img.shields.io/badge/mongrator-v1.0.0-green.svg) ![](https://img.shields.io/badge/tests-only%20API-red.svg)

Create, list, do and undo migrations for mongo databases with mongoose and models. CLI and API.

[![NPM](https://nodei.co/npm/mongrator.png?stars&downloads)](https://www.npmjs.com/package/mongrator)

## Installation

`$ npm i -s mongrator`

## Usage

### CLI

#### Guide

```$ mongrator

Create, list, do and undo migrations for mongo databases with mongoose and models.

Commands:
  mongrator create  Create a new migration
  mongrator up      Run up migration(s)
  mongrator down    Run down migration(s)
  mongrator list    List the status of the migrations

Options:
  --help        Show help                                                                            [boolean]
  --version     Show version number                                                                  [boolean]
  --url         URL of the database                       [string] [default: "mongodb://localhost:27017/test"]
  --debug       To log or not to log                                                 [boolean] [default: true]
  --logger      File (*.js) that gets the logger function                                             [string]
  --folder      Folder of the migrations                                   [string] [default: "db/migrations"]
  --collection  Name for the collection of the migrations       [string] [default: "DatabaseMigrationsStatus"]
  --mongoose    File (*.js) that gets the mongoose instance                                           [string]
  --keep-alive  To leave the connection opened after the command or not             [boolean] [default: false]
  --options     File (*.js) that gets the options of the db connection                                [string]
```

Type `mongrator <subcommand>` to see the help of any subcommand.

#### CLI Examples

##### `mongrator up` and `mongrator down`

```
$ mongrator up                                             # or <mongrator down>
    --quantity 1                                           # Execute only 1 migration
    --url mongodb://user@pass:ip.domain:27017/mydatabase   # Specify the URL of the database
    --folder database/migrations/folder                    # Folder of the migration files
    --collection CollectionForMigrationsInMyDatabase       # Name of the collection for the migrations in the database
    --debug false                                          # Disable debugging
    --keep-alive true                                      # Do not close connection once done
    --logger my/file/to/my/logger.js                       # Load your custom logger function from a file
    --mongoose database/mongoose/loader.js                 # Load your custom mongoose instance
    --options database/configurations/loader.js            # Load your configurations for the connection
```

##### `mongrator list`

```
$ mongrator list
    --url mongodb://user@pass:ip.domain:27017/mydatabase   # Specify the URL of the database
    --folder database/migrations/folder                    # Folder of the migration files
    --collection CollectionForMigrationsInMyDatabase       # Name of the collection for the migrations in the database
    --keep-alive true                                      # Do not close connection once done
    --logger my/file/to/my/logger.js                       # Load your custom logger function from a file
    --mongoose database/mongoose/loader.js                 # Load your custom mongoose instance
    --options database/configurations/loader.js            # Load your configurations for the connection
```

##### `mongrator create`

```
$ mongrator list
    --name migration-name                                  # Specify the name of the migration
    --template-path path/to/your/migrations-template.js    # Specify the template file for the new migration
    --url mongodb://user@pass:ip.domain:27017/mydatabase   # Specify the URL of the database
    --folder database/migrations/folder                    # Folder of the migration files
    --collection CollectionForMigrationsInMyDatabase       # Name of the collection for the migrations in the database
    --keep-alive true                                      # Do not close connection once done
    --logger my/file/to/my/logger.js                       # Load your custom logger function from a file
    --mongoose database/mongoose/loader.js                 # Load your custom mongoose instance
    --options database/configurations/loader.js            # Load your configurations for the connection
```

In case you needed to provide credentials secretly and/or through environmental variables, you can also:

```
$ mongrator <subcommand>
    --config-file path/to/migrations-config.js             # Specify all the options through a file
```

### API

The API accepts almost the same options as the CLI.

These are the default options:

```js
{
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
  quantity: -1, // This means "all the possible migrations"
  templatePath: `${__dirname}/template/migration.js`, // This points to the same project, not the current working directory
  options: {}
}
```

#### API examples

The same commands we showed previously for the CLI, in the API would look like follows.

But first, import the API.

```js
const Mongrator = require("Mongrator");
```

Then, each command:

##### `mongrator up` and `mongrator down`

```js
const mongrator = new Mongrator({
  quantity: 1,
  url: "mongodb://user@pass:ip.domain:27017/mydatabase",
  folder: "database/migrations/folder",
  collection: "CollectionForMigrationsInMyDatabase",
  debug: false,
  keepAlive: true,
  logger: require("./my/file/to/my/logger.js"),
  mongoose: require("./database/mongoose/loader.js"),
  options: require("./database/configurations/loader.js")
});
mongrator.up();
```

##### `mongrator list`

```js
const mongrator = new Mongrator({
  url: "mongodb://user@pass:ip.domain:27017/mydatabase",
  folder: "database/migrations/folder",
  collection: "CollectionForMigrationsInMyDatabase",
  keepAlive: true,
  logger: require("./my/file/to/my/logger.js"),
  mongoose: require("./database/mongoose/loader.js"),
  options: require("./database/configurations/loader.js")
});
mongrator.list();
```

##### `mongrator create`

```js
const mongrator = new Mongrator({
  name: "migratio-name",
  templatePath: "path/to/your/migrations-template.js",
  url: "mongodb://user@pass:ip.domain:27017/mydatabase",
  folder: "database/migrations/folder",
  collection: "CollectionForMigrationsInMyDatabase",
  keepAlive: true,
  logger: require("./my/file/to/my/logger.js"),
  mongoose: require("./database/mongoose/loader.js"),
  options: require("./database/configurations/loader.js")
});
mongrator.create();
```

In case you needed to provide credentials secretly and/or through environmental variables, you can also:

```js
const mongrator = new Mongrator(require("path/to/migrations-config.js"));
```

### Migration files

The migration files are very simple. They all return an object with:
   - an `up` asynchronous method
   - a `down` asynchronous method

By being an *asynchronous* method, it means that it must return a `Promise`.

The default template file looks like this:

```js
module.exports = {
  up: async function(mongoose, migrator) {
    // @TODO: migration up here...
  },
  down: async function(mongoose, migrator) {
    // @TODO: migration down here...
  }
};
```

You can find examples of this kind of files in `test/db/migrations/*.js` and on `test/mongrator.test.js` files.

For example, the `test/db/migrations/001-first.js` file, which loads a model, saves an instance and queries the collection:

```js
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
```

### API logging

The logging is colorized to easily understand what is going on.

   - On **blue**, the informative logs.

   - On **red**, the error logs.

   - On **green**, the positive logs.

   - On **yellow**, the warning logs.

Also, there is a special notation at the begining of each line:

   - `[ ]`: no changes. No persistent operations present.
   - `[·]`: soft changes. Operations that leave digital fingerprint, like `SELECTS` in database.
   - `[#]`: hard changes. Operations that leave digital fingerprint and modify resources on the machine, like `INSERTS, UPDATES, DELETES` in database, or writing to files.

This nomenclature informs about the type of operation carried by each step of the process.

## Tests

**Important: the tests will drop all the items at the `User` collection.**

To run the tests you need to:

### 1) Start database

There is a script that creates a database for the default URL at `test/db/data`.

`$ npm run test:start:db`

### 2) Run tests

To run the tests (only API at the moment) you do:

`$ npm run test`

Note: for further doubts, it is good to check the tests.

## Coverage

Right now I am not doing code coverage of this project. If the usage of the tool is extended, I surely will.

## Issues

You can add your issues [here](https://github.com/allnulled/mongrator/issues/new).

## Contributions

As I usually work isolatedly because companies in Spain do not want me to work with them, I am not very aware about how to cooperate on git for software development.

So, please, give me a job, and I most probably will learn as soon as possible how to fulfill this part of the README file.

*My life is a demonstrations that Gods exist. Some may call me "fool", but with that they probe them. They probe that Gods do not like me, and they want me to be ridiculous and crazy among a civilization of monkeys unable to share knowledge, differently of what I do most of the time with you, lovely monkeys.*
