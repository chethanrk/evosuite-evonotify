sap.ui.define([], function () {
	"use strict";

	var constants = {
		APPLICATION: {
			EVOPLAN: "EVOPLAN",
			EVOORDER: "EVOORDER",
			EVONOTIFY: "EVONOTIFY",
			EVOEQUIP: "EVOEQUIP"
		},
		PROPERTY: {
			EVOORDER: "OrderNumber",
			EVONOTIFY: "Notification",
			EVOEQUIP: "EquipmentNumber"
		},
		LAUNCH_MODE: {
			FIORI: "LAUNCHPAD",
			BSP: "BSP"
		}
	};

	return constants;

});