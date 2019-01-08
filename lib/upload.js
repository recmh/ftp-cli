const Client = require('ftp');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const moment = require('moment');

/**
 *
 * @param {Client} client：ftp客户端实例
 * @param {String} src：目录
 * @param {String} dest：ftp目录
 */
async function upload(client, src, dest) {
  let files = fs.readdirSync(src);
  for (let index = 0; index < files.length; index++) {
    let file = files[index];
    let filePath = path.join(src, file),
      destPath = path.posix.join(dest, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      await mkdir(client, destPath);
      await upload(client, filePath, destPath);
    } else {
      await new Promise(resolve => {
        const spinner = ora(`${destPath}`).start();
        client.put(filePath, destPath, err => {
          if (!err)
            spinner.succeed(
              `[${moment().format('HH:mm:ss')}] ` +
              chalk.green('[文件]') +
              ` : ${destPath}`
            );
          else
            spinner.fail(
              `[${moment().format('HH:mm:ss')}] ` +
              chalk.red('[文件]') +
              ` : ${destPath}`
            );
          resolve();
        });
      });
    }
  }
}

function mkdir(client, directory) {
  return new Promise(resolve => {
    const spinner = ora(`${directory}`).start();
    client.mkdir(directory, function (err) {
      if (!err) {
        spinner.succeed(
          `[${moment().format('HH:mm:ss')}] ` +
          chalk.green('[目录]') +
          ` : ${directory}`
        );
      }
      spinner.stop();
      resolve();
    });
  });
}

function task(server, fn) {
  let clientInstance = new Client(),
    login = false;
  clientInstance.on('error', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    if (login) return;
    login = true;
    spinner.fail(chalk.red(`connect to ${server.host}:${server.port} failed`));
  });
  clientInstance.on('ready', async () => {
    spinner.succeed(
      chalk.green(`connect to ${server.host}:${server.port} successfully`)
    );
    await fn.call(clientInstance);
    clientInstance.end();
    clientInstance = null;
  });
  clientInstance.connect(server);
  const spinner = ora(
    chalk.green(`connecting to ${server.host}:${server.port} ...`)
  ).start();
}

class Upload {
  constructor(server) {
    this.server = server;
  }

  put(src, dest) {
    task(this.server, async function () {
      const success = await new Promise(resolve => {
        let dir = path.basename(dest),
          hasDir = false;
        this.list(path.join(dest, '..'), (err, list) => {
          if (err) {
            console.error(err);
            process.exit();
          }
          for (let index = 0; index < list.length; index++) {
            let data = list[index];
            if (data.type === 'd' && data.name === dir) {
              hasDir = true;
              break;
            }
          }
          if (!hasDir) ora('').fail(chalk.red(`${dest} not exit on ftp server`));
          resolve(hasDir);
        });
      });
      success && await upload(this, src, dest);
    });
  }
}

module.exports = Upload;