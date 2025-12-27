sap.ui.define([
    "sap/ui/core/date/UI5Date",
    "sap/ui/core/format/DateFormat"
], function (UI5Date, DateFormat) {
    "use strict";

    const oMonthYearFormatter = DateFormat.getDateInstance({
        pattern: "MMMM yyyy"
    });

    return {
        formatMonthYear: function (oEdmDate) {
            const oUI5Date = UI5Date.getInstance(oEdmDate);
            return oMonthYearFormatter.format(oUI5Date);
        }
    };
});
