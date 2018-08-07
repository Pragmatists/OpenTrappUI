[![Build Status](https://secure.travis-ci.org/Pragmatists/OpenTrappUI.png)](http://travis-ci.org/Pragmatists/OpenTrappUI)

OpenTrappUI
===========

Open Time Registration Application

## prerequisites

### Install NodeJS

[https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

### Install node modules (run in project directory)

1. `npm install -g grunt-cli # you might need root privileges` (only needed if you want to use `grunt` globally; if not
  you can use `./node_modules/.bin/grunt` instead)
2. `npm install`

### Run tests

`npm test` or `grunt`

## starting with fake backend serving API

### Run local web application

`npm start` or `grunt server`  

### Run local fake API server
`npm install -g json-server`  
`grunt api` 

### Run local fake API together with local web application

`grunt all` 

change cookie `apiServerUrl` to `http://localhost:3000` to use local backend server


### Other available tasks

Run unit tests in 'single run' mode: `grunt karma:unit`

Run unit tests in 'continuous run' mode with 'autoWatch': `grunt karma:dev`

Re-generate worklog entry parser: `grunt exec:generate_parser`

### Deploment

Deployment is triggered automatically by Travis after each commit to branch master 

Publish manually on Github on PROD: `grunt gh-pages:prod`