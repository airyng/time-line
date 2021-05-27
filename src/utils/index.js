import moment from 'moment'

const getMonthNum = (monthName) => {
  monthName = monthName.toLowerCase()
  if (monthName.indexOf('январ') === 0) return '01'
  if (monthName.indexOf('феврал') === 0) return '02'
  if (monthName.indexOf('март') === 0) return '03'
  if (monthName.indexOf('апрел') === 0) return '04'
  if (monthName.indexOf('ма') === 0) return '05'
  if (monthName.indexOf('июн') === 0) return '06'
  if (monthName.indexOf('июл') === 0) return '07'
  if (monthName.indexOf('август') === 0) return '08'
  if (monthName.indexOf('сентябр') === 0) return '09'
  if (monthName.indexOf('октябр') === 0) return '10'
  if (monthName.indexOf('ноябр') === 0) return '11'
  if (monthName.indexOf('декабр') === 0) return '12'
  return false
}

const defineDateFormat = (dateString) => {
  const defaultFormat = 'DD.MM.YYYY'
  let date = dateString.trim().toLowerCase()
  if (date.indexOf('завтра') !== -1) {
    return defaultFormat
  }
  else if (date.indexOf('cегодня') !== -1) {
    return defaultFormat
  }
  else if (date.indexOf('вчера') !== -1) {
    return defaultFormat
  }
  else if (date.indexOf('-') !== -1) {
    const eraFromat = date.indexOf('-') === 0 ? ' NNNNN' : '' // Before our era
    if (date.indexOf(':') !== -1) {
      return 'DD.MM.YYYY HH:mm:ss' + eraFromat
    } else {
      return 'DD.MM.YYYY' + eraFromat
    }
  }
  else if (date.indexOf(' ') !== -1 && date.indexOf('г.') !== -1) {
    date = date.replace(' г.', '')
    const eraFromat = date.indexOf('до н.э.') !== -1 ? ' NNNNN' : '' // Before our era
    date = date.replace(' до н.э.', '')
    const dateArr = date.trim().split(' ')
    if (dateArr[3] && dateArr[3].indexOf(':') !== -1) {
      return 'DD.MM.YYYY HH:mm:ss' + eraFromat
    } else {
      return 'DD.MM.YYYY' + eraFromat
    }
  }
  return false
}

const convertAnyDateToUnix = (dateString) => {
  let date = dateString.trim().toLowerCase()

  if (date.indexOf('завтра') !== -1) {
    return moment().add(1, 'day').unix()
  }
  else if (date.indexOf('cегодня') !== -1) {
    return moment().unix()
  }
  else if (date.indexOf('вчера') !== -1) {
    return moment().subtract(1, 'day').unix()
  }
  else if (date.indexOf('-') !== -1) {
    const isBC = date.indexOf('-') === 0 ? ' BC' : '' // Before our era
    const eraFromat = date.indexOf('-') === 0 ? ' NNNNN' : '' // Before our era
    if (date.indexOf('-') === 0) {
      date = date.replace('-', '')
    }
    if (date.indexOf(':') !== -1) {
      return moment(date + isBC, 'YYYY-MM-DD HH:mm:ss' + eraFromat).unix()
    } else {
      return moment(date + isBC, 'YYYY-MM-DD' + eraFromat).unix()
    }
  }
  else if (date.indexOf(' ') !== -1 && date.indexOf('г.') !== -1) {
    date = date.replace(' г.', '')
    const isBC = date.indexOf('до н.э.') !== -1 ? ' BC' : '' // Before our era
    const eraFromat = date.indexOf('до н.э.') !== -1 ? ' NNNNN' : '' // Before our era
    date = date.replace(' до н.э.', '')
    const dateArr = date.trim().split(' ')
    // console.log(`${dateArr[0]} ${getMonthNum(dateArr[1])} ${dateArr[2]} ${dateArr[3]}${isBC}`)
    if (dateArr[3] && dateArr[3].indexOf(':') !== -1) {
      return moment(`${dateArr[0]} ${getMonthNum(dateArr[1])} ${dateArr[2]} ${dateArr[3]}${isBC}`, 'DD MM YYYY HH:mm:ss' + eraFromat).unix()
    } else {
      return moment(`${dateArr[0]} ${getMonthNum(dateArr[1])} ${dateArr[2]}${isBC}`, 'DD MM YYYY' + eraFromat).unix()
    }
  }
  return moment(date).unix()
}

const getValueBetweenRange = (startValue, endValue, percent) => {
  return (endValue - (((endValue - startValue) * percent)/100))
}

const getPercent = (startValue, endValue, curValue) => {
  const diff = endValue - startValue
  const x = curValue - startValue
  return 100*x/diff
}

export {
  getMonthNum,
  convertAnyDateToUnix,
  defineDateFormat,
  getValueBetweenRange,
  getPercent
}