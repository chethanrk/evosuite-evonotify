sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment"
], function (Controller, Fragment) {
	"use strict";
	return Controller.extend("com.evorait.evosuite.evonotify.controller.MessageManager", {

		_showMessageManager: null,

		/**
		 * Open the Message Manager Popover
		 * @param oView
		 * @param oEvent
		 */
		open: function (oView, oEvent) {
			var oControlmsg = oEvent.getSource();
			if (!this._showMessageManager) {
				Fragment.load({
					name: "com.evorait.evosuite.evonotify.view.fragments.MessageManager",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._showMessageManager = oFragment;
					oView.addDependent(oFragment);
					this._showMessageManager.addStyleClass(oView.getModel("viewModel").getProperty("/densityClass"));
					this._showMessageManager.openBy(oControlmsg);
				}.bind(this));
			} else {
				if (this._showMessageManager.isOpen()) {
					this._showMessageManager.close();
				} else {
					this._showMessageManager.getModel("message").refresh();
					this._showMessageManager.openBy(oControlmsg);
				}
			}
		},

		/**
		 * Delete all messages from message manager model
		 */
		deleteAllMessages: function () {
			this._showMessageManager.getModel('message').oMessageManager.removeAllMessages();
			this._showMessageManager.close();
		},

		/**
		 * Set all the unread messages to read before closing the popover
		 */
		beforePopoverClose: function () {
			//Filter the odata first where the technical field is true
			var oFilteredList = this._showMessageManager.getModel("message").oData.filter(function (element) {
				return element.technical === true;
			});
			//update all the filtered list technical value to false
			oFilteredList.forEach(function (element, index) {
				element.technical = false;
			});
		}
	});

});