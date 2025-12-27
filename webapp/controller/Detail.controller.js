sap.ui.define([
    "project1/controller/BaseController",
    "sap/f/LayoutType"
], function (BaseController, LayoutType) {
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

            const oFCL = this.getView().getParent().getParent();
            if (oFCL.getLayout() !== LayoutType.TwoColumnsMidExpanded) {
                oFCL.setLayout(LayoutType.TwoColumnsMidExpanded);
            }
        },

        onCloseDetailScreen: function() {
            const oFCL = this.getView().getParent().getParent();
            oFCL.setLayout(LayoutType.OneColumn);
        
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteMain", {}, true);
        },
    });
});
