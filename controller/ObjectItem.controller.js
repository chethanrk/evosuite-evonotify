/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evolite/evonotify/model/formatter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter
	) {
		"use strict";

		return BaseController.extend("com.evorait.evolite.evonotify.controller.ObjectItem", {

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
				// between the busy indication for loading the view's meta data
				var tableNoDataTextCauses = this.getResourceBundle().getText("causesTitle"),
					tableNoDataTextTasks = this.getResourceBundle().getText("tasksTitle"),
					tableNoDataTextActivities = this.getResourceBundle().getText("activitiesTitle");
					
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						isNew : false,
						isEdit : false,
						showMode: false,
						editMode : false,
						MaintenanceNotification : 0,
						tableNoDataTextCauses : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextCauses]),
						tableNoDataTextTasks : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextTasks]),
						tableNoDataTextActivities : this.getResourceBundle().getText("tableNoDataText", [tableNoDataTextActivities]),
						tableBusyDelay : 0
					});

				this.getRouter().getRoute("item").attachPatternMatched(this._onObjectMatched, this);

				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("objectView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object:{
								id: location.href,
								share: oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});
				oShareDialog.open();
			},

			/**
			 * Event handler  for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
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
				var oContext = this.getView().getBindingContext();
				
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else if(oContext) {
					var obj = oContext.getObject();
					this.getRouter().navTo("object", {objectId: obj.MaintenanceNotification}, true);
				}else{
					this.getRouter().navTo("worklist", {}, true);
				}
			},
			
			/**
			 * show edit forms
			 */
			onPressEdit : function() {
				this._setEditMode(true);
			},
			
			onPressSave : function(){
				if(this.oForm){
					this.saveSubmitHandling(this.oForm);
				}
			},
			
			onPressCancel : function(){
				if(this.oForm){
					this.cancelFormHandling(this.oForm);
				}
			},
			
			/**
			 * table task row select
			 * navigate to notification task
			 */
			onPressCause : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters());
				
				this.onPressCancel();
				this.getRouter().navTo("cause", {
					objectId: obj.MaintenanceNotification,
					itemId: obj.MaintenanceNotificationItem,
					causeId: obj.MaintenanceNotificationCause
				});
			},
			
			/**
			 * table task row select
			 * navigate to notification task
			 */
			onPressTask : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters(), "Tasks");
				
				this.onPressCancel();
				this.getRouter().navTo("task", {
					objectId: obj.MaintenanceNotification,
					itemId: obj.MaintenanceNotificationItem,
					taskId: obj.MaintenanceNotificationTask
				});
			},
			
			/**
			 * table task row select
			 * navigate to notification task
			 */
			onPressActivity : function(oEvent) {
				var obj = this.getTableRowObject(oEvent.getParameters(), "Activities");
				
				this.onPressCancel();
				this.getRouter().navTo("activity", {
					objectId: obj.MaintenanceNotification,
					itemId: obj.MaintenanceNotificationItem,
					activityId: obj.MaintNotificationActivity
				});
			},
			/**
			 * navigate to new notification item
			 */
			onAddItemCausePress : function(){
				this.onPressCancel();
				this.getRouter().navTo("cause", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: this.getView().getBindingContext().getProperty("MaintenanceNotificationItem"),
					causeId: "new"
				});
			},
			/**
			 * navigate to new notification item
			 */
			onAddItemTaskPress : function(){
				this.onPressCancel();
				this.getRouter().navTo("task", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: this.getView().getBindingContext().getProperty("MaintenanceNotificationItem"),
					taskId: "new"
				});
			},
			/**
			 * navigate to new notification item
			 */
			onAddItemActivityPress : function(){
				this.onPressCancel();
				this.getRouter().navTo("activity", {
					objectId: this.getView().getBindingContext().getProperty("MaintenanceNotification"),
					itemId: this.getView().getBindingContext().getProperty("MaintenanceNotificationItem"),
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
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sItemId = oEvent.getParameter("arguments").itemId,
					oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel(),
					isNew = (sItemId === "new");
					
				var sObjectId =  oEvent.getParameter("arguments").objectId;
			    oViewModel.setProperty("/MaintenanceNotification",sObjectId);
				oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				
				oDataModel.metadataLoaded().then( function() {
					oViewModel.setProperty("/isNew", isNew);
					oViewModel.setProperty("/isEdit", !isNew);
					this._setEditMode(isNew);
					this.showAllSmartFields(this.oForm);
					
					if(isNew){
						var oContext = oDataModel.createEntry("/PMNotificationItems");
						oDataModel.setProperty(oContext.sPath+"/MaintenanceNotification", sObjectId);
						oDataModel.setProperty(oContext.sPath+"/MaintNotifObjPrtCodeCatalog", 'B');
						oDataModel.setProperty(oContext.sPath+"/MaintNotifDamageCodeCatalog", 'C');
						this.getView().unbindElement();
						this.getView().setBindingContext(oContext);
						
						var oBundle = this.getModel("i18n").getResourceBundle();
						oViewModel.setProperty("/Title", oBundle.getText("newNotificationItemTitle"));
						oViewModel.setProperty("/busy", false);
					}else{
						var sObjectPath = this.getModel().createKey("PMNotificationItems", {
							MaintenanceNotification :  sObjectId,
							MaintenanceNotificationItem : sItemId
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
				//oViewModel.setProperty("/taskViewPath","to_PMNotificationItemTask");
				//oViewModel.setProperty("/actViewPath","to_PMNotificationItemActivity");
				this.getView().bindElement({
					path: sObjectPath,
					parameters: {
						expand: "to_PMNotificationCause,to_PMNotificationItemTask,to_PMNotificationItemActivity"	
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
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding(),
					oContext = oElementBinding.getBoundContext(),
			    	data = this.getModel().getProperty(oContext.sPath);
					
					if(data.MaintNotifObjPrtCodeCatalog === ""){
						data.MaintNotifObjPrtCodeCatalog = 'B';
					}
					if(data.MaintNotifDamageCodeCatalog === ""){
						data.MaintNotifDamageCodeCatalog = 'C';
					}
				// No data for the binding
				if (!oContext) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				var oResourceBundle = this.getResourceBundle(),
					oObject = oView.getBindingContext().getObject(),
					sObjectId = oObject.MaintenanceNotification,
					sObjectName = oObject.NotificationText;
					
				//to_PMNotificationItemTask
			//	this.generateHelperJsonModel(oContext, "to_PMNotificationItemTask", "Tasks");
				
				//to_PMNotificationItemActivity
			//	this.generateHelperJsonModel(oContext, "to_PMNotificationItemActivity", "Activities");
					
				// Everything went fine.
				this._setNewHeaderTitle(); 
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
				oViewModel.setProperty("/shareOnJamTitle", sObjectName);
				oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},
			
			_setEditMode : function(isEdit){
				if(isEdit){
				this.getModel("objectView").setProperty("/showMode", !isEdit);
				this.getModel("objectView").setProperty("/editMode", isEdit); 
				}else{
					var MaintenanceNotification = this.getModel("objectView").getProperty("/MaintenanceNotification"),
					sPath = this.getModel().getContext("/PMNotifications").getPath(),
					isCompleted = this.getModel().getProperty(sPath+"('"+MaintenanceNotification+"')/IsCompleted"),
					isDeleted = this.getModel().getProperty(sPath+"('"+MaintenanceNotification+"')/IsDeleted");
					
					if(isCompleted || isDeleted){
						this.getModel("objectView").setProperty("/showMode", isEdit);
					}else{
						this.getModel("objectView").setProperty("/showMode", !isEdit);
					}
				}
			},
			
			_setNewHeaderTitle : function(){
				var oContext = this.getView().getBindingContext();
				this.getModel("objectView").setProperty("/Title", this.getModel().getProperty(oContext.sPath+"/MaintNotifItemText"));
			}

		});

	}
);