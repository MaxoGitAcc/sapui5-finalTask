sap.ui.define([
    "project1/controller/BaseController"
], function(BaseController) {
    'use strict';
    
    return BaseController.extend("project1.controller.ObjectPage", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Product")
                .attachPatternMatched(this._onRouteMatched, this);
        },
        
        _onRouteMatched: function (oEvent) {
            console.log("Route args:", oEvent.getParameter("arguments"));
        }
        
    });
});