
var formatDate = (date) => {
  var input = new Date(date)

  var month = input.getMonth() + 1
  month = month < 10 ? ('0' + month) : month

  var [weekday, _, day, year, time, offset, timezone] = input.toString().split(' ')
  offset = offset.replace('GMT', '')

  return `${year}-${month}-${day}T${time}${offset}`
}

var stableSort = (arr, compare) => arr
  .map((item, index) => ({item, index}))
  .sort((a, b) => compare(a.item, b.item) || a.index - b.index)
  .map(({item}) => item)

module.exports = {formatDate, stableSort}
