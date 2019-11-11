/*global location*/
sap.ui.define([
		"com/evorait/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evonotify/model/formatter",
		"sap/ui/core/Fragment",
		"sap/ui/model/Filter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		Fragment,
		Filter
	) {
		"use strict";

		return BaseController.extend("com.evorait.evonotify.controller.Object", {

			formatter: formatter,

			_oContext: null,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			},

			onExit: function(){

			},
			
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */


			/**
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack : function() {
				if(this.oForm){
					this.cancelFormHandling(this.oForm);
				}
				if(!this.getModel("viewModel").getProperty("/isNew")){
					this.navBack();
				}
			},
			
			/**
			 * table item row select
			 * navigate to notification item
			 */
			onPressItem : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters());
				
				this.onPressCancel();
				this.getRouter().navTo("item", {
					objectId: obj.MaintenanceNotification,
					itemId: obj.MaintenanceNotificationItem
				});
			},

			/**
			 * Show select statuso dialog with maybe pre-selected filter
			 * @param oEvent
			 */
			onSelectStatus : function (oEvent) {
				var oParams = oEvent.getParameters(),
					statusKey = oParams.item.getKey();

				if(statusKey){
					this.saveNewStatus("/UpdateHeaderStatus", {
						"MaintNotification": this._oContext.getProperty("MaintenanceNotification"),
						"MaintStatus": statusKey
					});
				}
			},
			/**
			 * show edit forms
			 */
			onPressEdit : function() {
				this._setEditMode(true);
			},
			/**
			 * reset changed data
			 * when create notification remove all values
			 */
			onPressCancel : function() {
				if(this.oForm){
					this.cancelFormHandling(this.oForm);
				}
			},
			
			/**
			 * validate and submit form data changes
			 */
			onPressSave : function() {
				if(this.oForm){
					this.saveSubmitHandling(this.oForm);
				}
			},

			/**
			 * fired edit toggle event from subsection block DetailsFormBlock
			 */
			onFiredEditMode : function(oEvent) {
				var oParameters = oEvent.getParameters();
				this._setEditMode(oParameters.editable);
				if(!this.oForm){
					this.oForm = sap.ui.getCore().byId(oParameters.id);
				}
			},
			
			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route "object"
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId,
					oViewModel = this.getModel("viewModel"),
					oDataModel = this.getModel(),
					isNew = (sObjectId === "new");
					
				oDataModel.metadataLoaded().then( function() {
					oViewModel.setProperty("/isNew", isNew);
					oViewModel.setProperty("/isEdit", !isNew);
					this._setEditMode(isNew);
					this.showAllSmartFields(this.oForm); 
					
					if(isNew){
						this._oContext = oDataModel.createEntry("/PMNotifications");
						this.getView().unbindElement();
						this.getView().setBindingContext(this._oContext);
						
						var oBundle = this.getModel("i18n").getResourceBundle();
						oViewModel.setProperty("/Title", oBundle.getText("newNotificationTitle"));
						oViewModel.setProperty("/busy", false);
					}else{
						var sObjectPath = this.getModel().createKey("PMNotifications", {
							MaintenanceNotification :  sObjectId
						});
						
						this._bindView("/" + sObjectPath);
					}
				}.bind(this));
			},

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound
			 * @private
			 */
			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("viewModel"),
					oDataModel = this.getModel();

					oViewModel.setProperty("/activityEntitySet" , "PMNotificationActivities");
					oViewModel.setProperty("/activityTableBindingPath" , "to_PMNotificationActivity");
					oViewModel.setProperty("/taskEntitySet" , "PMNotificationTasks");
					oViewModel.setProperty("/taskTableBindingPath" , "to_PMNotificationTask");


				this.getView().bindElement({
					path: sObjectPath,
					parameters: {
							expand: "to_PMNotificationItem,to_PMNotificationTask,to_PMNotificationActivity"	
 				},
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("viewModel"),
					oElementBinding = oView.getElementBinding();
				this._oContext = oElementBinding.getBoundContext();
					
				// No data for the binding
				if (!this._oContext) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}
				
				if(this.oForm){
					this.oForm.setEditable(false);
				}
				
				// Everything went fine.
				this.getModel("viewModel").setProperty("/Title", this._oContext.getProperty("NotificationText"));
				oViewModel.setProperty("/busy", false);
			},
			
			_setEditMode : function(isEdit){
				this.getModel("viewModel").setProperty("/editMode", isEdit);
				this.getModel("viewModel").setProperty("/showStatus", isEdit);
			}
			
		});
	}
);