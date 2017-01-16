sap.ui.define([
		"sap/ui/core/format/DateFormat"
	] , function (DateFormat) {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			numberUnit : function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},
			
			date : function (sValue) {
				if(!sValue){
					return "";
				}
				var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
				var oDateFormat = DateFormat.getDateTimeInstance({pattern: "yyyy-MM-dd"});
                return oDateFormat.format(new Date(sValue.getTime() + TZOffsetMs));
			},
			
			time : function(sValue) {
				if(!sValue){
					return "";
				}
				var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
				var oDateFormat = DateFormat.getDateTimeInstance({pattern: "kk:mm"}); 
                return oDateFormat.format(new Date(sValue.ms + TZOffsetMs));
			},
			
			status : function(sValue){
				if(!parseInt(sValue, 0)){
					return "";
				}
				
			}
		};

	}
);