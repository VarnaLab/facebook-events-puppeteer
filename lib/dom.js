
var utils = require('./utils')


var getUpcomingEvents = async ({browser, id, wait, cookie}) => {
  var page = await browser.newPage()

  await page.setCookie(...cookie)
  await page.goto(`https://www.facebook.com/pg/${id}/events/`)
  await page.waitFor(1000 * wait)

  var ids = await page.evaluate((id) =>
    Array.from(document.querySelectorAll('#upcoming_events_card > div > div')).slice(1)
      // .filter((event) => {
      //   var a = event.querySelector('td:nth-of-type(3) a')
      //   var span = event.querySelector('td:nth-of-type(3) span')
      //   return (
      //     a ? new RegExp(`^https://www.facebook.com/${id}/$`).test(a.href) :
      //     span ? span.innerText === 'VarnaLab' :
      //     false
      //   )
      // })
      .map((event) => event.querySelector('td:nth-of-type(2) a').pathname.replace(/\/events\/(.*)\//, '$1'))
  , id)

  await page.close()
  return ids
}

var getEvent = async ({browser, id, wait, cookie}) => {
  var page = await browser.newPage()

  await page.setCookie(...cookie)
  await page.goto(`https://www.facebook.com/events/${id}/`)
  await page.waitFor(1000 * wait)

  var more = await page.evaluate(() =>
    document.querySelector('.see_more_link')
  )
  if (more) {
    await page.click('.see_more_link')
  }

  var event = await page.evaluate((id) => {
    var name =
      document.querySelector('[data-testid=event-permalink-event-name]')
        .innerText

    var host =
      document.querySelector('[data-testid=event_permalink_feature_line]')
        .innerText

    var description =
      document.querySelector('[data-testid=event-permalink-details]').innerText

    var cover =
      document.querySelector('#event_header_primary img').getAttribute('src')

    var [start_time, end_time] =
      document.querySelector('#event_time_info [content*="2"]')
        .getAttribute('content').split(' to ')

    return {
      id, name, host, description,
      cover_desktop: cover, cover_mobile: cover,
      start_time, end_time,
    }
  }, id)

  event.description = event.description
    .replace(/^Подробности\n/, '')
    .replace(/(?:See More)?\n$/, '')

  var start = new Date(event.start_time)
  event.start_time = utils.formatDate(start)
  event.end_time = utils.formatDate(event.end_time
    ? new Date(event.end_time)
    : new Date(start.setHours(start.getHours() + 2))
  )

  await page.close()
  return event
}

var syncParallel = async ({browser, config}) => {
  var ids = await getUpcomingEvents({browser, id: config.id, wait: config.wait})
  var events = await Promise.all(ids.map((id) => getEvent({browser, id, wait: config.wait})))
  return events
}

var sync = async ({browser, config, cookie}) => {
  var events = []
  var ids = await getUpcomingEvents({browser, id: config.id, wait: config.wait, cookie})
  for await (var id of ids) {
    var event = await getEvent({browser, id, wait: config.wait, cookie})
    if (/VarnaLab/.test(event.host)) {
      events.push(event)
    }
  }
  return events
}

module.exports = {getUpcomingEvents, getEvent, sync}
