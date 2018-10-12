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
  utils: require('../lib/utils'),
}

;(async () => {
  var browser = await puppeteer.launch(options)
  try {
    var events = await lib.dom.sync({
      browser, config, cookie: lib.utils.parseCookie(config.cookie)
    })
    lib.db.sync({events, db, fpath: argv.events})
  }
  catch (err) {
    console.error(err)
  }
  finally {
    browser.close()
  }
})()
