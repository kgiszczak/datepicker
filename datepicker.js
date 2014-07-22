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
    minDate: null,
    maxDate: null,
    keyboard: true
  };

  var INPUT_TEMPLATE = '<div style="width: 0; height: 0; overflow: hidden; position: absolute; left: -1000px; top: -1000px;">' +
    '<input type="text"></div>';

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

  function dateFromOption(val, options) {
    if (!val) return null;

    var date = null;

    if (typeof val === 'number') {
      date = datePart(new Date());
      date.setDate(date.getDate() + val);
    } else if (typeof val === 'string') {
      try {
        date = parseDate(options.dateFormat, val, options);
      } catch(e) {
        date = datePart(new Date());
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
    d: function(options) {
      return this.getDate();
    },
    dd: function(options) {
      return formatNumber(this.getDate());
    },
    D: function(options) {
      return options.daysShort[this.getDay()];
    },
    DD: function(options) {
      return options.days[this.getDay()];
    },
    m: function(options) {
      return this.getMonth() + 1;
    },
    mm: function(options) {
      return formatNumber(this.getMonth() + 1);
    },
    M: function(options) {
      return options.monthsShort[this.getMonth()];
    },
    MM: function(options) {
      return options.months[this.getMonth()];
    },
    y: function(options) {
      return formatNumber(this.getFullYear() % 100);
    },
    yy: function(options) {
      return this.getFullYear();
    },
    '@': function(options) {
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
          dateObject.month = options.monthsShort.findIndex(function(el) { return el === matched; });
          break;
        case 'MM':
          dateObject.month = options.months.findIndex(function(el) { return el === matched; });
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

      matched = (string.match(regex) || [])[0];
      string = string.substr(matched.length);

      addPartToDateObject(token, matched);
    }

    if (dateObject.epoch) {
      return new Date(dateObject.epoch);
    } else {
      return new Date(dateObject.year, dateObject.month, dateObject.day);
    }
  }

  // DATEPICKER CLASS DEFINITION
  // ===========================

  var Datepicker = function(element, options) {
    this.$element = $(element);
    this.options  = options;

    this.isInput = this.$element.is('input');

    this.selectedDate = datePart(new Date());

    var defaultDate = this.options.defaultDate;
    if (typeof defaultDate === 'string') {
      this.selectedDate = parseDate(this.options.dateFormat, defaultDate, this.options);
    } else if (typeof defaultDate === 'object' && defaultDate !== null) {
      this.selectedDate = defaultDate;
    }

    if (this.isInput && this.$element.val() !== '') {
      this.selectedDate = parseDate(this.options.dateFormat, this.$element.val(), this.options);
    }

    this.currentDate = new Date(this.selectedDate.getTime());

    this.$container = $(this.options.container);
    this.$input = $(INPUT_TEMPLATE);

    this.$element
      .on(this.isInput ? 'focus' : 'click', $.proxy(this.show, this))
      .on('keydown', $.proxy(keydown, this));
    this.$input.find('input').on('keydown', $.proxy(keydown, this));

    this.$container
      .on('click', function(e) { e.stopPropagation(); })
      .on('click', 'a.prev-link, a.next-link', $.proxy(changeMonth, this))
      .on('click', 'table a', $.proxy(select, this))
      .on('keydown', $.proxy(keydown, this));
  };

  Datepicker.prototype.show = function(e) {
    if (e) e.preventDefault();

    var ev = $.Event('show.datepicker');
    this.$element.trigger(ev);
    if (ev.isDefaultPrevented()) return;

    this.currentDate = new Date(this.selectedDate.getTime());
    this.activeDate = null;

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
    var ev = $.Event('hide.datepicker');
    this.$element.trigger(ev);
    if (ev.isDefaultPrevented()) return;

    this.$container.removeClass('in');
    this.$container.detach();
    if (!this.isInput) this.$input.detach();
  };

  Datepicker.prototype.render = function() {
    this.$container.html(renderCalendar.call(this));
  };

  Datepicker.prototype.val = function(val) {
    var formattedDate = formatDate(this.options.dateFormat, val, this.options);

    if (this.isInput) {
      this.$element.val(formattedDate);
    } else {
      this.$element.html(formattedDate);
    }

    if (this.options.altField) {
      var altFormat = this.options.altFormat || this.options.dateFormat;
      $(this.options.altField).val(formatDate(altFormat, val, this.options));
    }
  };

  Datepicker.prototype.getDate = function() {
    return this.selectedDate;
  };

  Datepicker.prototype.setDate = function(date) {
    if (typeof date === 'string') date = parseDate(this.options.dateFormat, date, this.options);

    this.selectedDate = datePart(date);
    this.currentDate = datePart(date);
    this.render();
    this.val(this.selectedDate);
  };

  Datepicker.prototype.setOptions = function(options) {
    this.options = $.extend({}, this.options, options);
  };

  // DATEPICKER PRIVATE FUNCTIONS DEFINITION
  // =======================================

  var keydown = function(e) {
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

          var ev = $.Event('select.datepicker', {selectedDate: this.activeDate});
          this.$element.triggerHandler(ev);
          if (!ev.isDefaultPrevented()) {
            this.selectedDate = new Date(this.activeDate.getTime());
            this.val(this.selectedDate);
          }
          this.hide();
        }
        break;
    }

    if (this.options.keyboard && change) {
      e.preventDefault();
      if (!this.activeDate) this.activeDate = new Date(this.selectedDate.getTime());

      var minDate = dateFromOption(this.options.minDate, this.options);
      var maxDate = dateFromOption(this.options.maxDate, this.options);

      var newDate = new Date(this.activeDate.getTime());
      newDate = newDate.setDate(newDate.getDate() + change);

      if (minDate && minDate > newDate) change = 0;
      if (minDate && maxDate < newDate) change = 0;

      this.activeDate.setDate(this.activeDate.getDate() + change);
      this.currentDate = new Date(this.activeDate);
      this.render();
    }
  };

  var changeMonth = function(e) {
    e.preventDefault();

    var dateString = $(e.target).data('date');
    var date = parseDate('yy-m-d', dateString, this.options);

    var ev = $.Event('changeMonth.datepicker', {selectedDate: date});
    this.$element.trigger(ev);
    if (!ev.isDefaultPrevented()) {
      this.currentDate = date;
      this.$container.html(renderCalendar.call(this));
    }
  };

  var select = function(e) {
    e.preventDefault();

    var dateString = $(e.target).data('date');
    var date = parseDate('yy-m-d', dateString, this.options);

    var ev = $.Event('select.datepicker', {selectedDate: date});
    this.$element.triggerHandler(ev);
    if (!ev.isDefaultPrevented()) {
      this.selectedDate = date;
      this.val(this.selectedDate);
    }

    this.hide();
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

  var renderCalendar = function() {
    var i, j, classes, isCellSelectable;

    var today           = datePart(new Date()),
        year            = this.currentDate.getFullYear(),
        month           = this.currentDate.getMonth(),
        prevDate        = new Date(year, month, 0),
        nextDate        = new Date(year, month + 1, 1),
        daysCount       = 32 - (new Date(year, month, 32)).getDate(),
        prevDaysCount   = 32 - (new Date(year, month - 1, 32)).getDate(),
        firstDayOffset  = (new Date(year, month, 1)).getDay() - this.options.firstDay,
        offsetDaysCount = firstDayOffset + daysCount,
        rows            = Math.ceil(offsetDaysCount / 7);

    var minDate = dateFromOption(this.options.minDate, this.options);
    var maxDate = dateFromOption(this.options.maxDate, this.options);

    var dataDateFormat = '\\data-\\date="yy-m-d"';

    var prevDisabled = minDate && minDate > prevDate,
        nextDisabled = maxDate && maxDate < nextDate;

    var output = '';

    output += '<div class="datepicker-header">';
    output += '<' + (prevDisabled ? 'span' : 'a') + ' class="prev-link"' + formatDate(dataDateFormat, prevDate) + '>';
    output += this.options.prevText;
    output += '</' + (prevDisabled ? 'span' : 'a') + '>';
    output += '<span class="datepicker-title">' + formatDate('MM yy', this.currentDate, this.options) + '</span>';
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
        if (this.selectedDate - day === 0) classes.push('selected');
        if (this.activeDate && this.activeDate - day === 0) classes.push('active');

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

    return output;
  };

  // DATEPICKER PLUGIN DEFINITION
  // ============================

  $.fn.datepicker = function(option, val) {
    if (option === 'getDate') {
      var $this = $(this[0]);
      $this.datepicker();
      var data = $this.data('datepicker');

      return data[option](val);
    }

    return this.each(function() {
      var $this   = $(this);
      var data    = $this.data('datepicker');
      var options = $.extend({}, DEFAULTS, typeof option === 'object' && option);

      if (!data) {
        $this
          .data('datepicker', (data = new Datepicker(this, options)))
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
      if (this !== e.target) $(this).datepicker('hide');
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
