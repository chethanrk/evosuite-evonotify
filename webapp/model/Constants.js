sap.ui.define([], function () {
	"use strict";

	var constants = {
		APPLICATION: {
			EVOPLAN: "EVOPLAN",
			EVOORDER: "EVOORDER",
			EVOEQUIP: "EVOEQUIP",
			EVONOTIFY: "EVONOTIFY",
			EVOFLOC: "EVOFLOC"
		},
		PROPERTY: {
			EVOORDER: "ORDER_NUMBER",
			EVONOTIFY: "NOTIFICATION_NO",
			EVOEQUIP: "EQUIPMENT_NUMBER",
			EVOFLOC: "FUNCTIONAL_LOCATION",
			NEW: "new"
		},
		LAUNCH_MODE: {
			FIORI: "LAUNCHPAD",
			BSP: "BSP"
		},
		FUNCTIONSET_FILTER: {
			NOTIFICATION_FILTER: "QMI",
			TASK_FILTER: "QA1"
		},
		CRITICALLYSTATES: {
			"info": {
				color: "#5E696E",
				state: "Information"
			},
			"0": {
				color: "#5E696E",
				state: "None"
			},
			"1": {
				color: "#BB0000",
				state: "Error"
			},
			"2": {
				color: "#ff0000",
				state: "Error"
			},
			"3": {
				color: "#E78C07",
				state: "Warning"
			},
			"4": {
				color: "#2B7D2B",
				state: "Success"
			},
			"5": {
				color: "#00ff00",
				state: "Success"
			}
		}
	};

	return constants;

});