## Introduction

mongodb-backuper is used for mongodb data backup, based on nodejs implementation


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
