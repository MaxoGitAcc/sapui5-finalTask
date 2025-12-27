sap.ui.define([
    "project1/controller/BaseController",
    "project1/util/Validations",
    "project1/util/DateFormatter",
    "sap/f/LayoutType",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, Validations, DateFormatter, LayoutType, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("project1.controller.Detail", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Detail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        formatter: DateFormatter,

        _onRouteMatched: function (oEvent) {
            const sProductId = oEvent.getParameter("arguments").productId;

            const sPath = "/Products(" + sProductId + ")";

            this.getView().bindElement({
                path: sPath,
                model: "oDataV2Model"
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
                return;
            }

            const oDialog = this._oEditDialog;
            const oModel = this.getModel("oDataV2Model");
            const oBundle = this.getModel("i18n").getResourceBundle();

            oModel.submitChanges({
                success: function() {
                    MessageToast.show(oBundle.getText("productEditedSuccessfullyAlert"));
                    oDialog.close();
                },
                error: (oError) => {this._showODataErrorV2(oError, "errorWhenEditingProduct");}   
            })
        },

        _setupLiveValidations: function() {
            const oBundle = this.getModel("i18n").getResourceBundle();
            this._validations = {
                "EditedProductName" : {fn: Validations.isNotEmpty, msg: oBundle.getText("nameInputValidationMsg")},
                "EditedProductDescription" : {fn: Validations.isNotEmpty, msg: oBundle.getText("descriptionInputValidationMsg")},
                "EditedProductReleaseDate" : {fn: Validations.isValidDate, msg: oBundle.getText("releaseDateInputValidationMsg")},
                "EditedProductDiscontinuedDate" : {fn: Validations.isValidDate, msg: oBundle.getText("discontinuedDateInputValidationMsg")},
                "EditedProductRating" : {fn: Validations.isRaitngNumber, msg: oBundle.getText("ratingInputValidationMsg")},
                "EditedProductPrice" : {fn: Validations.isPositiveNumber, msg: oBundle.getText("priceInputValidationMsg")}
            };
        },

        onLiveValidationChangeEM: function(oEvent) {
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
            const oBundle = this.getModel("i18n").getResourceBundle();

            oModel.remove(sPath, {
                success: () => {
                    MessageToast.show(oBundle.getText("productDeletedSuccessfullyAlert"));
                    this.onCloseDetailScreen();
                },
                error: (oError) => {this._showODataErrorV2(oError, "errorWhenDeletingProduct");}   
            });
        },

        _showODataError: function (oError, sI18nKey) {
            const oBundle = this.getModel("i18n").getResourceBundle();
            const sFallback = oBundle.getText(sI18nKey);
        
            let sMessage = "";
        
            try {
                if (oError?.responseText) {
                    const oErrObj = JSON.parse(oError.responseText);
                    sMessage = oErrObj?.error?.message?.value || "";
                } else if (oError?.message) {
                    sMessage = oError.message;
                }
            } catch (e) {
                console.warn("Error parsing backend response:", e);
            }
        
            MessageBox.error(sMessage || sFallback);
        }
    });
});
