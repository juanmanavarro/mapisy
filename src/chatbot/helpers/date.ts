import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isToday from 'dayjs/plugin/isToday';
import * as isTomorrow from 'dayjs/plugin/isTomorrow';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';

require('dayjs/locale/es');

dayjs.locale('es')
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(customParseFormat);

dayjs.extend(LocalizedFormat)

dayjs.tz.setDefault('Europe/Madrid');

dayjs.extend((option, dayjsClass, dayjsFactory) => {
  dayjsClass.prototype.toISOString = function() {
    return this.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  }
});

export class DateHelper {
  static dayjs(date = undefined, format = undefined) {
    return dayjs(date, format);
  }

  static now() {
    return dayjs();
  }

  static isValid(date) {
    return dayjs(date).isValid();
  }

  static isToday(date, timezone) {
    return dayjs(date).tz(timezone).isToday();
  }

  static isTomorrow(date, timezone) {
    return dayjs(date).tz(timezone).isTomorrow();
  }

  static isPast(date: Date | string) {
    return dayjs().isAfter(date);
  }

  static currentTime(timezone: string) {
    return dayjs().tz(timezone).format('HH:mm');
  }

  static isNextMinute(date: Date | string) {
    return dayjs().utc().add(1, 'minute').startOf('minute').isSameOrBefore(date);
  }

  static format(date: Date | string, format: string, timezone: string = null) {
    if ( !timezone ) return dayjs(date).format(format);
    return dayjs(date).tz(timezone).format(format);
  }

  static toUTC(date: Date | string, timezone: string) {
    return dayjs.tz(date, timezone).utc().toISOString()
  }

  static add(date: Date | string, amount: number = 0, unit: dayjs.ManipulateType = 'day') {
    return dayjs(date).add(amount, unit);
  }

  static greeting() {
    const now = dayjs();

    if ( now.isAfter('6:00', 'hour') && now.isBefore('12:00', 'hour') ) {
      return 'buenos días';
    } else if ( now.isAfter('12:00', 'hour') && now.isBefore('21:00', 'hour') ) {
      return 'buenas tardes';
    } else if ( now.isAfter('21:00', 'hour') && now.isBefore('6:00', 'hour') ) {
      return 'buenas noches';
    }

    return 'muy buenas';
  }
}
