/*global location*/
sap.ui.define([
		"com/evorait/evolite/evonotify/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"com/evorait/evolite/evonotify/model/formatter"
	], function (
		BaseController,
		JSONModel,
		formatter
	) {
		"use strict";

		return BaseController.extend("com.evorait.evolite.evonotify.block.details.DetailsFormBlockController", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			onEditPress : function (oEvent) {
				this.oParentBlock.fireEditPress(oEvent.getParameters());
			},
			
			onChecked : function (oEvent) {
				this.oParentBlock.fireOnChecked(oEvent.getParameters());
			},
			
			onEditChanged : function(oEvent){
				var oSource = oEvent.getSource();
				if(!oSource.getEditable() && !oSource.getValue() && this.getModel("objectView").getProperty("/isNew")){
					oSource.setVisible(false);
				}else{
					oSource.setVisible(true);
				}
			}
			
			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

		});

	}
);