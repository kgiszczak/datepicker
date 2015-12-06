(function($) {
  'use strict';

  var DEFAULTS = {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    container: '<div class="datepicker" tabindex="0"></div>',
    firstDay: 0,
    defaultDate: null,
    altField: null,
    dateFormat: 'mm/dd/yy',
    altFormat: null,
    align: 'bottom-left',
    selectOtherMonths: true,
    prevText: '&laquo;',
    nextText: '&raquo;',
    dayFormat: 'd',
    monthFormat: 'M',
    rowsCount: 'auto',
    minDate: null,
    maxDate: null,
    keyboard: true,
    selectionMode: 'single',
    separator: ', ',
    inline: false
  };

  var INPUT_TEMPLATE = '<div style="width: 0; height: 0; overflow: hidden; position: absolute; left: 50%; top: 50%;">' +
    '<input type="text"></div>';

  var dataDateFormat = '\\data-\\date="yy-m-d"';

  var regextOneOrTwoDigit = /\d\d?/;
  var regexTwoDigit = /\d\d/;
  var regexFourDigit = /\d{4}/;
  // any word (or two) characters or numbers including two/three word month in arabic.
  var regexWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

  var tokenRegex = {
    d: regextOneOrTwoDigit,
    dd: regexTwoDigit,
    D: regexWord,
    DD: regexWord,
    m: regextOneOrTwoDigit,
    mm: regexTwoDigit,
    M: regexWord,
    MM: regexWord,
    y: regexTwoDigit,
    yy: regexFourDigit,
    '@': /\d+/
  };

  var formattingTokens = /(\[[^\[]*\])|(\\)?(dd|DD|mm|MM|yy|@|.)/g;

  // DATEPICKER HELPER FUNCTIONS DEFINITION
  // ======================================

  function datePart(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function createDate(d) {
    return datePart(d || new Date());
  }

  function dateFromOption(val, options) {
    if (!val) return null;

    var date = null;

    if (typeof val === 'number') {
      date = createDate();
      date.setDate(date.getDate() + val);
    } else if (typeof val === 'string') {
      try {
        date = parseDate(options.dateFormat, val, options);
      } catch(e) {
        date = createDate();
        date.setDate(date.getDate() + (+val));
      }
    } else {
      date = val;
    }

    return date;
  }

  function formatNumber(number) {
    number = '' + number;
    return number.length < 2 ? '0' + number : number;
  }

  var formatters = {
    d: function() {
      return this.getDate();
    },
    dd: function() {
      return formatNumber(this.getDate());
    },
    D: function(options) {
      return options.daysShort[this.getDay()];
    },
    DD: function(options) {
      return options.days[this.getDay()];
    },
    m: function() {
      return this.getMonth() + 1;
    },
    mm: function() {
      return formatNumber(this.getMonth() + 1);
    },
    M: function(options) {
      return options.monthsShort[this.getMonth()];
    },
    MM: function(options) {
      return options.months[this.getMonth()];
    },
    y: function() {
      return formatNumber(this.getFullYear() % 100);
    },
    yy: function() {
      return this.getFullYear();
    },
    '@': function() {
      return this.getTime();
    }
  };

  // d - day of month (no leading zero)
  // dd - day of month (two digit)
  // D - day name short
  // DD - day name long
  // m - month of year (no leading zero)
  // mm - month of year (two digit)
  // M - month name short
  // MM - month name long
  // y - year (two digit)
  // yy - year (four digit)
  // @ - Unix timestamp (ms since 01/01/1970)
  // \\ - escape proceeding characters
  // [] - escape characters between braces
  // anything else - literal text
  function formatDate(format, date, option) {
    var options = $.extend({}, DEFAULTS, option);

    var i, value, token,
        tokens = format.match(formattingTokens),
        output = '';

    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];

      if (formatters[token]) {
        value = formatters[token].call(date, options);
      } else {
        value = token.match(/\[[\s\S]/) ? token.replace(/^\[|\]$/g, '') : token.replace(/\\/g, '');
      }

      output += value;
    }

    return output;
  }

  function parseDate(format, string, option) {
    var options = $.extend({}, DEFAULTS, option);

    var dateObject = {}, i, token, regex, matched;

    function addPartToDateObject(token, matched) {
      switch (token) {
        case 'd':
        case 'dd':
          dateObject.day = +matched;
          break;
        case 'm':
        case 'mm':
          dateObject.month = matched - 1;
          break;
        case 'y':
          dateObject.year = +matched + (+matched > 68 ? 1900 : 2000);
          break;
        case 'yy':
          dateObject.year = +matched;
          break;
        case 'M':
          dateObject.month = findIndex(options.monthsShort, function(el) { return el === matched; });
          break;
        case 'MM':
          dateObject.month = findIndex(options.months, function(el) { return el === matched; });
          break;
        case '@':
          dateObject.epoch = +matched;
          break;
      }
    }

    var tokens = format.match(formattingTokens);

    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];

      regex = tokenRegex[token];
      if (!regex) regex = new RegExp(token, 'i');

      matched = string.match(regex);

      if (matched) {
        string = string.substr(matched.index + matched[0].length);
        addPartToDateObject(token, matched[0]);
      }
    }

    if (dateObject.epoch) {
      return new Date(dateObject.epoch);
    } else {
      return new Date(dateObject.year, dateObject.month, dateObject.day);
    }
  }

  function splitStringByFormat(format, string) {
    var parts = [], i, token, regex, matched, str, lastIndex;

    var tokens = format.match(formattingTokens);

    while (true) {
      str = string;
      lastIndex = 0;

      for (i = 0; i < tokens.length; i++) {
        token = tokens[i];

        regex = tokenRegex[token];
        if (!regex) regex = new RegExp(token, 'i');

        matched = str.match(regex);

        if (matched) {
          lastIndex += matched.index + matched[0].length;
          str = str.substr(matched.index + matched[0].length);
        }
      }

      if (string === str) break;
      parts.push(string.substr(0, lastIndex));
      string = string.substr(lastIndex);
    }

    return parts;
  }

  function findIndex(list, predicate) {
    for (var i = 0; i < list.length; i++) {
      if (predicate(list[i])) return i;
    }

    return -1;
  }

  // DATESELECTION CLASS DEFINITION
  // ==============================

  var DateSelection = function(mode) {
    this.dates = [];
    this.isMulti = mode === 'multi';
    this.isRange = mode === 'range';
  };

  DateSelection.prototype.get = function(i) {
    if (typeof i === 'undefined') return this.dates;
    return i < 0 ? this.dates[this.dates.length + i] : this.dates[i];
  };

  DateSelection.prototype.push = function(date) {
    date = createDate(date);

    if (this.isMulti) {
      var i = this.contains(date);

      if (i !== -1) {
        this.dates.splice(i, 1);
      } else {
        this.dates.push(date);
      }
    } else if (this.isRange) {
      if (this.dates.length > 1) this.dates.length = 0;
      this.dates.push(date);
      this.dates.sort(function(a, b) { return a - b; });
    } else {
      this.dates.splice(0, 1, date);
    }
  };

  DateSelection.prototype.contains = function(date) {
    date = createDate(date);

    for (var i = 0; i < this.dates.length; i++) {
      if (this.dates[i] - date === 0) return i;
    }

    return -1;
  };

  DateSelection.prototype.inRange = function(date) {
    if (this.dates.length < 2) return false;
    return this.dates[0] < date && this.dates[1] > date;
  };

  // DATEPICKER CLASS DEFINITION
  // ===========================

  var Datepicker = function(element, options) {
    var i;

    this.$element = $(element);
    this.options  = $.extend({}, DEFAULTS, options);
    this.view     = 'month';

    this.isInput = this.$element.is('input');

    this.selectedDates = new DateSelection(this.options.selectionMode);

    var dates = this.options.defaultDate;
    if (dates) {
      if (!$.isArray(dates)) dates = [dates];

      for (i = 0; i < dates.length; i++) {
        if (typeof dates[i] === 'string') {
          this.selectedDates.push(parseDate(this.options.dateFormat, dates[i], this.options));
        } else {
          this.selectedDates.push(dates[i]);
        }

        if (this.options.selectionMode === 'single') break;
      }
    }

    if (this.isInput && this.$element.val() !== '') {
      var parts = splitStringByFormat(this.options.dateFormat, this.$element.val());

      for (i = 0; i < parts.length; i++) {
        this.selectedDates.push(parseDate(this.options.dateFormat, parts[i], this.options));
        if (this.options.selectionMode === 'single') break;
      }
    }

    this.currentDate = createDate(this.selectedDates.get(0));

    this.$container = $(this.options.container);

    this.$container
      .on('click', function(e) { e.stopPropagation(); })
      .on('click', 'a.prev-link, a.next-link', $.proxy(changePeriod, this))
      .on('click', 'a[data-view]', $.proxy(changeView, this))
      .on('click', 'table a', $.proxy(select, this))
      .on('keydown', $.proxy(keydown, this));

    if (this.options.inline) {
      this.$container.addClass('datepicker-inline');
      this.render();
      this.$element.append(this.$container);
    } else {
      this.$input = $(INPUT_TEMPLATE);

      this.$input.find('input').on('keydown', $.proxy(keydown, this));

      this.$container.addClass('datepicker-popup');
      this.$element
        .on(this.isInput ? 'focus' : 'click', $.proxy(this.show, this))
        .on('keydown', $.proxy(keydown, this));
    }
  };

  Datepicker.prototype.show = function(e) {
    if (this.options.inline) return;
    if (e) e.preventDefault();

    if (triggerEvent.call(this, 'show.datepicker')) return;

    this.currentDate = createDate(this.selectedDates.get(0));
    this.activeDate = null;
    this.view = 'month';

    this.render();
    $(document.body).append(this.$container);
    if (!this.isInput) {
      $(document.body).append(this.$input);
      this.$input.find('input').focus();
    }

    var self = this;
    setTimeout(function() {
      self.$container.addClass('in');
    }, 25);

    positionContainer.call(this);
  };

  Datepicker.prototype.hide = function() {
    if (this.options.inline) return;
    if (triggerEvent.call(this, 'hide.datepicker')) return;

    this.$container.removeClass('in');
    this.$container.detach();
    if (!this.isInput) this.$input.detach();
  };

  Datepicker.prototype.render = function() {
    if (this.view === 'month') {
      this.$container.html(renderMonth.call(this));
    } else if (this.view === 'year') {
      this.$container.html(renderYear.call(this));
    } else {
      this.$container.html(renderDecade.call(this));
    }
  };

  Datepicker.prototype.val = function(val) {
    if (this.options.inline) return;

    var formattedDates = [], i, out;

    for (i = 0; i < val.length; i++) {
      formattedDates.push(formatDate(this.options.dateFormat, val[i], this.options));
    }

    out = formattedDates.join(this.options.separator)

    if (triggerEvent.call(this, 'val.datepicker', {dates: val, formattedDates: out}))
      return;

    if (this.isInput) {
      this.$element.val(out);
    } else {
      this.$element.html(out);
    }

    if (this.options.altField) {
      var altFormat = this.options.altFormat || this.options.dateFormat;

      formattedDates = [];
      for (i = 0; i < val.length; i++) {
        formattedDates.push(formatDate(altFormat, val[i], this.options));
      }

      $(this.options.altField).val(formattedDates.join(this.options.separator));
    }

    triggerEvent.call(this, 'valSet.datepicker', {dates: val, formattedDates: out});
  };

  Datepicker.prototype.getDates = function() {
    return this.selectedDates.get();
  };

  Datepicker.prototype.setDates = function(dates) {
    var i, date;

    if (!$.isArray(dates)) dates = [dates];

    for (i = 0; i < dates.length; i++) {
      date = dates[i];

      if (typeof date === 'string') {
        date = parseDate(this.options.dateFormat, date, this.options);
      }

      this.selectedDates.push(date);
      if (this.options.selectionMode === 'single') break;
    }

    this.currentDate = datePart(this.selectedDates.get(0));
    this.render();
    this.val(this.selectedDates.get());
  };

  Datepicker.prototype.setOptions = function(options) {
    this.options = $.extend({}, this.options, options);
  };

  // DATEPICKER PRIVATE FUNCTIONS DEFINITION
  // =======================================

  var keydown = function(e) {
    if (this.view !== 'month') return;
    if (e.which === 9 || e.which === 27) this.hide();

    var change = null;

    switch (e.which) {
      case 37: // left
        change = -1;
        break;
      case 38: // up
        change = -7;
        break;
      case 39: // right
        change = 1;
        break;
      case 40: // down
        change = 7;
        break;
      case 13:
        if (this.options.keyboard) {
          e.preventDefault();

          if (!this.activeDate) this.activeDate = createDate(this.selectedDates.get(-1));
          selectDate.call(this, this.activeDate);
        }
        break;
    }

    if (this.options.keyboard && change) {
      e.preventDefault();
      if (!this.activeDate) this.activeDate = createDate(this.selectedDates.get(-1));

      var minDate = dateFromOption(this.options.minDate, this.options);
      var maxDate = dateFromOption(this.options.maxDate, this.options);

      var newDate = createDate(this.activeDate);
      newDate = newDate.setDate(newDate.getDate() + change);

      if (minDate && minDate > newDate) change = 0;
      if (maxDate && maxDate < newDate) change = 0;

      this.activeDate.setDate(this.activeDate.getDate() + change);
      this.currentDate = createDate(this.activeDate);
      this.render();
    }
  };

  var changePeriod = function(e) {
    e.preventDefault();

    var dateString = $(e.target).data('date');
    var date = parseDate('yy-m-d', dateString, this.options);

    if (!triggerEvent.call(this, 'changePeriod.datepicker', {date: date, period: this.view})) {
      this.currentDate = date;
      this.render();
    }
  };

  var changeView = function(e) {
    e.preventDefault();

    var view = $(e.target).data('view');

    if (!triggerEvent.call(this, 'changeView.datepicker', {prevView: this.view, view: view})) {
      this.view = view;
      this.render();
    }
  };

  var select = function(e) {
    e.preventDefault();

    var dateString = $(e.target).data('date');
    var date = parseDate('yy-m-d', dateString, this.options);

    selectDate.call(this, date);
  };

  var selectDate = function(date) {
    if (this.view === 'month') {
      if (!triggerEvent.call(this, 'selectDate.datepicker', {date: date})) {
        this.selectedDates.push(date);
        this.activeDate = createDate(date);
        this.val(this.selectedDates.get());
        this.render();
      }

      var isRange = this.options.selectionMode === 'range';
      if ((isRange && this.selectedDates.get().length === 2 || !isRange) &&
          !triggerEvent.call(this, 'selectedDate.datepicker', {dates: this.selectedDates.get()})) {
        this.hide();
      }
    } else {
      var view;

      if (this.view === 'decade') view = 'year';
      if (this.view === 'year') view = 'month';

      if (!triggerEvent.call(this, 'changeView.datepicker', {prevView: this.view, view: view})) {
        this.currentDate = date;
        this.view = view;
        this.render();
      }
    }
  };

  var triggerEvent = function(name, params) {
    var e = $.Event(name, params);
    this.$element.trigger(e);
    return e.isDefaultPrevented();
  };

  // available options:
  // bottom-left, bottom-center, bottom-right
  // top-left, top-center, top-right
  // left-top left-bottom left-middle
  // right-top right-bottom right-middle
  var positionContainer = function() {
    var cWidth = this.$container.outerWidth();
    var cHeight = this.$container.outerHeight();

    var offset = this.$element.offset();
    var height = this.$element.outerHeight();
    var width = this.$element.outerWidth();

    var top = offset.top;
    var left = offset.left;

    var align = this.options.align.split('-');

    if (align[0] === 'bottom') top += height;
    if (align[0] === 'top')    top -= cHeight;
    if (align[0] === 'left')   left -= cWidth;
    if (align[0] === 'right')  left += width;

    if (align[1] === 'center') left += width / 2 - cWidth / 2;
    if (align[1] === 'right')  left += width - cWidth;

    if (align[1] === 'top')    top -= cHeight - height;
    if (align[1] === 'middle') top -= cHeight / 2 - height / 2;

    this.$container.css({left: left, top: top});
  };

  var renderDecade = function() {
    var i, j, classes, isCellSelectable;

    var thisYear = this.currentDate.getFullYear(),
        year = thisYear - thisYear % 10,
        prevDate = new Date(year - 10, 0, 1),
        nextDate = new Date(year + 10, 0, 1);

    var minDate = dateFromOption(this.options.minDate, this.options);
    var maxDate = dateFromOption(this.options.maxDate, this.options);

    minDate && minDate.setDate(1) && minDate.setMonth(0);
    maxDate && maxDate.setDate(1) && maxDate.setMonth(0);

    var prevDisabled = minDate && minDate.getFullYear() > new Date(year, 0, 1).getFullYear(),
        nextDisabled = maxDate && maxDate.getFullYear() < nextDate.getFullYear();

    var output = '';

    output += '<div class="datepicker-years">';

    output += '<div class="datepicker-header">';
    output += '<' + (prevDisabled ? 'span' : 'a') + ' class="prev-link"' + formatDate(dataDateFormat, prevDate) + '>';
    output += this.options.prevText;
    output += '</' + (prevDisabled ? 'span' : 'a') + '>';
    output += '<span class="datepicker-title">' + formatDate('yy', new Date(year, 0, 1), this.options);
    output += ' - ' + formatDate('yy', new Date(year + 9, 0, 1), this.options) + '</span>';
    output += '<' + (nextDisabled ? 'span' : 'a') + ' class="next-link"' + formatDate(dataDateFormat, nextDate) + '>';
    output += this.options.nextText;
    output += '</' + (nextDisabled ? 'span' : 'a') + '>';
    output += '</div>';

    output += '<table>';
    output += '<tbody>';

    var date = new Date(year, 0, 1);

    for (i = 0; i < 4; i++) {
      output += '<tr>';

      for (j = 0; j < 3; j++) {
        if (i * 3 + j === 9 || i * 3 + j === 11) {
          output += '<td></td>';
          continue;
        }

        classes = [];
        isCellSelectable = true;

        if (minDate && minDate > date) isCellSelectable = false;
        if (maxDate && maxDate < date) isCellSelectable = false;

        if (!isCellSelectable) classes.push('disabled');

        output += '<td' + (classes.length > 0 ? ' class="' + classes.join(' ') + '"' : '') + '>';
        output += isCellSelectable ? '<a ' + formatDate(dataDateFormat, date) + '>' : '<span>';

        output += formatDate('yy', date, this.options);

        output += isCellSelectable ? '</a>' : '</span>';
        output += '</td>';

        date.setFullYear(date.getFullYear() + 1);
      }

      output += '</tr>';
    }

    output += '</tbody>';
    output += '</table>';

    output += '</div>';

    return output;
  };

  var renderYear = function() {
    var i, j, classes, isCellSelectable;

    var year = this.currentDate.getFullYear(),
        month = this.currentDate.getMonth(),
        prevDate = new Date(year - 1, 0, 1),
        nextDate = new Date(year + 1, 0, 1);

    var minDate = dateFromOption(this.options.minDate, this.options);
    var maxDate = dateFromOption(this.options.maxDate, this.options);

    minDate && minDate.setDate(1);
    maxDate && maxDate.setDate(1);

    var prevDisabled = minDate && minDate.getFullYear() > prevDate.getFullYear(),
        nextDisabled = maxDate && maxDate.getFullYear() < nextDate.getFullYear();

    var output = '';

    output += '<div class="datepicker-months">';

    output += '<div class="datepicker-header">';
    output += '<' + (prevDisabled ? 'span' : 'a') + ' class="prev-link"' + formatDate(dataDateFormat, prevDate) + '>';
    output += this.options.prevText;
    output += '</' + (prevDisabled ? 'span' : 'a') + '>';
    output += '<a class="datepicker-title" data-view="decade">' + formatDate('yy', this.currentDate, this.options) + '</a>';
    output += '<' + (nextDisabled ? 'span' : 'a') + ' class="next-link"' + formatDate(dataDateFormat, nextDate) + '>';
    output += this.options.nextText;
    output += '</' + (nextDisabled ? 'span' : 'a') + '>';
    output += '</div>';

    output += '<table>';
    output += '<tbody>';

    var date = new Date(year, month, 1);

    for (i = 0; i < 4; i++) {
      output += '<tr>';

      for (j = 0; j < 3; j++) {
        date.setMonth(i * 3 + j);

        classes = [];
        isCellSelectable = true;

        if (minDate && minDate > date) isCellSelectable = false;
        if (maxDate && maxDate < date) isCellSelectable = false;

        if (!isCellSelectable) classes.push('disabled');

        output += '<td' + (classes.length > 0 ? ' class="' + classes.join(' ') + '"' : '') + '>';
        output += isCellSelectable ? '<a ' + formatDate(dataDateFormat, date) + '>' : '<span>';

        output += formatDate(this.options.monthFormat, date, this.options);

        output += isCellSelectable ? '</a>' : '</span>';
        output += '</td>';
      }

      output += '</tr>';
    }

    output += '</tbody>';
    output += '</table>';

    output += '</div>';

    return output;
  };

  var renderMonth = function() {
    var i, j, classes, isCellSelectable;

    var today           = createDate(),
        year            = this.currentDate.getFullYear(),
        month           = this.currentDate.getMonth(),
        prevDate        = new Date(year, month, 0),
        nextDate        = new Date(year, month + 1, 1),
        daysCount       = 32 - (new Date(year, month, 32)).getDate(),
        prevDaysCount   = 32 - (new Date(year, month - 1, 32)).getDate(),
        firstDayOffset  = (new Date(year, month, 1)).getDay() - this.options.firstDay,
        offsetDaysCount = firstDayOffset + daysCount,
        rows            = Math.ceil(offsetDaysCount / 7);

    if (this.options.rowsCount === 'static') rows = 6;

    var minDate = dateFromOption(this.options.minDate, this.options);
    var maxDate = dateFromOption(this.options.maxDate, this.options);

    var prevDisabled = minDate && minDate > prevDate,
        nextDisabled = maxDate && maxDate < nextDate;

    var output = '';

    output += '<div class="datepicker-calendar">';

    output += '<div class="datepicker-header">';
    output += '<' + (prevDisabled ? 'span' : 'a') + ' class="prev-link"' + formatDate(dataDateFormat, prevDate) + '>';
    output += this.options.prevText;
    output += '</' + (prevDisabled ? 'span' : 'a') + '>';
    output += '<a class="datepicker-title" data-view="year">' + formatDate('MM yy', this.currentDate, this.options) + '</a>';
    output += '<' + (nextDisabled ? 'span' : 'a') + ' class="next-link"' + formatDate(dataDateFormat, nextDate) + '>';
    output += this.options.nextText;
    output += '</' + (nextDisabled ? 'span' : 'a') + '>';
    output += '</div>';

    output += '<table>';

    output += '<thead>';
    output += '<tr>';

    for (i = 0; i < 7; i++) {
      output += '<th>';
      output += this.options.daysMin[(i + this.options.firstDay) % 7];
      output += '</th>';
    }

    output += '</tr>';
    output += '</thead>';

    output += '<tbody>';

    var day = new Date(year, month - 1, prevDaysCount - firstDayOffset + 1);

    for (i = 0; i < rows; i++) {
      output += '<tr>';

      for (j = 0; j < 7; j++) {
        classes = [];

        isCellSelectable = true;

        if (day <= prevDate) {
          classes.push('prev-month');
          isCellSelectable = this.options.selectOtherMonths;
        }

        if (day >= nextDate) {
          classes.push('next-month');
          isCellSelectable = this.options.selectOtherMonths;
        }

        if (minDate && minDate > day) isCellSelectable = false;
        if (maxDate && maxDate < day) isCellSelectable = false;

        if (!isCellSelectable) classes.push('disabled');
        if (today - day === 0) classes.push('today');
        if (this.selectedDates.contains(day) !== -1) classes.push('selected');
        if (this.options.selectionMode === 'range' && this.selectedDates.inRange(day)) {
          classes.push('range');
        }
        if (this.activeDate && this.activeDate - day === 0) classes.push('active');
        if (day.getDay() === 0) classes.push('sunday');
        if (day.getDay() === 6) classes.push('saturday');

        output += '<td' + (classes.length > 0 ? ' class="' + classes.join(' ') + '"' : '') + '>';
        output += isCellSelectable ? '<a ' + formatDate(dataDateFormat, day) + '>' : '<span>';

        output += formatDate(this.options.dayFormat, day, this.options);

        output += isCellSelectable ? '</a>' : '</span>';
        output += '</td>';

        day.setDate(day.getDate() + 1);
      }

      output += '</tr>';
    }

    output += '</tbody>';
    output += '</table>';

    output += '</div>';

    return output;
  };

  // DATEPICKER PLUGIN DEFINITION
  // ============================

  $.fn.datepicker = function(option, val) {
    if (option === 'getDates') {
      var $this = $(this[0]);
      $this.datepicker();
      var data = $this.data('datepicker.instance');

      return data[option](val);
    }

    return this.each(function() {
      var $this = $(this),
          data  = $this.data('datepicker.instance');

      if (!data) {
        $this
          .data('datepicker.instance', (data = new Datepicker(this, typeof option === 'object' && option)))
          .attr('data-datepicker-instance', '');
      }
      if (typeof option === 'string') data[option](val);
    });
  };

  // expose helper functions
  $.datepicker = {
    formatDate: formatDate,
    parseDate: parseDate,
    setDefaults: function(options) {
      $.extend(DEFAULTS, options);
      $('[data-datepicker-instance]').datepicker('setOptions', options);
    }
  };

  $(document).on('click', function(e) {
    $('[data-datepicker-instance]').each(function() {
      if (this !== e.target && !this.contains(e.target)) $(this).datepicker('hide');
    });
  });

  // DATEPICKER DATA-API
  // ===================

  $(document)
    .on('click.datepicker', '[data-datepicker]:not(input)', function(e) {
      e.preventDefault();
      $(this).datepicker('show');
    })
    .on('focus.datepicker', 'input[data-datepicker]', function() {
      $(this).datepicker();
    });

})(window.jQuery);
