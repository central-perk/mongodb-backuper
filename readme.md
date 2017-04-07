## 描述

mongodb-backuper用于mongodb数据备份，基于nodejs实现


## 快速开始
```
var mongodbBackuper = require('mongodb-backuper');
var config = {
	host : '127.0.0.1',
	port : '27017',
	name : 'db_name',
	path : '/tmp/backup/'
};
mongodbBackuper.init({

	// 备份数据存储父级目录
	path: config.path,

	// 数据库连接
	host: config.host + ':' + config.port,

	// 数据库名称
	name: config.name,

	// 按日期规则命名的目录(选填)
	dateFormate: 'YYYY.MM.DD',

	// 保留几天内的备份目录 (选填)
	days: 3
});

```

## 依赖
通过[mongodump](https://docs.mongodb.com/manual/reference/program/mongodump/)命令行完成数据库备份