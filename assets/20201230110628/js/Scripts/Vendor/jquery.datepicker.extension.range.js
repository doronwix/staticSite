/* jQuery ui-datepicker extension */

/**
 *
 * https://gist.github.com/Artemeey/8bacd37964a8069a2eeee8c9b0bd2e44/
 *
 * Version: 1.0 (15.06.2016)
 * Requires: jQuery v1.8+
 * Requires: jQuery-UI v1.10+
 *
 * Copyright (c) 2016 Artemeey
 * Under MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 * sample:
 * $('.datepicker').datepicker({
		range:'period', // 'period' or 'multiple'
		onSelect:function(dateText, inst, extensionRange){
			// range - new argument!
			switch(inst.settings.range){
				case 'period':
					console.log(extensionRange.startDateText);
					console.log(extensionRange.endDateText);
					console.log(extensionRange.startDate);
					console.log(extensionRange.endDate);
					break;
				case 'multiple':
					console.log(extensionRange.dates); // object, width UTC-TIME keys
					console.log(extensionRange.datesText); // object, width UTC-TIME keys
					break;
			}
		}
	});
 *
 * extension styles:
 * .selected
 * .selected-start
 * .selected-end
 * .first-of-month
 * .last-of-month
 *
 */

$.datepicker._get_original = $.datepicker._get;
$.datepicker._get = function(inst, name){
	var func = $.datepicker._get_original(inst, name);

	var range = inst.settings['range'];
	if(!range) return func;

	var that = this;

	switch(range){
		case 'period':
		case 'multiple':
			var datepickerExtension = $(this.dpDiv).data('datepickerExtensionRange');
			if(!datepickerExtension){
				datepickerExtension = new _datepickerExtension();
				$(this.dpDiv).data('datepickerExtensionRange', datepickerExtension);
			}
			datepickerExtension.range = range;
			datepickerExtension.range_multiple_max = inst.settings['range_multiple_max'] || 0;

			switch(name){
				case 'onSelect':
					var func_original = func;
					if(!func_original) func_original = function(){};

					func = function(dateText, inst){
						datepickerExtension.onSelect(dateText, inst);
						func_original(dateText, inst, datepickerExtension);

						 // hide fix
						that._datepickerShowing = false;
						setTimeout(function(){
							that._updateDatepicker(inst);
							that._datepickerShowing = true;
						});

						datepickerExtension.setClassActive(inst);
					};

					break;
				case 'beforeShowDay':
					var func_original = func;
					if(!func_original) func_original = function(){ return [true, '']; };

					func = function(date){
						var state = func_original(date);
						state = datepickerExtension.fillDay(date, state);

						return state;
					};

					break;
				case 'beforeShow':
					var func_original = func;
					if(!func_original) func_original = function(){};

					func = function(input, inst){
						func_original(input, inst);

						datepickerExtension.setClassActive(inst);
					};

					break;
				case 'onChangeMonthYear':
					var func_original = func;
					if(!func_original) func_original = function(){};

					func = function(year, month, inst){
						func_original(year, month, inst);

						datepickerExtension.setClassActive(inst);
					};

					break;
			}
			break;
	}

	return func;
};

$.datepicker._setDate_original = $.datepicker._setDate;
$.datepicker._setDate = function(inst, date, noChange){
	var range = inst.settings['range'];
	if(!range) return $.datepicker._setDate_original(inst, date, noChange);

	var datepickerExtension = this.dpDiv.data('datepickerExtensionRange');
	if(!datepickerExtension) return $.datepicker._setDate_original(inst, date, noChange);

	switch(range){
		case 'period':
			if(!(typeof(date) == 'object' && date.length != undefined)){ date = [date, date]; }

			datepickerExtension.step = 0;

			$.datepicker._setDate_original(inst, date[0], noChange);
			datepickerExtension.startDate = this._getDate(inst);
			datepickerExtension.startDateText = this._formatDate(inst);

			$.datepicker._setDate_original(inst, date[1], noChange);
			datepickerExtension.endDate = this._getDate(inst);
			datepickerExtension.endDateText = this._formatDate(inst);

			datepickerExtension.setClassActive(inst);

			break;
		case 'multiple':
			if(!(typeof(date) == 'object' && date.length != undefined)){ date = [date]; }

			datepickerExtension.dates = [];
			datepickerExtension.datesText = [];

			var that = this;
			$.map(date, function(date_i){
				$.datepicker._setDate_original(inst, date_i, noChange);
				datepickerExtension.dates.push(that._getDate(inst));
				datepickerExtension.datesText.push(that._formatDate(inst));
			});

			datepickerExtension.setClassActive(inst);

			break;
	}
};

