
var request = require('request-compose').client
var he = require('he')
var dom = require('./dom')
var utils = require('./utils')


var getEvent = async (id) => {
  var {body} = await request({
    url: `https://www.facebook.com/events/${id}/`,
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    }
  })

  var [_, name] = body.match(/<meta property="og:title" content="([^"]+)" \/>/)
  // TODO: description is not full - should be rendered from data-testid="event-permalink-details"
  var [_, description] = body.match(/<meta property="og:description" content="([^"]+)" \/>/)
  var [_, image] = body.match(/<meta property="og:image" content="([^"]+)" \/>/)
  var [_, interval] = body.match(/<div class="_publicProdFeedInfo__timeRowTitle[^"]+" content="([^"]+)"/)
  var [start_time, end_time] = interval.split(' to ')
  
  return {
    id,
    name: he.decode(name),
    description: he.decode(description),
    cover_desktop: image,
    // TODO: resize with imagemagick
    cover_mobile: image,
    start_time: utils.formatDate(start_time),
    end_time: utils.formatDate(end_time),
  }
}

var sync = async ({browser, config}) => {
  var ids = await dom.getUpcomingEvents({browser, id: config.id, wait: config.wait})
  var events = await Promise.all(ids.map(getEvent))
  return events
}

module.exports = {getEvent, sync}
