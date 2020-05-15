sap.ui.define([
	"com/evorait/evonotify/controller/BaseController",
	"com/evorait/evonotify/model/formatter",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/ViewType"
], function (BaseController, formatter, CoreView, ViewType) {
	"use strict";

	return BaseController.extend("com.evorait.evonotify.controller.ObjectNew", {

		formatter: formatter,

		oViewModel: null,

		oCreateTemplate: null,

		mTemplates: {},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * worklist on init
		 */
		onInit: function () {

			var oRouter = this.getRouter();
			//route for page create new order
			oRouter.getRoute("CreateNotification").attachMatched(function (oEvent) {
				var sViewName = "com.evorait.evonotify.view.templates.CreateNotification";
				this._onRouteMatched(oEvent, sViewName, "_getCreateEntryPath", "PMNotificationSet");
			}, this);

			//route for page order details
			// oRouter.getRoute("OrderDetail").attachMatched(function (oEvent) {
			// 	this.oViewModel.setProperty("/route", "OrderDetail");
			// 	var oArgs = oEvent.getParameter("arguments"),
			// 		sViewName = "com.evorait.evonotify.view.templates.OrderDetail",
			// 		mParams = {
			// 			WorkOrder: oArgs.WorkOrder
			// 		};
			// 	this._onRouteMatched(oEvent, sViewName, "_getExistEntryPath", "WOHeaderSet", mParams);
			// }, this);
		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {

		},

		/**
		 * Object after rendering
		 */
		onAfterRendering: function () {},

		/**
		 * Object on exit
		 */
		onExit: function () {

		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * create new path for create page binding from entitySet
		 * @param sEntitySet
		 */
		_getCreateEntryPath: function (sEntitySet) {
			var oContext = this.getModel().createEntry("/" + sEntitySet);
			return oContext.getPath();
		},

		/**
		 * get path for detail page binding from entitySet
		 * @param sEntitySet
		 * @param mParams
		 */
		_getExistEntryPath: function (sEntitySet, mParams) {
			return "/" + this.getModel().createKey(sEntitySet, mParams);
		},

		/**
		 * new order create
		 * @param oEvent
		 * @private
		 */
		_onRouteMatched: function (oEvent, sViewName, oObjectFn, sEntitySet, mParams) {
			this.oViewModel = this.getModel("viewModel");
			this.oViewModel.setProperty("/busy", true);
			this.getModel().metadataLoaded().then(function () {
				var sPath = null;

				if (this[oObjectFn]) {
					sPath = this[oObjectFn](sEntitySet, mParams);
					this.getView().unbindElement();
					this.getView().bindElement(sPath);
					//get template and create views
					this._setTemplateFragment(sPath, sViewName);
				} else {
					this.oViewModel.setProperty("/busy", false);
				}
			}.bind(this));
		},

		/**
		 * Get page template for generic object page by annotations
		 * Only create new view from template when wrapper content is empty
		 * Will prevent too much loading time 
		 * in template controller onAfterrendering is still called after navigations also when content is already in page
		 */
		_setTemplateFragment: function (sPath, sViewName, isNew) {
			var oViewContainer = this.getView().byId("ObjectPageWrapper"),
				aContent = oViewContainer.getContent();

			if (aContent.length > 0 && (aContent[0].getViewName() !== sViewName && isNew)) {
				oViewContainer.removeAllContent();
				aContent = oViewContainer.getContent();
			}

			if (aContent.length === 0 && sPath) {

				if (this.mTemplates[sViewName]) {
					//when template was already in use then just integrate in viewContainer and bind new path
					//will improve performance
					this._bindView(this.mTemplates[sViewName], sPath);
					oViewContainer.insertContent(this.mTemplates[sViewName]);
				} else {
					//load template view ansync and interpret annotations based on metadata model
					//and bind view path and save interpreted template global for reload
					var oMetaModel = this.getModel().getMetaModel();
					oMetaModel.loaded().then(function () {
						this._createView(oMetaModel, sPath, sViewName).then(function (oTemplateView) {
							this._bindView(oTemplateView, sPath);
							this.mTemplates[sViewName] = oTemplateView;
							oViewContainer.insertContent(oTemplateView);
						}.bind(this));
					}.bind(this));
				}
			} else {
				this._bindView(aContent[0], sPath);
			}
		},

		/**
		 * create view and set owner component for routing
		 * and calls for getOwnerComponent() in nested views and blocks
		 * @param oMetaModel
		 * @param sPath
		 * @param sViewName
		 */
		_createView: function (oMetaModel, sPath, sViewName) {
			var fnCreateView = function () {
				return CoreView.create({
					async: true,
					models: this.getModel(),
					preprocessors: {
						xml: {
							bindingContexts: {
								meta: oMetaModel.getMetaContext(sPath)
							},
							models: {
								meta: oMetaModel
							}
						}
					},
					type: ViewType.XML,
					viewName: sViewName
				});
			}.bind(this);

			var oOwnerComponent = this.getOwnerComponent();
			if (oOwnerComponent) {
				return oOwnerComponent.runAsOwner(fnCreateView);
			} else {
				return fnCreateView();
			}
		},

		/**
		 * bind special view control with new path
		 * @param oView
		 * @param sPath
		 */
		_bindView: function (oView, sPath) {
			oView.unbindElement();
			oView.bindElement({
				path: sPath,
				events: {
					change: function () {
						this.oViewModel.setProperty("/busy", false);
					}.bind(this),
					dataRequested: function () {}.bind(this),
					dataReceived: function () {}.bind(this)
				}
			});
		}
	});
});