var _datepickerExtension = function(){
	this.range = false,
	this.range_multiple_max = 0,
	this.step = 0,
	this.dates = [],
	this.datesText = [],
	this.startDate = null,
	this.endDate = null,
	this.startDateText = '',
	this.endDateText = '',
	this.onSelect = function(dateText, inst){
		switch(this.range){
			case 'period': return this.onSelectPeriod(dateText, inst); break;
			case 'multiple': return this.onSelectMultiple(dateText, inst); break;
		}
	},
	this.onSelectPeriod = function(dateText, inst){
		this.step++;
		this.step %= 2;

		if(this.step){
			// выбирается первая дата
			this.startDate = this.getSelectedDate(inst);
			this.startDateText = dateText;

			if (this.endDate < this.startDate) {
				this.endDate = this.startDate;
				this.endDateText = this.startDateText;
			}

		}else{
			// выбирается вторая дата
			this.endDate = this.getSelectedDate(inst);
			this.endDateText = dateText;

			if(this.startDate.getTime() > this.endDate.getTime()){
				this.endDate = this.startDate;
				this.startDate = this.getSelectedDate(inst);

				this.endDateText = this.startDateText;
				this.startDateText = dateText;
			}
		}
	},
	this.onSelectMultiple = function(dateText, inst){
		var date = this.getSelectedDate(inst);

		var index = -1;
		$.map(this.dates, function(date_i, index_date){
			if(date_i.getTime() == date.getTime()) index = index_date;
		});
		var indexText = $.inArray(dateText, this.datesText);

		if(index != -1) this.dates.splice(index, 1);
		else this.dates.push(date);

		if(indexText != -1) this.datesText.splice(indexText, 1);
		else this.datesText.push(dateText);

		if(this.range_multiple_max && this.dates.length > this.range_multiple_max){
			this.dates.splice(0, 1);
			this.datesText.splice(0, 1);
		}
	},
	this.fillDay = function(date, state){
		var _class = state[1];

		if(date.getDate() == 1) _class += ' first-of-month';
		if(date.getDate() == new Date(date.getFullYear(), date.getMonth()+1, 0).getDate()) _class += ' last-of-month';

		state[1] = _class.trim();

		switch(this.range){
			case 'period': return this.fillDayPeriod(date, state); break;
			case 'multiple': return this.fillDayMultiple(date, state); break;
		}
	},
	this.fillDayPeriod = function(date, state){
		if(!this.startDate || !this.endDate) return state;

		var _class = state[1];

		if(date >= this.startDate && date <= this.endDate) _class += ' selected';
		if(date.getTime() == this.startDate.getTime()) _class += ' selected-start';
		if(date.getTime() == this.endDate.getTime()) _class += ' selected-end';

		state[1] = _class.trim();

		return state;
	},
	this.fillDayMultiple = function(date, state){
		var _class = state[1];

		var date_is_selected = false;
		$.map(this.dates, function(date_i){
			if(date_i.getTime() == date.getTime()) date_is_selected = true;
		});
		if(date_is_selected) _class += ' selected selected-start selected-end';

		state[1] = _class.trim();

		return state;
	},
	this.getSelectedDate = function(inst){
		return new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay);
	};
	this.setClassActive = function(inst){
		var that = this;
		setTimeout(function(){
			$('td.selected > *', inst.dpDiv).addClass('ui-state-active');
			if(that.range == 'multiple') $('td:not(.selected)', inst.dpDiv).removeClass('ui-datepicker-current-day').children().removeClass('ui-state-active');
		});
	};
};