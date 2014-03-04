(function($) {
  'use strict';

  var DEFAULTS = {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    container: '<div class="datepicker"></div>',
    firstDay: 0,
    defaultDate: null,
    altField: null,
    dateFormat: 'mm/dd/yy',
    altFormat: null,
    align: 'bottom-left'
  };

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
  function formatDate(format, date, options) {
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

  function parseDate(format, string, options) {
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
          dateObject.month = options.monthsShort.findIndex(function(el) { return el === matched });
          break;
        case 'MM':
          dateObject.month = options.months.findIndex(function(el) { return el === matched });
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

    this.selectedDate = new Date;

    var defaultDate = this.options.defaultDate;
    if (typeof defaultDate === 'string') {
      this.selectedDate = parseDate(this.options.dateFormat, defaultDate, this.options);
    } else if (typeof defaultDate === 'object' && defaultDate !== null) {
      this.selectedDate = defaultDate;
    }

    if (this.isInput && this.$element.val() !== '') {
      this.selectedDate = parseDate(this.options.dateFormat, this.$element.val(), this.options);
    }

    this.currentDate = this.selectedDate;

    this.$container = $(this.options.container);

    if (this.isInput) {
      this.$element
        .on('focus', $.proxy(this.show, this))
        .on('keydown', $.proxy(keydown, this));
    } else {
      this.$element.on('click', $.proxy(this.show, this));
    }

    this.$container
      .on('click', function(e) { e.stopPropagation(); })
      .on('click', '.prev-link, .next-link', $.proxy(changeMonth, this))
      .on('click', 'table a', $.proxy(select, this));
  };

  Datepicker.prototype.show = function(e) {
    if (e) e.preventDefault();

    this.currentDate = this.selectedDate;

    this.render();
    $(document.body).append(this.$container);

    positionContainer.call(this);
  };

  Datepicker.prototype.hide = function() {
    this.$container.detach();
  }

  Datepicker.prototype.render = function() {
    this.$container.html(renderCalendar.call(this));
  }

  Datepicker.prototype.val = function(val) {
    var formattedDate = formatDate(this.options.dateFormat, this.selectedDate, this.options);

    if (this.isInput) {
      this.$element.val(formattedDate);
    } else {
      this.$element.html(formattedDate);
    }

    if (this.options.altField) {
      var altFormat = this.options.altFormat || this.options.dateFormat;
      $(this.options.altField).val(formatDate(altFormat, this.selectedDate, this.options));
    }
  }

  Datepicker.prototype.getDate = function() {
    return this.selectedDate;
  };

  Datepicker.prototype.setDate = function(date) {
    this.selectedDate = this.currentDate = date;
    this.render();
    this.val(this.selectedDate);
  };

  // DATEPICKER PRIVATE FUNCTIONS DEFINITION
  // =======================================

  function keydown(e) {
    if (e.which === 9) this.hide();
  }

  function changeMonth(e) {
    e.preventDefault();
    var dateString = $(e.target).data('date');
    this.currentDate = parseDate('yy-m-d', dateString, this.options);

    this.$container.html(renderCalendar.call(this));
  }

  function select(e) {
    e.preventDefault();
    var dateString = $(e.target).data('date');
    this.selectedDate = parseDate('yy-m-d', dateString, this.options);

    this.$container.html(renderCalendar.call(this));
    this.val(this.selectedDate);
    this.hide();
  }

  function positionContainer() {
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
  }

  function renderCalendar() {
    var i, j, cell, day, classes, rYear, rMonth;

    var today  = new Date,
        tYear  = today.getFullYear(),
        tMonth = today.getMonth(),
        tDay   = today.getDate(),
        sYear  = this.selectedDate.getFullYear(),
        sMonth = this.selectedDate.getMonth(),
        sDay   = this.selectedDate.getDate();

    var year            = this.currentDate.getFullYear(),
        month           = this.currentDate.getMonth(),
        prevDate        = new Date(year, month - 1, 1),
        nextDate        = new Date(year, month + 1, 1),
        daysCount       = 32 - (new Date(year, month, 32)).getDate(),
        prevDaysCount   = 32 - (new Date(year, month - 1, 32)).getDate(),
        firstDayOffset  = (new Date(year, month, 1)).getDay() - this.options.firstDay,
        offsetDaysCount = firstDayOffset + daysCount,
        rows            = Math.ceil(offsetDaysCount / 7, 10);

    var output = '';

    output += '<div class="datepicker-header">';
    output += '<a class="prev-link" data-date="' + prevDate.getFullYear() + '-' + (prevDate.getMonth() + 1) + '-1">&laquo;</a>';
    output += '<span class="datepicker-title">' + formatDate('MM yy', this.currentDate, this.options) + '</span>';
    output += '<a class="next-link" data-date="' + nextDate.getFullYear() + '-' + (nextDate.getMonth() + 1) + '-1">&raquo;</a>';
    output += '</div>';

    output += '<table>';

    output += '<thead>';
    output += '<tr>';

    for (i = 0; i < 7; i++) {
      output += '<th>'
      output += this.options.daysMin[(i + this.options.firstDay) % 7];
      output += '</th>'
    }

    output += '</tr>';
    output += '</thead>';

    output += '<tbody>';

    for (i = 0; i < rows; i++) {
      output += '<tr>';

      for (j = 0; j < 7; j++) {
        classes = [];

        cell = i * 7 + j;
        if (cell < firstDayOffset) {
          rYear = prevDate.getFullYear();
          rMonth = prevDate.getMonth();
          classes.push('prev-month');
          day = prevDaysCount - firstDayOffset + j + 1;
        } else if (cell >= offsetDaysCount) {
          rYear = nextDate.getFullYear();
          rMonth = nextDate.getMonth();
          classes.push('next-month');
          day = cell - offsetDaysCount + 1;
        } else {
          rYear = year;
          rMonth = month;
          day = cell - firstDayOffset + 1;
          if (year === tYear && month === tMonth && day === tDay) classes.push('today');
        }

        if (sYear === rYear && sMonth === rMonth && sDay === day) classes.push('selected');

        output += '<td' + (classes.length > 0 ? ' class="' + classes.join(' ') + '"' : '') + '>';
        output += '<a data-date="' + rYear + '-' + (rMonth + 1) + '-' + day + '">';

        output += day;

        output += '</a>';
        output += '</td>';
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
          .attr('data-datepicker-active', '');
      }
      if (typeof option === 'string') data[option](val);
    });
  };

  $(document).on('click', function(e) {
    $('[data-datepicker-active]').each(function() {
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
