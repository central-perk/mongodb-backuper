var path = require('path'),
	fs = require('fs-extra'),
	exec = require('child_process').exec,
	_ = require('lodash'),
	async = require('async'),
	moment = require('moment'),
	config = {
		dateFormate: 'YYYY.MM.DD',
		dbBackupPath: '/tmp/backup',
		prefix: '',
		days: 3,
		tarExt: '.tar.gz',
		tar: true
	},
	Backup = {};
/**
 * [init 数据库备份服务]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
Backup.init = function (options) {
	var dbBackupPath = options.path || config.dbBackupPath, //数据库备份父级目录
		dbHost = options.host, //数据连接
		dbName = options.name, //数据库名称
		prefix = options.prefix || config.prefix, //存储目录前缀
		dateFormate = options.dateFormate || config.dateFormate, //今日备份目录名的时间标示
		todayBackUpName = getDatePath(new Date(), prefix, dateFormate), //今日备份目录名
		todayBackUpPath = path.join(dbBackupPath, todayBackUpName),
		tar = config.tar,
		tarName,
		tarPath; //今日备份目录路径
	if (!dbHost) {
		console.log('[参数缺失] dbHost');
		return;
	}

	if (!dbName) {
		console.log('[参数缺失] dbName');
		return;
	}
	if (!fs.existsSync(dbBackupPath)) {
		//创建数据库备份父级目录
		fs.mkdirsSync(dbBackupPath);
	}

	// if (fs.existsSync(todayBackUpPath)) {
	//     console.log('[已经创建] %s', todayBackUpPath);
	//     return;
	// }
	async.waterfall([
        //dump
        function (cb) {
			console.log('[开始备份] %s %s ', dbHost, dbName);
			var cmdStr = 'mongodump -h ' + dbHost + ' -d ' + dbName + ' -o ' + todayBackUpPath;
			exec(cmdStr, function (err) {
				if (!err) {
					console.log('[成功创建] %s', todayBackUpPath);
					cb(null);
				} else {
					console.log(err);
					console.log('[指令执行失败] %s', cmdStr);
					cb(err);
				}
			});
        },
        //tar
        function (cb) {
			if (tar) {
				tarName = todayBackUpName + config.tarExt;
				tarPath = path.join(dbBackupPath, tarName);
				console.log('[开始压缩] %s', todayBackUpPath);
				exec('tar -cPzf ' + tarName + ' ' + todayBackUpName, {
					cwd: dbBackupPath
				}, function (err) {
					if (!err) {
						console.log('[成功创建] %s', tarPath);
						cb(null, tarPath);
					} else {
						console.log(err);
						cb(err);
					}
				});
			} else {
				cb(null);
			}
        }
    ], function (err, result) {
		if (!err) {
			if (tar) {
				exec('rm -rf ' + todayBackUpPath, function (err) {
					if (!err) {
						console.log('[清理文件] %s', todayBackUpPath);
						console.log('------------------------------------------------------------------------------------------------------------------');
						console.log('[下载指令] %s', 'scp  <sshName>:' + tarPath + ' ' + tarName);
						console.log('------------------------------------------------------------------------------------------------------------------');
					} else {
						console.log(err);
					}
				});

				//清理历史数据
				var currentPaths = fs.readdirSync(dbBackupPath),
					effectPaths = getDaysInnerPath(prefix, dateFormate, options.days || config.days);
				console.log('[保留数据] %s', effectPaths[1] + '~' + effectPaths[effectPaths.length - 1]);
				for (var i = 0, len = currentPaths.length; i < len; i++) {
					if (_.indexOf(effectPaths, currentPaths[i]) < 0) {
						var rmFile = path.join(dbBackupPath, currentPaths[i]);
						exec('rm -rf ' + rmFile, function (err) {
							if (!err) {
								console.log('[清理过期文件] %s', rmFile);
							} else {
								console.log(err);
							}
						});
					}
				}
			}
		} else {
			console.log(err);
			console.log('[备份失败] %s %s', dbHost, dbName);
		}
	});
};

function getDatePath(date, prefix, dateFormate) {
	var dir = moment(date)
		.format(dateFormate);
	return prefix + dir;
}

//获取几天内的目录
function getDaysInnerPath(prefix, dateFormate, days) {
	days = days || 1;
	var now = new Date(),
		pathArray = [];
	for (var i = days - 1; i >= 0; i--) {
		var pathName = getDatePath(new Date(now.getTime() - i * 24 * 60 * 60 * 1000), prefix, dateFormate);
		pathArray.push(pathName);
		pathArray.push(pathName + config.tarExt);
	}
	return pathArray;
}
module.exports = Backup;