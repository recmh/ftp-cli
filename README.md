# FTP CLI

## install

```bash
npm i -g ftp-cli
or
npm i ftp-cli --save-dev

```

## config

create ftp.config.js at project root directory

### ftp.config.js

```bash
[
  {
    "host":"localhost",
    "port":21,
    "user":"admin",
    "password":"admin",
    "srcPath":"src",
    "destPath":"/admin"
  },
  ...
]
```

detail info about ftp,please look up [node-ftp](https://github.com/mscdex/node-ftp)


## Usage

**ftp-cli**：equal ftp-cli 0


**ftp-cli 0**：use ftp.config.js first option


**ftp-cli --all**：show all ftp
server in ftp.config.js


**ftp-cli --help**：show help for usage

## code

```bash
const Upload = require('ftp-cli');

const uploaderInstance = new Upload(server);
uploaderInstance.put(
  server.srcPath,
  server.destPath
);
```
