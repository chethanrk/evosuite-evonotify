sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"com/evorait/evosuite/evonotify/model/Constants"
], function (DateFormat, Constants) {
	"use strict";

	var mCriticallyStates = Constants.CRITICALLYSTATES;

	return {

		getLogoImageLink: function () {
			var path = $.sap.getModulePath("com.evorait.evosuite.evonotify", "/assets/img/logo_color_transp_50pxh.png");
			return path;
		},

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
		 * @param bAllowChange
		 * @param isEditMode
		 * @returns {boolean}
		 */
		editable: function (bAllowChange, isEditMode) {
			if (bAllowChange && !isEditMode) {
				return true;
			}
			return false;
		},
		/**
		 * checks if an notification or item is visible
		 * Hide/show edit button
		 * @param bEnabledFunction
		 * @param bAllowChange
		 * @param isEditMode
		 * @returns {boolean}
		 */
		isVisible: function (bAllowChange, bEnabledFunction, isEditMode) {
			if (bEnabledFunction === "X" && bAllowChange && !isEditMode) {
				return true;
			}
			return false;
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
		 * Hide/show status change button
		 * @param bShowStatusButton
		 * @param bAllowChange
		 * @param bEnabledFunction
		 * @param isEditMode
		 * @returns {boolean}
		 */
		showStatusButton: function (bShowStatusButton, bAllowChange, bEnabledFunction, isEditMode) {
			if (bShowStatusButton && bAllowChange && bEnabledFunction && !isEditMode) {
				return true;
			}
			return false;
		},

		/**
		 * Hide/show create Order button
		 * @param orderNumber
		 * @param bEnableOrderCreate
		 * @param bEnabledFunction
		 * @param isEditMode
		 * @returns {boolean}
		 */
		showCreateOrderButton: function (orderNumber, bEnableOrderCreate, bEnabledFunction, isEditMode) {
			if (orderNumber === "" && bEnableOrderCreate === "X" && bEnabledFunction && !isEditMode) {
				return true;
			}
			return false;
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
		},

		formatStatusIconColor: function (sValue, sColor) {
			if (sColor && sColor !== "") {
				return sColor;
			}
			return mCriticallyStates.hasOwnProperty(sValue) ? mCriticallyStates[sValue].color : mCriticallyStates["0"].color;
		},

		formatStatusState: function (sValue, isInNavLinks) {
			if (mCriticallyStates.hasOwnProperty(sValue)) {
				return mCriticallyStates[sValue].state;
			} else if (isInNavLinks === "true") {
				return mCriticallyStates["info"].state;
			} else {
				return mCriticallyStates["0"].state;
			}
		},

		/**
		 * show/hide options for System status buttons
		 */
		showStatusSelectOption: function (sFunction, isNotificationEnabled, mAllowParams) {
			if (isNotificationEnabled) {
				for (var key in mAllowParams) {
					var sAllowFunc = "ALLOW_" + sFunction;
					if (key === sAllowFunc && (mAllowParams[key] === true || mAllowParams[key] === "X")) {
						return true;
					}
				}
			}
			return false;
		}
	};

});