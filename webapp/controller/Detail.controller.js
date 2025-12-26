sap.ui.define([
    "project1/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("project1.controller.Detail", {

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Detail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sProductId = oEvent.getParameter("arguments").productId;

            const sPath = "/Products(" + sProductId + ")";

            this.getView().bindElement({
                path: sPath,
                model: "oDataV2Model",
                parameters: {
                    expand: "Supplier"
                }
            });
        }
    });
});
