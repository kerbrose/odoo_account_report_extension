/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { AccountReportFilters } from "@account_reports/components/account_report/filters/filters";

patch(AccountReportFilters.prototype, {

    async filterAccountTypeCS(AccountTypeItem) {

        AccountTypeItem.selected = !AccountTypeItem.selected;

        await this.controller.reload('account_types_cs', this.controller.options);
    },

    get hasExtraOptionsFilter() {
        let res = super.hasExtraOptionsFilter || "filter_account_type_cs" in this.controller.options;
        return res;
    },
});
