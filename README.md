# Datepicker

This is yet another datepicker plugin.

## Installation

jQuery is required for this plugin to work. In your HTML file, load css and js simply by:
```html
<link rel="stylesheet" href="datepicker.min.css">
<script src="datepicker.min.js"></script>
```
Both the minified and uncompressed (for development) versions are in the `/dist` directory.

## Usage

You can use this plugin on input elements:

```javascript
$('input[type="text"]').datepicker();
```

It will be displayed when input is focused. Or you can use it on any other element:

```javascript
$('span').datepicker();
```

It will be displayed when element is clicked.

Datepicker can also be displayed inline:

```javascript
$('.container').datepicker({inline: true});
```

## Options

You can pass options when initializing the plugin:

```javascript
$('input[type="text"]').datepicker({dateFormat: 'mm/dd/yy'});
```

or you can change defaults globally:

```javascript
$.datepicker.setDefaults({dateFormat: 'mm/dd/yy'});
```

### Available options

Name             |Default value                                |Description
-----------------|---------------------------------------------|---
months           |`['January', 'February', ...]`               |Names of months. Used in parsing/formatting dates.
monthsShort      |`['Jan', 'Feb', ...]`                        |Short names of months. Used in parsing/formatting dates.
days             |`['Sunday', 'Monday', ...]`                  |Names of days. Used in parsing/formatting dates.
daysShort        |`['Sun', 'Mon', ...]`                        |Short names of days. Used in parsing/formatting dates.
daysMin          |`['Su', 'Mo', ...]`                          |Min names of days. Used in parsing/formatting dates.
container        |`<div class="datepicker" tabindex="0"></div>`|Container that is used for popups.
firstDay         |`0`                                          |First day of week. Default is Sunday.
defaultDate      |`null`                                       |Date that is selected by default.
altField         |`null`                                       |Alternative input that is set when date is selected. Accepts css selectors.
dateFormat       |`mm/dd/yy`                                   |Date format.
altFormat        |`null`                                       |Alternative input format.
align            |`bottom-left`                                |Popup alignment. Available options are: `bottom-left`, `bottom-center`, `bottom-right`, `top-left`, `top-center`, `top-right`, `left-top`, `left-bottom`, `left-middle`, `right-top`, `right-bottom`, `right-middle`
selectOtherMonths|`true`                                       |Allows to select days from previous or next month.
prevText         |`&laquo;`                                    |Previous link text.
nextText         |`&raquo;`                                    |Next link text.
dayFormat        |`d`                                          |Format of days displayed on calendar.
dayHeaderFormat  |`M`                                          |Format of days displayed on calendar's header.
monthFormat      |`M`                                          |Format of months displayed on calendar.
rowsCount        |`auto`                                       |Number of rows displayed on calendar. When set to `static` number of rows is allways the same, even if given month has less days.
minDate          |`null`                                       |Minimal selectable date.
maxDate          |`null`                                       |Maximal selectable date.
keyboard         |`true`                                       |Keyboard navigation.
selection        |`day`                                        |Available options are `day`, `month`, `year`
selectionMode    |`single`                                     |`single` - single date, `multi` - multiple dates, `range` - range of dates
separator        |`,`                                          |Separator used for displaying selected dats in `multi` or `range` mode
inline           |`false`                                      |When set to `true` datepicker is displayed inline

## Events

Some events (such as `val.datepicker`) provide additional info. You can access this info by accessing properties on event object:

```javascript
$('.datepicker')
  .datepicker()
  .on('val.datepicker', function(e) {
    console.log(e.dates);
    console.log(e.formattedDates);
  });
```

Events can be canceled by calling `preventDefault` method. Eg. this code will prevent displaying datepicker:

```javascript
$('.datepicker')
  .datepicker()
  .on('show.datepicker', function(e) {
    e.preventDefault();
  });
```

Name                   |Description
-----------------------|-----------
show.datepicker        |Triggered before datepicker is shown
hide.datepicker        |Triggered before datepicker is hid
val.datepicker         |Triggered before value on input element is set. Available properties: `dates`, `formattedDates`.
valSet.datepicker      |Triggered after value on input element is set. Available properties: `dates`, `formattedDates`
changePeriod.datepicker|Triggered before period is changed. Available properties: `date`, `period`
changeView.datepicker  |Triggered before view is changed. Available properties: `prevView`, `view`
selectDate.datepicker  |Triggered before date is selected. Available properties: `date`
selectedDate.datepicker|Triggered after date is selected. Available properties: `dates`

## Methods

Example of usage:

```javascript
$('.datepicker').datepicker('setDates', [new Date()]);
```

Name                |Description
--------------------|-----------
show()              |Shows datepicker. Does not have effect when `inline` option is set to `true`
hide()              |Hides datepicker. Does not have effect when `inline` option is set to `true`
render()            |Rerenders datepicker.
changeView(viewName)|Chages displayed view. Available options are: `decade`, `year` and `month`
getDates()          |Returns array of selected dates.
setDates(dates)     |Set selected dates. Accepts array of date objects or strings.
setOptions(options) |Updates options.

## Utility functions

```javascript
$.datepicker.formatDate('dd-mm-yy', new Date());
$.datepicker.parseDate('dd-mm-yy', '01-01-2016');
```

Format string:

```
d - day of month (no leading zero)
dd - day of month (two digit)
D - day name short
DD - day name long
m - month of year (no leading zero)
mm - month of year (two digit)
M - month name short
MM - month name long
y - year (two digit)
yy - year (four digit)
@ - Unix timestamp (ms since 01/01/1970)
\\ - escape proceeding characters
[] - escape characters between braces
anything else - literal text
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License

Datepicker is released under the [MIT License](http://www.opensource.org/licenses/MIT).
