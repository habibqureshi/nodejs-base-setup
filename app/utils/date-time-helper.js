function getDate () {
  let today = new Date()
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  //   const mm = monthNames[today.getMonth()] // January is 0!
  const dd = today.getDate() < 10 ? '0' + today.getDate() : today.getDate()
  const mm = today.getMonth() < 10 ? '0' + today.getMonth() : today.getMonth()
  const yyyy = today.getFullYear()

  //   today = mm + ', ' + dd + ' ' + yyyy
  today = dd + '-' + mm + '-' + yyyy

  return today
}

function getTime () {
  let now = new Date()
  let h = now.getHours()
  let m = now.getMinutes()

  if (h < 10) {
    h = '0' + h
  }

  if (m < 10) {
    m = '0' + m
  }

  now = h + ':' + m
  return now
}
module.exports = {
  getDate,
  getTime
}
