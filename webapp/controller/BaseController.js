sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/routing/History",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/Text",
        "sap/m/MessageToast"
    ], function (Controller, JSONModel, History, Dialog, Button, Text, MessageToast) {
        "use strict";

        return Controller.extend("com.evorait.evonotify.controller.BaseController", {
            /**
             * Convenience method for accessing the router.
             * @public
             * @returns {sap.ui.core.routing.Router} the router for this component
             */
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },

            /**
             * Convenience method for getting the view model by name.
             * @public
             * @param {string} [sName] the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel: function (sName) {
                if(this.getView().getModel){
                    return this.getView().getModel(sName);
                }
                return this.getOwnerComponent().getModel(sName);
            },

            /**
             * Convenience method for setting the view model.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * navigate a history page back or to home page
             */
            navBack : function(){
                var sPreviousHash = History.getInstance().getPreviousHash();
                if (sPreviousHash !== undefined) {
                    history.go(-1);
                } else {
                    this.getRouter().navTo("worklist", {}, true);
                }
            },

            /**
             * Getter for the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            /**
             * translate the stausKey from model to app lagunage
             * @param sValue
             * @returns {string|*}
             */
            translateStatusKey: function(sValue){
                if(sValue){
                    return this.getResourceBundle().getText(sValue);
                }
                return "";
            },

            /**
             * save view form
             * if its a new entry set new header title on success
             */
            saveSubmitHandling: function (oForm) {
                var oViewModel = this.getModel("viewModel"),
                    isEditable = oForm.getEditable();

                // validation ok when form editable triggered to false
                if (oForm.check().length === 0) {
                    oViewModel.setProperty("/busy", true);

                    // send only view Model else all data in global model will be submitted
                    return this.getModel().submitChanges({
                        success: function () {
                            oViewModel.setProperty("/busy", false);
                            oForm.setEditable(!isEditable);
                            var sMsg = "";
                            var errMsg = sap.ui.getCore().getMessageManager().getMessageModel().getData();
                            for (var i = 0; i < errMsg.length; i++) {
                                sMsg = sMsg + errMsg[i].message;
                            }
                            if (sMsg === "") {
                                sMsg = this.getModel("i18n").getResourceBundle().getText("saveSuccess");
                            }

                            MessageToast.show(sMsg, {
                                duration: 5000
                            });
                            this._setNewHeaderTitle();
                            oViewModel.setProperty("/isNew", false);
                            oViewModel.setProperty("/isEdit", true);
                        }.bind(this),

                        error: function (oError) {
                            oViewModel.setProperty("/busy", false);
                            this.showSaveErrorPrompt(oError);
                        }.bind(this)
                    });
                } else {
                    oForm.setEditable(!isEditable);
                }
            },

            /**
             * reset form and close editable state
             * delete new created entry and nav back
             */
            cancelFormHandling: function (oForm) {
                var isEditable = oForm.getEditable(),
                    isNew = this.getModel("viewModel").getProperty("/isNew");

                if (isEditable && !isNew) {
                    this.getModel().resetChanges();
                    //this.hideInvalidFields(oForm);
                    this.getView().unbindElement();
                    oForm.setEditable(!isEditable);
                    this.showAllSmartFields(oForm);
                }
                if (isNew) {
                    var oContext = this.getView().getBindingContext();
                    //need to hide mandatory fields so validation will be skipped on toggle editable
                    //this.hideInvalidFields(oForm);
                    this.getModel().deleteCreatedEntry(oContext);
                    this.getView().unbindElement();
                    oForm.setEditable(!isEditable);
                    this.navBack();
                }
            },

            /**
             * save error dialog
             */
            showSaveErrorPrompt: function (error) {
                var oBundle = this.getModel("i18n").getResourceBundle();
                var sTitle = oBundle.getText("errorTitle");
                var sMsg = oBundle.getText("errorText");
                var sBtn = oBundle.getText("buttonClose");

                var dialog = new Dialog({
                    title: sTitle,
                    type: 'Message',
                    state: 'Error',
                    content: new Text({
                        text: sMsg
                    }),
                    beginButton: new Button({
                        text: sBtn,
                        press: this.close
                    }),
                    afterClose: this.destroy
                });
                dialog.open();
            },

            /**
             * generates a json model with a list of expanded entity properties
             * helper for reuse table blockviews
             */
            generateHelperJsonModel: function (oContext, sPropertyName, sModelName) {
                var arr = [],
                    aPaths = oContext.getProperty(sPropertyName);
                if (aPaths) {
                    for (var i = 0; i < aPaths.length; i++) {
                        arr.push(this.getModel().getProperty("/" + aPaths[i]));
                    }
                }
                this.setModel(new JSONModel({
                    modelData: arr
                }), sModelName);
            },

            /**
             * maybe on a last step there needed to hide some SmartFields
             * so on Object view navigation all fields should visible again
             */
            showAllSmartFields: function (oForm) {
                if (oForm) {
                    var smarFields = oForm.getSmartFields();
                    for (var i = 0; smarFields.length > i; i++) {
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
            hideInvalidFields: function (oForm) {
                var invalidFields = oForm.check();
                if (invalidFields.length > 0 && oForm) {
                    var smarFields = oForm.getSmartFields();
                    for (var i = 0; smarFields.length > i; i++) {
                        if (invalidFields.indexOf(smarFields[i].sId) > -1) {
                            smarFields[i].setVisible(false);
                        }
                    }
                }
            },

            getTableRowObject: function (oParameters, sModelName) {
                var oRow = sap.ui.getCore().byId(oParameters.id);
                var sPath = oRow.getBindingContextPath();
                var oObj = this.getModel().getProperty(sPath);

                if (!oObj && sModelName) {
                    var sBinding = oRow.getBindingContext(sModelName);
                    return sBinding.getObject();
                }
                return this.getModel().getProperty(sPath);
            },

            /**
             * saves a new status for notifcation header or task
             */
            saveNewStatus: function (sRequestName, obj) {
                var oViewModel = this.getModel("viewModel");

                this.getModel().callFunction(sRequestName, {
                    method: "POST",
                    urlParameters: obj,
                    success: function (oData, response) {
                        oViewModel.setProperty("/busy", false);
                        var sMsg = "";
                        var errMsg = sap.ui.getCore().getMessageManager().getMessageModel().getData();
                        for (var i = 0; i < errMsg.length; i++) {
                            sMsg = sMsg + errMsg[i].message;
                        }
                        if (sMsg === "") {
                            sMsg = oData.MaintenanceNotification + "/" + (oData.MaintenanceNotificationTask || "") + " "
                                + this.getResourceBundle().getText("msg.saveStatusSuccess");
                        }
                        MessageToast.show(sMsg, {
                            duration: 5000
                        });

                    }.bind(this), // callback function for success

                    error: function (oError) {
                        oViewModel.setProperty("/busy", false);
                        this.showSaveErrorPrompt(oError);
                    }.bind(this)
                });
            }

        });

    }
);