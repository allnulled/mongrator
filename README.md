# mongrator

![](https://img.shields.io/badge/mongrator-v1.0.0-green.svg) ![](https://img.shields.io/badge/tests-only API-red.svg)

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

#### Examples

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



## Tests

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


