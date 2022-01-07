## Introduction
[![NPM](https://nodei.co/npm/mongodb-backuper.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/mongodb-backuper/)
[![NPM](https://nodei.co/npm-dl/mongodb-backuper.png?months=9&height=3)](https://nodei.co/npm/mongodb-backuper/)

mongodb-backuper is a mongodb data backup tool based on nodejs. It is very simple, easy to use and free to define your backup rules


## Quick Start
```
var mongodbBackuper = require('mongodb-backuper');
var config = {
	host : '127.0.0.1',
	port : '27017',
	name : 'db_name',
	path : '/tmp/backup/'
};
mongodbBackuper.init({

	// Backup data storage parent directory
	path: config.path,

	// Database Connectivity
	host: config.host + ':' + config.port,

	// Name database
	name: config.name,

	// Directory named according to date rules (optional)
	dateFormate: 'YYYY.MM.DD',

	// Keep the backup directory within a few days (optional)
	days: 3
});

```

## Dependency
use [mongodump](https://docs.mongodb.com/manual/reference/program/mongodump/) Complete database backup from the command line

## License
[MIT](https://choosealicense.com/licenses/mit/)
