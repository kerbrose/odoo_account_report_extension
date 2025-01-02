import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { AccountReportFilters } from "@account_reports/components/account_report/filters/filters";

patch(AccountReportFilters.prototype, {
    get selectedAccountType() {
        
        let selectedAccountTypecs = this.controller.options.account_types_cs.filter(
            (accountTypecs) => accountTypecs.selected,
        );
        if (
            !selectedAccountTypecs.length ||
            selectedAccountTypecs.length === this.controller.options.account_types_cs.length
        ) {
            return _t("All");
        } else {
            return selectedAccountTypecs.map((accountTypecs) => accountTypecs.name).join(", ");
        }
    },

    get hasExtraOptionsFilter() {
        let res = super.hasExtraOptionsFilter || "filter_account_type_cs" in this.controller.options;
        return res;
    },
});
