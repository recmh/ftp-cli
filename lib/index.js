#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const cli = require('./cli');

cli().then(server => {
  if (
    !fs.existsSync(server.srcPath) ||
    !fs.lstatSync(server.srcPath).isDirectory()
  ) {
    console.warn(chalk.yellow(`${server.srcPath} is not exit or not directory`));
    process.exit();
  }
  const Upload = require('./upload');
  const uploaderInstance = new Upload(server);
  uploaderInstance.put(
    path.isAbsolute(server.srcPath)?server.srcPath:path.resolve(process.cwd(),server.srcPath),
    path.posix.resolve(server.destPath)
  );
});
