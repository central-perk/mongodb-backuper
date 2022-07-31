var path = require("path"),
  fs = require("fs-extra"),
  exec = require("child_process").exec,
  _ = require("lodash"),
  async = require("async"),
  moment = require("moment"),
  config = {
    dateFormate: "YYYY.MM.DD",
    dbBackupPath: "/tmp/backup",
    prefix: "",
    days: 3,
    tarExt: ".tar.gz",
    tar: true,
  },
  Backup = {};
/**
 * [init database backup service]
 * @param {[type]} options [description]
 * @return {[type]} [description]
 */
Backup.init = function (options) {
  var dbBackupPath = options.path || config.dbBackupPath, //Database backup parent directory
    dbHost = options.host, //data connection
    dbName = options.name, //database name
    prefix = options.prefix || config.prefix, //Storage directory prefix
    dateFormate = options.dateFormate || config.dateFormate, //Time stamp of today's backup directory name
    todayBackUpName = getDatePath(new Date(), prefix, dateFormate), //Today's backup directory name
    todayBackUpPath = path.join(dbBackupPath, todayBackUpName),
    tar = config.tar,
    tarName,
    tarPath; //Today's backup directory path
  if (!dbHost) {
    console.log("[parameter missing] dbHost");
    return;
  }

  if (!dbName) {
    console.log("[parameter missing] dbName");
    return;
  }
  if (!fs.existsSync(dbBackupPath)) {
    //Create database backup parent directory
    fs.mkdirsSync(dbBackupPath);
  }

  // if (fs.existsSync(todayBackUpPath)) {
  // console.log('[created] %s', todayBackUpPath);
  // return;
  // }
  async.waterfall(
    [
      //dump
      function (cb) {
        console.log("[Start backup] %s %s ", dbHost, dbName);
        var cmdStr =
          "mongodump -h " + dbHost + " -d " + dbName + " -o " + todayBackUpPath;
        exec(cmdStr, function (err) {
          if (!err) {
            console.log("[Successfully created] %s", todayBackUpPath);
            cb(null);
          } else {
            console.log(err);
            console.log("[command execution failed] %s", cmdStr);
            cb(err);
          }
        });
      },
      //tar
      function (cb) {
        if (tar) {
          tarName = todayBackUpName + config.tarExt;
          tarPath = path.join(dbBackupPath, tarName);
          console.log("[Start compression] %s", todayBackUpPath);
          exec(
            "tar -cPzf " + tarName + " " + todayBackUpName,
            {
              cwd: dbBackupPath,
            },
            function (err) {
              if (!err) {
                console.log("[Successfully created] %s", tarPath);
                cb(null, tarPath);
              } else {
                console.log(err);
                cb(err);
              }
            }
          );
        } else {
          cb(null);
        }
      },
    ],
    function (err, result) {
      if (!err) {
        if (tar) {
          exec("rm -rf " + todayBackUpPath, function (err) {
            if (!err) {
              console.log("[clean file] %s", todayBackUpPath);
              console.log(
                "-------------------------------------------- -------------------------------------------------- -------------------"
              );
              console.log(
                "[Download command] %s",
                "scp <sshName>:" + tarPath + " " + tarName
              );
              console.log(
                "-------------------------------------------- -------------------------------------------------- -------------------"
              );
            } else {
              console.log(err);
            }
          });

          //clean up historical data
          var currentPaths = fs.readdirSync(dbBackupPath),
            effectPaths = getDaysInnerPath(
              prefix,
              dateFormate,
              options.days || config.days
            );
          console.log(
            "[Retain data] %s",
            effectPaths[1] + "~" + effectPaths[effectPaths.length - 1]
          );
          for (var i = 0, len = currentPaths.length; i < len; i++) {
            if (_.indexOf(effectPaths, currentPaths[i]) < 0) {
              var rmFile = path.join(dbBackupPath, currentPaths[i]);
              exec("rm -rf " + rmFile, function (err) {
                if (!err) {
                  console.log("[Clear expired files] %s", rmFile);
                } else {
                  console.log(err);
                }
              });
            }
          }
        }
      } else {
        console.log(err);
        console.log("[Backup failed] %s %s", dbHost, dbName);
      }
    }
  );
};

function getDatePath(date, prefix, dateFormate) {
  var dir = moment(date).format(dateFormate);
  return prefix + dir;
}

//Get the directory within days
function getDaysInnerPath(prefix, dateFormate, days) {
  days = days || 1;
  var now = new Date(),
    pathArray = [];
  for (var i = days - 1; i >= 0; i--) {
    var pathName = getDatePath(
      new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
      prefix,
      dateFormate
    );
    pathArray.push(pathName);
    pathArray.push(pathName + config.tarExt);
  }
  return pathArray;
}
module.exports = Backup;
