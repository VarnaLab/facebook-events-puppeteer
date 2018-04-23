#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))

if (argv.help) {
  console.log(`
    --config  /path/to/config.json
    --events  /path/to/events.json
    --env     environment
  `)
  process.exit()
}

var env = argv.env || process.env.NODE_ENV || 'development'
var config = require(argv.config)[env]
var db = require(argv.events)

var puppeteer = require('puppeteer')
var options = {
  // headless: false,
  // slowMo: 300,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],
}

var lib = {
  dom: require('../lib/dom'),
  html: require('../lib/html'),
  db: require('../lib/db'),
}

puppeteer.launch(options).then((browser) => {
  setInterval(() =>
    lib.dom/*html*/.sync({browser, config, db})
      .then((events) => lib.db.sync({events, db, fpath: argv.events}))
      .catch(console.error)
    , 1000 * 60 * config.interval)
  })
  .catch(console.error)
