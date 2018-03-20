const Extra = require('telegraf').Extra;

class CalendarHelper {
	constructor(options) {
		this.options = Object.assign({
			startWeekDay: 0,
			weekDayNames: ["S", "M", "T", "W", "T", "F", "S"],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun",
				"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			],
			minDate: null,
			maxDate: null
		}, options);
	}

	getCalendarMarkup(date) {
		return Extra.HTML().markup((m) => {
			return m.inlineKeyboard(this.getPage(m, date));
		});
	}

	setMinDate(date) {
		this.options.minDate = date;
	}

	setMaxDate(date) {
		this.options.maxDate = date;
	}

	setWeekDayNames(names) {
		this.options.weekDayNames = names;
	}

	setMonthNames(names) {
		this.options.monthNames = names;
	}

	setStartWeekDay(startDay) {
		this.options.startWeekDay = startDay;
	}

	addHeader(page, m, date) {
		let monthName = this.options.monthNames[date.getMonth()];
		let year = date.getFullYear();

		let header = [];

		if (this.isInMinMonth(date)) {
			// this is min month, I push an empty button
			header.push(m.callbackButton(" ", "calendar-telegram-ignore"));
		}
		else {
			header.push(m.callbackButton("<", "calendar-telegram-prev-" + CalendarHelper.toYyyymmdd(date)));
		}

		header.push(m.callbackButton(monthName + " " + year, "calendar-telegram-ignore"));

		if (this.isInMaxMonth(date)) {
			// this is max month, I push an empty button
			header.push(m.callbackButton(" ", "calendar-telegram-ignore"));
		}
		else {
			header.push(m.callbackButton(">", "calendar-telegram-next-" + CalendarHelper.toYyyymmdd(date)));
		}

		page.push(header);

		page.push(this.options.weekDayNames.map(e => m.callbackButton(e, "calendar-telegram-ignore")));
	}

	addDays(page, m, date) {
		let maxMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		let maxDay = this.getMaxDay(date);
		let minDay = this.getMinDay(date);

		let currentRow = new Array(7).fill(m.callbackButton(" ", "calendar-telegram-ignore"));
		for (var d = 1; d <= maxMonthDay; d++) {
			date.setDate(d);

			let weekDay = this.normalizeWeekDay(date.getDay());
			//currentRow[weekDay] = CalendarHelper.toYyyymmdd(date);
			if (d < minDay || d > maxDay) {
				currentRow[weekDay] = m.callbackButton(CalendarHelper.strikethroughText(d.toString()), "calendar-telegram-ignore");
			}
			else {
				currentRow[weekDay] = m.callbackButton(d.toString(), "calendar-telegram-date-" + CalendarHelper.toYyyymmdd(date));
			}

			if (weekDay == 6 || d == maxMonthDay) {
				page.push(currentRow);
				currentRow = new Array(7).fill(m.callbackButton(" ", "calendar-telegram-ignore"));
			}
		}
	}

	getPage(m, date) {
		let page = [];
		this.addHeader(page, m, date);
		this.addDays(page, m, date);
		return page;
	}

	normalizeWeekDay(weekDay) {
		let result = weekDay - this.options.startWeekDay;
		if (result < 0) result += 7;
		return result;
	}

	/**
	 * Calculates min day depending on input date and minDate in options
	 * 
	 * @param {*Date} date Test date
	 * 
	 * @returns int
	 */
	getMinDay(date) {
		let minDay;
		if (this.isInMinMonth(date)) {
			minDay = this.options.minDate.getDate();
		}
		else {
			minDay = 1;
		}

		return minDay;
	}

	/**
	 * Calculates max day depending on input date and maxDate in options
	 * 
	 * @param {*Date} date Test date
	 * 
	 * @returns int
	 */
	getMaxDay(date) {
		let maxDay;
		if (this.isInMaxMonth(date)) {
			maxDay = this.options.maxDate.getDate();
		}
		else {
			maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		}

		return maxDay;
	}

	static toYyyymmdd(date) {
		let mm = date.getMonth() + 1; // getMonth() is zero-based
		let dd = date.getDate();

		return [
			date.getFullYear(),
			(mm > 9 ? '' : '0') + mm,
			(dd > 9 ? '' : '0') + dd
		].join('-');
	}

	/**
	 * Check if inupt date is in same year and month as min date
	 */
	isInMinMonth(date) {
		return CalendarHelper.isSameMonth(this.options.minDate, date);
	}

	/**
	 * Check if inupt date is in same year and month as max date
	 */
	isInMaxMonth(date) {
		return CalendarHelper.isSameMonth(this.options.maxDate, date);
	}

	/**
	 * Check if myDate is in same year and month as testDate
	 * 
	 * @param {*Date} myDate input date
	 * @param {*Date} testDate test date
	 * 
	 * @returns bool
	 */
	static isSameMonth(myDate, testDate) {
		if (!myDate) return false;

		testDate = testDate || new Date();

		return myDate.getFullYear() === testDate.getFullYear() && myDate.getMonth() === testDate.getMonth();
	}

	/**
	 * This uses unicode to draw strikethrough on text
	 * @param {*String} text text to modify
	 */
	static strikethroughText(text) {
		return text.split('').reduce(function (acc, char) {
			return acc + char + '\u0336';
		}, '');
	}
}

module.exports = CalendarHelper;