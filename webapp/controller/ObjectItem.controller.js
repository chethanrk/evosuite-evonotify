/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"com/evorait/evolite/evonotify/model/formatter",
	    "sap/m/MessageToast"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		MessageToast
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
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						isNew : false,
						isEdit : false,
						showMode: false,
						editMode : false
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
				var sPreviousHash = History.getInstance().getPreviousHash();
				var oObject = this.getView().getBindingContext().getObject(),
					sObjectId = oObject ? oObject.MaintenanceNotification : this.sObjectId;
					
					console.log(oObject);

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else  if(sObjectId) {
					this.getRouter().navTo("object", {objectId: sObjectId}, true);
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
					var oViewModel = this.getModel("objectView");
					var isEditable = this.oForm.getEditable();
					var invalidFields = this.oForm.check();
					
					// validation ok when form editable triggered to false
					if(invalidFields.length === 0){
						this.getModel("objectView").setProperty("/busy", true);
						
						this.getView().getModel().submitChanges({
							success: function(){
								oViewModel.setProperty("/busy", false);
								this.oForm.setEditable(!isEditable);
								
								var sMsg = this.getModel("i18n").getResourceBundle().getText("saveSuccess");
								MessageToast.show(sMsg, {duration: 5000});
								
								oViewModel.setProperty("/isNew", false);
								oViewModel.setProperty("/isEdit", true);
								var oContext = this.getView().getBindingContext();
								oViewModel.setProperty("/Title", this.getModel().getProperty(oContext.sPath+"/MaintNotifItemText"));
							}.bind(this),
							
							error: function(oError){
								this.getModel("objectView").setProperty("/busy", false);
								this.getOwnerComponent().showSaveErrorPrompt(oError);
							}.bind(this)
						 });
					}else{
						this.oForm.setEditable(!isEditable);
					}
				}
			},
			
			onPressCancel : function(){
				if(this.oForm){
					var isEditable = this.oForm.getEditable();
					var invalidFields = this.oForm.check();
					var isNew = this.getModel("objectView").getProperty("/isNew");
					
					if(isEditable && !isNew){
						this.getView().getModel().resetChanges();
						this._hideInvalidFields(invalidFields);
						this.oForm.setEditable(!isEditable);
						this._showAllSmartFields();
					}
					if(isNew){
						var oContext = this.getView().getBindingContext();
						//need to hide mandatory fields so validation will be skipped on toggle editable
						this._hideInvalidFields(invalidFields);
						this.oForm.setEditable(!isEditable);
						this.getModel().deleteCreatedEntry(oContext);
						this.getRouter().navTo("object", {objectId: this.sObjectId}, true);
					}
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
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sItemId = oEvent.getParameter("arguments").itemId,
					oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel(),
					isNew = (sItemId === "new");
					
				this.sObjectId =  oEvent.getParameter("arguments").objectId;
				oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				
				oDataModel.metadataLoaded().then( function() {
					oViewModel.setProperty("/isNew", isNew);
					oViewModel.setProperty("/isEdit", !isNew);
					this._setEditMode(isNew);
					this._showAllSmartFields();
					
					if(isNew){
						var oContext = oDataModel.createEntry("/PMNotificationItems");
						oDataModel.setProperty(oContext.sPath+"/MaintenanceNotification", this.sObjectId);
						this.getView().unbindElement();
						this.getView().setBindingContext(oContext);
						
						var oBundle = this.getModel("i18n").getResourceBundle();
						oViewModel.setProperty("/Title", oBundle.getText("newNotificationItemTitle"));
						oViewModel.setProperty("/busy", false);
					}else{
						var sObjectPath = this.getModel().createKey("PMNotificationItems", {
							MaintenanceNotification :  this.sObjectId,
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

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								// Busy indicator on view should only be set if metadata is loaded,
								// otherwise there may be two busy indications next to each other on the
								// screen. This happens because route matched handler already calls '_bindView'
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
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				var oResourceBundle = this.getResourceBundle(),
					oObject = oView.getBindingContext().getObject(),
					sObjectId = oObject.MaintenanceNotification,
					sObjectName = oObject.NotificationText;

				// Everything went fine.
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
				oViewModel.setProperty("/shareOnJamTitle", sObjectName);
				oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},
			
			_setEditMode : function(isEdit){
				this.getModel("objectView").setProperty("/showMode", !isEdit);
				this.getModel("objectView").setProperty("/editMode", isEdit);
			},
			
			/**
			 * maybe on a last step there needed to hide some SmartFields
			 * so on Object view navigation all fields should visible again
			 */
			_showAllSmartFields : function(){
				if(this.oForm){
					var smarFields = this.oForm.getSmartFields();
					for(var i=0; smarFields.length > i; i++){
						smarFields[i].setVisible(true);
					}
				}
			},
			/**
			 * workaround for cancel a new entry
			 * mandatory and filled fields are always validated
			 * currently there is always a validation on change editable
			 * but when fields are invisible validation breaks
			 */
			_hideInvalidFields : function(invalidFields){
				if(invalidFields.length > 0 && this.oForm){
					var smarFields = this.oForm.getSmartFields();
					for(var i=0; smarFields.length > i; i++){
						if(invalidFields.indexOf(smarFields[i].sId) > -1){
							smarFields[i].setVisible(false);
						}
					}
				}
			}

		});

	}
);