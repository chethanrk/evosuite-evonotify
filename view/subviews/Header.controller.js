sap.ui.define(["sap/ui/core/mvc/Controller"], function(BaseController) {
    "use strict";

    return BaseController.extend("sap.ui.evora.en.view.subviews.Header", {

        onInit: function() {
        },
        onExit: function() {
        },

        _onPressOpenMenuPopover: function(oEvent) {

            var source = oEvent.getSource();
            var bindingContext = source.getBindingContext();
            var path = (bindingContext) ? bindingContext.getPath() : null;
            var model = (bindingContext) ? bindingContext.getModel() : this.getView().getModel();

            var popoverName = models.Config.POPOVER.MENU;
            this.popovers = this.popovers || {};
            var popover = this.popovers[popoverName];

            var view;
            if (!popover) {
                view = sap.ui.xmlview({
                    viewName: models.Config.VIEW_NAME + popoverName
                });
                view._sOwnerId = this.getView()._sOwnerId;
                popover = view.getContent()[0];
                popover.setPlacement("Left" || "Auto");
                this.popovers[popoverName] = popover;
            }
            popover.setModel(model);
            popover.openBy(oEvent.getSource());
            if (view) {
                popover.attachAfterOpen(function() {
                    popover.rerender();
                });
            } else {
                view = popover.getParent();
            }
            view.setModel(model);
            //view.bindElement(path, {});
        }
    });
}, /* bExport= */ true);