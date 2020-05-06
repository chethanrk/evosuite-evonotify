sap.ui.define([
	"sap/ui/core/format/DateFormat"
], function (DateFormat) {
	"use strict";

	var statusIcons = {
		"1": "sap-icon://circle-task", //open
		"2": "sap-icon://overlay", //on hold
		"3": "sap-icon://busy", //in progress
		"4": "sap-icon://circle-task-2", //completed
		"5": "sap-icon://status-negative" //default
	};

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		/**
		 * gives back a formatted date
		 * @param sValue
		 * @returns {string}
		 */
		date: function (sValue) {
			if (!sValue) {
				return "";
			}
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd"
			});
			return oDateFormat.format(new Date(sValue.getTime() + TZOffsetMs));
		},
		/**
		 * gives back a formatted time
		 * @param sValue
		 * @returns {string}
		 */
		time: function (sValue) {
			if (!sValue) {
				return "";
			}
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "kk:mm"
			});
			return oDateFormat.format(new Date(sValue.ms + TZOffsetMs));
		},
		/**
		 *
		 * @param sValue
		 * @returns {string}
		 */
		status: function (sValue) {
			if (!parseInt(sValue, 0)) {
				return "";
			}
			return sValue;
		},
		/**
		 * checks if an notification or item is allwed to editable
		 * Hide/show edit button
		 * @param isCompleted
		 * @param isDeleted
		 * @param isEditMode
		 * @returns {boolean}
		 */
		editable: function (isCompleted, isDeleted, isEditMode) {
			if (isCompleted || isDeleted || isEditMode) {
				return false;
			}
			return true;
		},
		/**
		 * checks if an notification or item is visible
		 * Hide/show edit button
		 * @param isCompleted
		 * @param isDeleted
		 * @param isVisible
		 * @returns {boolean}
		 */
		isVisible: function (isCompleted, isDeleted, visible) {
			if (!visible || isCompleted || isDeleted) {
				return false;
			}
			return true;
		},
		/**
		 * checks if an menuitem of task is visible
		 * Hide/show menuitem status
		 * @param isOutstanding
		 * @param isReleased
		 * @param isCompleted
		 * @param isSuccessful
		 * @param status
		 * @returns {boolean}
		 */
		taskStatusVisibility: function (isOutstanding, isReleased, isCompleted, isSuccessful, status) {
			if (isOutstanding === true && (status === "RELEASED" || status === "COMPLETED")) {
				return true;
			}
			if (isReleased === true && status === "COMPLETED") {
				return true;
			}
			if (isCompleted === true && status === "SUCCESSFUL") {
				return true;
			}
			if (isSuccessful === true) {
				return false;
			}
			return false;
		},
		/**
		 * checks if an menuitem of notification is visible
		 * Hide/show menuitem status
		 * @param isOutstanding
		 * @param isInProgress
		 * @param isPostponed
		 * @param isCompleted
		 * @param status
		 * @returns {boolean}
		 */
		notificationStatusVisibility: function (isOutstanding, isInProgress, isPostponed, isCompleted, status) {
			if (isOutstanding === true && (status === "INPROGRESS" || status === "POSTPONED" || status === "COMPLETED")) {
				return true;
			}
			if (isPostponed === true && (status === "INPROGRESS" || status === "COMPLETED")) {
				return true;
			}
			if (isInProgress === true && status === "COMPLETED") {
				return true;
			}
			if (isCompleted === true) {
				return false;
			}
			return false;
		},
		/**
		 *
		 * @param sValue
		 * @returns {string|*}
		 */
		formatIsEditableIcon: function (sValue) {
			if (!sValue || !statusIcons[sValue]) {
				return statusIcons["5"];
			}
			return statusIcons[sValue];
		},
		/**
		 * Hide/show status change button
		 * @param isCompleted
		 * @param isDeleted
		 * @param isNew
		 * @returns {boolean}
		 */
		showStatusButton: function (isCompleted, isDeleted, isNew) {
			if (isCompleted || isDeleted || isNew) {
				return false;
			}
			return true;
		},

		/**
		 *
		 * @param sValue
		 * @returns {*|boolean}
		 */
		setVisible: function (sValue) {
			return sValue && sValue !== "0";
		},

		showItemField: function (isNew, isItem) {
			return !isNew && !!isItem;
		},
		
		formatSortNumber: function (sortNo, max) {
			return sortNo.length < max ? this.formatSortNumber("0" + sortNo, max) : sortNo;
		}
	};

});