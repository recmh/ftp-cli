const meow = require('meow');
const table = require('text-table');
const path = require('path');
const servers = require(path.resolve(process.cwd(),'ftp.config.js'));
const chalk = require('chalk');
const inquirer = require('inquirer');
const cli = meow(
  `
        Usage
    $ ftp-cli <serverIndex>, ftp server index,default 0

        Options
          --all, -a

  Examples
    $ ftp-cli 0
    $ ftp-cli --all
  Help  
    $ ftp-cli --help
`,
  {
    description: false,
    flags: {
      all: {
        type: 'boolean',
        alias: 'a'
      }
    }
  }
);

function getIndex(index) {
  index = new Number(index);
  if (isNaN(index)) index = 0;
  else {
    index = Number.parseInt(index);
    if (index >= servers.length || index < 0) {
      index = 0;
    }
  }
  return index;
}

const options = {
  index: getIndex(cli.input[0]),
  all: cli.flags.all
};

if (cli.flags.help) {
  cli.showHelp(0);
  process.exit();
}

module.exports = async function() {
  if (options.all) {
    const choices = table(servers.map(d => Object.values(d))).split('\n');
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'host',
        message: 'FTP Server List',
        choices: [
          new inquirer.Separator(' '),
          ...choices.map((name, value) => {
            return { name, value, short: servers[value].host };
          }),
          new inquirer.Separator(' '),
          new inquirer.Separator(
            chalk.reset(
              '↑ ↓ to select. Enter to start upload. Control-C to cancel.'
            )
          ),
          new inquirer.Separator(' ')
        ]
      }
    ]);
    return servers[getIndex(answer.host)];
  }
  return servers[options.index];
};