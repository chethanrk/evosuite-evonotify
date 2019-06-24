/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evolite/evonotify/model/formatter",
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

		return BaseController.extend("com.evorait.evolite.evonotify.controller.Object", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view"s meta data
				var tableNoDataTextItems = this.getResourceBundle().getText("itemsTableTitle"),
					tableNoDataTextTasks = this.getResourceBundle().getText("tasksTitle"),
					tableNoDataTextActivities = this.getResourceBundle().getText("activitiesTitle");
					
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						isNew : false,
						isEdit : false,
						editMode : false,
						taskViewPath : "",
						actViewPath : "",
						itemsTableTitle : tableNoDataTextItems,
						tasksTableTitle : tableNoDataTextTasks,
						activitiesTableTitle : tableNoDataTextActivities,
						tableNoDataTextItems : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextItems]),
						tableNoDataTextTasks : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextTasks]),
						tableNoDataTextActivities : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextActivities]),
						tableBusyDelay : 0
					});
				
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
				
				this.getView().addEventDelegate({
				   //onBeforeHide : function(){}
				});

				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
			    this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
				
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
				if(!this.getModel("objectView").getProperty("/isNew")){
					this.navBack();
				}
			},
			
			navBack : function(){
				var sPreviousHash = History.getInstance().getPreviousHash();
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
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
			 * table task row select
			 * navigate to notification task
			 */
			onPressTask : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters(), "Tasks");
				
				this.onPressCancel();
				this.getRouter().navTo("objtask", {
					objectId: obj.MaintenanceNotification,
					taskId: obj.MaintenanceNotificationTask,
					itemId: 0
				});
			},
			
			/**
			 * table task row select
			 * navigate to notification task
			 */
			onPressActivity : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters(), "Activities");
				
				this.onPressCancel();
				this.getRouter().navTo("objactivity", {
					objectId: obj.MaintenanceNotification,
					itemId: 0,
					activityId: obj.MaintNotificationActivity
				});
			},

			/**
			 * Show select statuso dialog with maybe pre-selected filter
			 * @param oEvent
			 */
			onPressStatus : function (oEvent) {
				var oFilter = null,
					phaseVal = this.getView().getBindingContext().getProperty("NotifProcessingPhase");

				if(phaseVal === "2"){
					oFilter = new Filter("StatusCode",sap.ui.model.FilterOperator.NE, "I0069");
				} else if(phaseVal === "3"){
					oFilter = new Filter("StatusCode",sap.ui.model.FilterOperator.Contains, "I0072");
				}
				this.getOwnerComponent().statusChangeDialog.open(this.getView(), "HeaderStatus", oFilter);
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
			 * navigate to new notification item
			 */
			onAddItemPress : function(){
				this.onPressCancel();
				this.getRouter().navTo("item", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: "new"
				});
			},
			/**
			 * navigate to new notification item
			 */
			onAddTaskPress : function(){
				this.onPressCancel();
				this.getRouter().navTo("objtask", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: 0,
					taskId: "new"
				});
			},
			/**
			 * navigate to new notification item
			 */
			onAddActivityPress : function(){
				this.onPressCancel();
				this.getRouter().navTo("objactivity", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: 0,
					activityId: "new"
				});
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
					oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel(),
					isNew = (sObjectId === "new");
					
				oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				oDataModel.metadataLoaded().then( function() {
					oViewModel.setProperty("/isNew", isNew);
					oViewModel.setProperty("/isEdit", !isNew);
					this._setEditMode(isNew);
					this.showAllSmartFields(this.oForm); 
					
					if(isNew){
						var oContext = oDataModel.createEntry("/PMNotifications");
						this.getView().unbindElement();
						this.getView().setBindingContext(oContext);
						
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
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();
					oViewModel.setProperty("/taskViewPath" , "to_PMNotificationTask");
					oViewModel.setProperty("/actViewPath" , "to_PMNotificationActivity");
				this.getView().bindElement({
					path: sObjectPath,
					parameters: {
							expand: "to_PMNotificationItem,to_PMNotificationTask,to_PMNotificationActivity"	
 				},
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								// Busy indicator on view should only be set if metadata is loaded,
								// otherwise there may be two busy indications next to each other on the
								// screen. This happens because route matched handler already calls "_bindView"
								// while metadata is loaded.
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
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding(),
					oContext = oElementBinding.getBoundContext();
					
				// No data for the binding
				if (!oContext) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}
				
				if(this.oForm){
					this.oForm.setEditable(false);
				}
				
				// Everything went fine.
				this._setNewHeaderTitle();
				oViewModel.setProperty("/busy", false);
			},
			
			_setEditMode : function(isEdit){
				this.getModel("objectView").setProperty("/editMode", isEdit);
				this.getModel("objectView").setProperty("/showStatus", isEdit);
			},
			
			_setNewHeaderTitle : function(){
				var oContext = this.getView().getBindingContext();
				this.getModel("objectView").setProperty("/Title", this.getModel().getProperty(oContext.sPath+"/NotificationText"));
			}
			
		});
	}
);