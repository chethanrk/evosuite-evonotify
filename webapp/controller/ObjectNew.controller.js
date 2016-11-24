sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evolite/evonotify/model/formatter"
	], function(
		BaseController,
		JSONModel,
		History,
		formatter
	) {
		"use strict";

		return BaseController.extend("com.evorait.evolite.evonotify.controller.ObjectNew", {
			
			formatter: formatter,
			oAlertDialog: null,
			oBusyDialog: null,
	
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf com.evorait.evolite.evonotify.view.view.ObjectNew
			 */
			onInit: function() {
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : false,
						delay : 0,
						detail: {}
					});
				
				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();	
				this.getRouter().getRoute("new").attachPatternMatched(this._onObjectMatched, this);
				
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
					// Restore original busy indicator delay for the object view
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				}.bind(this));
				this.setModel(oViewModel, "newEntry");
			},
			
			/**
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack: function() {
				var sPreviousHash = History.getInstance().getPreviousHash();
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},
			
			onSavePress: function(oEvent) {
				var oViewModel = this.getModel("newEntry");
				var mNewEntry = oViewModel.getData().detail;
				oViewModel.setProperty("/busy", true);
				
				//Todo: validation of fields
				this._saveEntry(mNewEntry);
			},
			
			onCancelPress: function(oEvent) {
				this.getModel("newEntry").setProperty("detail", {});
				this.getRouter().navTo("worklist", {}, true);
			},
			
			handleValueHelp: function(oEvent) {
				
			},
	
			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			_onObjectMatched : function () {
				this.getModel().setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				this.getModel().metadataLoaded().then( function() {
					console.log(this.getModel().getMetaModel());
				}.bind(this));
			},
			
			_saveEntry: function(payload){
				var oModel = this.getView().getModel();
				var oViewModel = this.getModel("newEntry");
				
				oModel.create("/PMNotification", payload, {
					success : function(response) {
						oViewModel.setProperty("/busy", false);
						console.log(response);
						//this.getView().byId("cancelButton").firePress();
					}.bind(this),
					error : function() {
						oViewModel.setProperty("/busy", false);
						//this.showErrorAlert("Problem creating new entry");
					}
				});
			}
	
		});
	}
);