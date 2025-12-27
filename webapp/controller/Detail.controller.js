sap.ui.define([
    "project1/controller/BaseController",
    "project1/util/Validations",
    "sap/f/LayoutType",
    "sap/m/MessageToast"
], function (BaseController, Validations, LayoutType, MessageToast) {
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


        //EDIT BTN
        _createEditDialog: async function() {
            if(!this._oEditDialog) {
                this._oEditDialog = await this.loadFragment({
                    name: "project1.view.fragments.EditProductDialog"
                });

                this._setupLiveValidations();
                this.getView().addDependent(this._oEditDialog);
            }

            return this._oEditDialog;
        },

        onDetailEditBtnPress: async function() {
            const oDialog = await this._createEditDialog();
            oDialog.open();
        },

        onCanelEditBtn: function() {
            const oModel = this.getModel("oDataV2Model");
            oModel.resetChanges();
            this._oEditDialog.close();
        },

        onSaveEditBtn: function() {
            if(!this._validateRequiredFields()) {
                MessageToast.show("Please correct the errors before saving.");
                return;
            }

            const oDialog = this._oEditDialog;
            const oModel = this.getModel("oDataV2Model");

            oModel.submitChanges({
                success: function() {
                    oDialog.close();
                },
                error: function() {
                    MessageToast.show("Error saving changes");
                }
            })
        },

        _setupLiveValidations: function() {
            this._validations = {
                "EditedProductName" : {fn: Validations.isNotEmpty, msg: "Name cannot be empty"},
                "EditedProductDescription" : {fn: Validations.isNotEmpty, msg: "Description cannot be empty"},
                "EditedProductReleaseDate" : {fn: Validations.isValidDate, msg: "Release Date is invalid"},
                "EditedProductDiscontinuedDate" : {fn: Validations.isValidDate, msg: "Discontinued Date is invalid"},
                "EditedProductRating" : {fn: Validations.isPositiveNumber, msg: "Rating must be a positive number"},
                "EditedProductPrice" : {fn: Validations.isPositiveNumber, msg: "Price must be a positive number"}
            };
        },

        _onLiveValidationChangeEM: function(oEvent) {
            const oInput = oEvent.getSource();
            const sInputId = oInput.getId().split("--").pop();
            const oValidation = this._validations[sInputId];

            if(oValidation) {
                oValidation.fn(oInput, oValidation.msg);
            }
        },

        _validateRequiredFields: function() {
            let bValid = true;
        
            for (let sId in this._validations) {
                const oControl = this.byId(sId);
                const validator = this._validations[sId];
        
                if (oControl && validator) {
                    if (!validator.fn(oControl, validator.msg)) {
                        bValid = false;
                    }
                }
            }
        
            return bValid;
        },

        //Delete BTN
        onDetailDeleteBtnPress: function() {
            const oModel = this.getModel("oDataV2Model");
            const sPath = this.getView().getBindingContext("oDataV2Model").getPath();

            oModel.remove(sPath, {
                success: () => {
                    MessageToast.show("Product deleted successfully");
                    this.onCloseDetailScreen();
                },
                error: () => {
                    MessageToast.show("Error deleting product");
                }
            });
        }
    });
});
