/*global location*/
sap.ui.define([
        "com/evorait/evonotify/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/routing/History",
        "com/evorait/evonotify/model/formatter",
        'sap/ui/model/Filter'
    ], function (
    BaseController,
    JSONModel,
    History,
    formatter,
    Filter
    ) {
        "use strict";

        return BaseController.extend("com.evorait.evonotify.controller.ObjectTask", {

            formatter: formatter,

            /* =========================================================== */
            /* lifecycle methods                                           */
            /* =========================================================== */

            /**
             * Called when the worklist controller is instantiated.
             * @public
             */
            onInit: function () {
                this.getRouter().getRoute("task").attachPatternMatched(this._onObjectMatched, this);
            },

            /* =========================================================== */
            /* event handlers                                              */
            /* =========================================================== */

            /**
             * Event handler  for navigating back.
             * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
             * If not, it will replace the current entry of the browser history with the worklist route.
             * @public
             */
            onNavBack: function () {
                if (this.oForm) {
                    this.cancelFormHandling(this.oForm);
                }
                if (!this.getModel("viewModel").getProperty("/isNew")) {
                    this.navBack();
                }
            },

            navBack: function () {
                var sPreviousHash = History.getInstance().getPreviousHash();
                var oContext = this.getView().getBindingContext();

                if (sPreviousHash !== undefined) {
                    history.go(-1);
                } else if (oContext) {
                    var obj = oContext.getObject();
                    if (parseInt(obj.MaintenanceNotificationItem) === 0) {
                        this.getRouter().navTo("object", {objectId: obj.MaintenanceNotification}, true);
                    } else {
                        this.getRouter().navTo("item", {
                            objectId: obj.MaintenanceNotification,
                            itemId: obj.MaintenanceNotificationItem
                        }, true);
                    }
                } else {
                    this.getRouter().navTo("worklist", {}, true);
                }
            },

            /**
             * show edit forms
             */
            onPressEdit: function () {
                this._setEditMode(true);
            },

            onPressSave: function () {
                if (this.oForm) {
                    this.saveSubmitHandling(this.oForm);
                }
            },

            onPressCancel: function () {
                if (this.oForm) {
                    this.cancelFormHandling(this.oForm);
                }
            },

            /**
             * Show select status dialog with maybe pre-selected filter
             * @param oEvent
             */
            onSelectStatus : function (oEvent) {
                var oParams = oEvent.getParameters(),
                    statusKey = oParams.item.getKey();

                if(statusKey){
                    this.saveNewStatus("/UpdateTaskStatus", {
                        "MaintNotification": this._oContext.getProperty("MaintenanceNotification"),
                        "MaintNotifTask": this._oContext.getProperty("MaintenanceNotificationTask"),
                        "MaintStatus": statusKey
                    });
                }
            },

            /**
             * fired edit toggle event from subsection block DetailsFormBlock
             */
            onFiredEditMode: function (oEvent) {
                var oParameters = oEvent.getParameters();
                this._setEditMode(oParameters.editable);

                if (!this.oForm) {
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
            _onObjectMatched: function (oEvent) {
                var oParameters = oEvent.getParameter("arguments"),
                    sObjectId = oParameters.objectId,
                    sItemId = oParameters.itemId,
                    sTaskId = oParameters.taskId,
                    oViewModel = this.getModel("viewModel"),
                    oDataModel = this.getModel(),
                    isNew = (sTaskId === "new");

                oDataModel.metadataLoaded().then(function () {
                    oViewModel.setProperty("/isNew", isNew);
                    oViewModel.setProperty("/isEdit", !isNew);
                    this._setEditMode(isNew);
                    this.showAllSmartFields(this.oForm);

                    if (isNew) {
                        var oContext = oDataModel.createEntry("/PMNotificationTasks");
                        oDataModel.setProperty(oContext.sPath + "/MaintenanceNotification", sObjectId);
                        oDataModel.setProperty(oContext.sPath + "/MaintenanceNotificationItem", sItemId);
                        oDataModel.setProperty(oContext.sPath + "/MaintNotifTaskCodeCatalog", '2');
                        this.getView().unbindElement();
                        this.getView().setBindingContext(oContext);

                        var oBundle = this.getModel("i18n").getResourceBundle();
                        oViewModel.setProperty("/Title", oBundle.getText("newNotificationTaskTitle"));
                        oViewModel.setProperty("/busy", false);

                    } else {
                        var sObjectPath = this.getModel().createKey("PMNotificationTasks", {
                            MaintenanceNotification: sObjectId,
                            MaintenanceNotificationItem: sItemId,
                            MaintenanceNotificationTask: sTaskId
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
            _bindView: function (sObjectPath) {
                var oViewModel = this.getModel("viewModel"),
                    oDataModel = this.getModel();

                this.getView().bindElement({
                    path: sObjectPath,
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

            _onBindingChange: function () {
                var oView = this.getView(),
                    oViewModel = this.getModel("viewModel"),
                    oElementBinding = oView.getElementBinding(),
                    oContext = oElementBinding.getBoundContext(),
                    data = this.getModel().getProperty(oContext.sPath);

                if (data.MaintNotifTaskCodeCatalog === "") {
                    data.MaintNotifTaskCodeCatalog = '2';
                }
                // No data for the binding
                if (!oContext) {
                    this.getRouter().getTargets().display("objectNotFound");
                    return;
                }
                // Everything went fine.
                this._setNewHeaderTitle();
                oViewModel.setProperty("/busy", false);
            },
            _setEditMode: function (isEdit) {
                this.getModel("viewModel").setProperty("/editMode", isEdit);
            },
            _setNewHeaderTitle: function () {
                var oContext = this.getView().getBindingContext();
                this.getModel("viewModel").setProperty("/Title", this.getModel().getProperty(oContext.sPath + "/MaintNotifTaskText"));
            }

        });

    }
);