## Description

mongodb 数据备份


## Quick Start
```
var mongoStore = require('mongo-store');

mongoStore.init({

	// 备份数据存储父级目录
	path: dbBackupPath,

	// 数据库连接
	host: CONFIG_DB.host + ':' + CONFIG_DB.port,
	
	// 数据库名称
	name: CONFIG_DB.name,

	// 按日期规则命名的目录(选填)
	dateFormate: 'YYYY.MM.DD',

    // 数据备份根目录(选填)
	dbBackupPath: '/tmp/backup',

	// 保留几天内的备份目录 (选填)
	days:3,

	//压缩文件后缀(选填) (选填)
	tarExt:'.tar.gz'
});

```