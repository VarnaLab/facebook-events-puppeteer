
var formatDate = (date) => {

  var month = date.getMonth() + 1
  month = month < 10 ? ('0' + month) : month

  var [weekday, _, day, year, time, offset, timezone] = date.toString().split(' ')
  offset = offset.replace('GMT', '')

  return `${year}-${month}-${day}T${time}${offset}`
}

var stableSort = (arr, compare) => arr
  .map((item, index) => ({item, index}))
  .sort((a, b) => compare(a.item, b.item) || a.index - b.index)
  .map(({item}) => item)

var parseCookie = (cookie) => cookie.split(';')
  .map((pair) => (([name, value] = pair.trim().split('=')) => ({
    name: name.trim(),
    value: value.trim(),
    domain: '.facebook.com',
  }))())

module.exports = {formatDate, stableSort, parseCookie}
