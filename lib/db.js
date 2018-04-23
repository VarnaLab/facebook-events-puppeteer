
var fs = require('fs')
var utils = require('./utils')


var sync = ({events, db, fpath}) => {
  // TODO: there is no updated_time == always true
  if (!events.length) {
    return
  }

  events.forEach((event) => {
    var index = db.findIndex((ev) => ev.id === event.id)
    index === -1 ? db.push(event) : db[index] = event
  })

  var updated = utils.stableSort(db, (a, b) =>
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  )

  fs.writeFileSync(fpath, JSON.stringify(updated, null, 2), 'utf-8')
}

module.exports = {sync}
