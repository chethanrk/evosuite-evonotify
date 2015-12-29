sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
	"use strict";

	return BaseController.extend("evora.en.view.NotificationForm", {

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("NotificationForm").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		handleRouteMatched: function(oEvent) {
			var params = {};
			if (oEvent.mParameters.data.context || oEvent.mParameters.data.masterContext) {
				this.sContext = oEvent.mParameters.data.context;
				this.sMasterContext = oEvent.mParameters.data.masterContext;

				if (!this.sContext) {
					this.getView().bindElement("/" + this.sMasterContext, params);
				} else {
					this.getView().bindElement("/" + this.sContext, params);
				}

			}

		},
		_onPressNpsapmButton14491332818400LJ: function(oEvent) {
			var popoverName = "P0";
			this.popovers = this.popovers || {};
			var popover = this.popovers[popoverName];
			var source = oEvent.getSource();
			var bindingContext = source.getBindingContext();
			var path = (bindingContext) ? bindingContext.getPath() : null;
			var model = (bindingContext) ? bindingContext.getModel() : this.getView().getModel();
			var view;
			if (!popover) {
				view = sap.ui.xmlview({
					viewName: "evora.en.view." + popoverName
				});
				view._sOwnerId = this.getView()._sOwnerId;
				popover = view.getContent()[0];
				popover.setPlacement("Left" || "Auto");
				this.popovers[popoverName] = popover;
			}
			popover.openBy(oEvent.getSource());
			if (view) {
				popover.attachAfterOpen(function() {
					popover.rerender();
				});
			} else {
				view = popover.getParent();
			}
			view.setModel(model);
			view.bindElement(path, {});
		},
		_onPressNpsapmButton1449472895435030: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("NotificationList");
		},
		_onPressNpsapmButton1449472982080057: function() {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Dashboard");
		},
		_onValueHelpRequestNpsapmInput14494239223720C9: function(oEvent) {
			var dialogName = "D2";
			this.dialogs = this.dialogs || {};
			var dialog = this.dialogs[dialogName];
			var source = oEvent.getSource();
			var bindingContext = source.getBindingContext();
			var path = (bindingContext) ? bindingContext.getPath() : null;
			var model = (bindingContext) ? bindingContext.getModel() : this.getView().getModel();
			var view;
			if (!dialog) {
				view = sap.ui.xmlview({
					viewName: "evora.en.view." + dialogName
				});
				view._sOwnerId = this.getView()._sOwnerId;
				dialog = view.getContent()[0];
				this.dialogs[dialogName] = dialog;
			}
			dialog.open();
			if (view) {
				dialog.attachAfterOpen(function() {
					dialog.rerender();
				});
			} else {
				view = dialog.getParent();
			}
			view.setModel(model);
			view.bindElement(path, {});
		},
		_onValueHelpRequestNpsapmInput14494240254460CD: function(oEvent) {
			var dialogName = "D3";
			this.dialogs = this.dialogs || {};
			var dialog = this.dialogs[dialogName];
			var source = oEvent.getSource();
			var bindingContext = source.getBindingContext();
			var path = (bindingContext) ? bindingContext.getPath() : null;
			var model = (bindingContext) ? bindingContext.getModel() : this.getView().getModel();
			var view;
			if (!dialog) {
				view = sap.ui.xmlview({
					viewName: "evora.en.view." + dialogName
				});
				view._sOwnerId = this.getView()._sOwnerId;
				dialog = view.getContent()[0];
				this.dialogs[dialogName] = dialog;
			}
			dialog.open();
			if (view) {
				dialog.attachAfterOpen(function() {
					dialog.rerender();
				});
			} else {
				view = dialog.getParent();
			}
			view.setModel(model);
			view.bindElement(path, {});
		}
	});
}, /* bExport= */ true);