
var utils = require('./utils')


var getUpcomingEvents = async ({browser, id, wait}) => {
  var page = await browser.newPage()

  await page.goto(`https://www.facebook.com/pg/${id}/events/`)
  await page.waitFor(1000 * wait)

  var ids = await page.evaluate((id) =>
    Array.from(document.querySelectorAll('#pagelet_events > div > div:nth-of-type(2) table tr'))
      .filter((event) => new RegExp(`^https://www.facebook.com/${id}/$`).test(event.querySelector('td:nth-of-type(3) a').href))
      .map((event) => event.querySelector('td:nth-of-type(2) a').pathname.replace(/\/events\/(.*)\//, '$1'))
  , id)

  await page.close()
  return ids
}

var getEvent = async ({browser, id, wait}) => {
  var page = await browser.newPage()

  await page.goto(`https://www.facebook.com/events/${id}/`)
  await page.waitFor(1000 * wait)

  var more = await page.evaluate(() =>
    document.querySelector('.see_more_link')
  )
  if (more) {
    await page.click('.see_more_link')
  }

  var event = await page.evaluate((id) => ({
    id,
    name: document.querySelector('[data-testid=event-permalink-event-name]').innerText,
    description: document.querySelector('[data-testid=event-permalink-details]').innerText,
    cover_desktop: document.querySelector('img.img').getAttribute('src'),
    // TODO: resize with imagemagick
    cover_mobile: document.querySelector('img.img').getAttribute('src'),
    start_time: document.querySelector('._publicProdFeedInfo__timeRowTitle').getAttribute('content').split(' to ')[0],
    end_time: document.querySelector('._publicProdFeedInfo__timeRowTitle').getAttribute('content').split(' to ')[1],
  }), id)

  event.description = event.description
    .replace(/^Подробности\n/, '')
    .replace(/(?:See More)?\n$/, '')
  event.start_time = utils.formatDate(event.start_time)
  event.end_time = utils.formatDate(event.end_time)

  await page.close()
  return event
}

var syncParallel = async ({browser, config}) => {
  var ids = await getUpcomingEvents({browser, id: config.id, wait: config.wait})
  var events = await Promise.all(ids.map((id) => getEvent({browser, id, wait: config.wait})))
  return events
}

var sync = async ({browser, config}) => {
  var events = []
  var ids = await getUpcomingEvents({browser, id: config.id, wait: config.wait})
  for await (var id of ids) {
    events.push(await getEvent({browser, id, wait: config.wait}))
  }
  return events
}

module.exports = {getUpcomingEvents, getEvent, sync}
