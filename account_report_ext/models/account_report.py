from odoo import models, fields, api, _, osv
from odoo.tools import Query


class AccountReport(models.Model):
    _inherit = 'account.report'

    filter_account_type_cs = fields.Boolean(
        string="Filter by Account Type custom", compute=lambda x: x._compute_report_option_filter('filter_account_type_cs'),
        readonly=False, store=True, depends=['root_report_id', 'section_main_report_ids'],)

    def _init_options_account_type_cs(self, options, previous_options, additional_journals_domain=None):
        if not self.filter_account_type_cs:
            return
        
        if  not previous_options:
            previous_options = {}

        options['filter_account_type_cs'] = True

        account_types = dict(self.env['account.account']._fields['account_type'].selection)
        account_type_list = [{'id': x, 'name': _(str(y)), 'selected': False} for x,y in account_types.items()]

        options['account_types_cs'] = account_type_list

        previous_account_type_cs = previous_options.get('account_types_cs', [])
        options['name_account_types_cs'] = previous_options['name_account_types_cs'] if previous_options.get('name_account_types_cs', None) else 'All'

        
        if previous_account_type_cs:
            previously_selected_name = {x['name'] for x in previous_options['account_types_cs'] if x.get('selected')}
            options['name_account_types_cs'] = '{name:.10}{_dots}'.format(name=(', '.join(previously_selected_name)), _dots='...')
            previously_selected = {x['id'] for x in previous_options['account_types_cs'] if x.get('selected')}
            for opt in options['account_types_cs']:
                opt['selected'] = opt['id'] in previously_selected

    @api.model
    def _get_options_account_type_cs_domain(self, options):
        account_type_cs = options.get('account_types_cs', [])
        if not account_type_cs:
            return []
        account_type_cs_ids = [x['id'] for x in account_type_cs if x.get('selected')]
        if account_type_cs_ids:
            return [('account_type', 'in', account_type_cs_ids)]
        return []
    
    def _get_options_domain(self, options, date_scope):
        self.ensure_one()
        domain = super()._get_options_domain(options, date_scope)

        # Get the analytic accounts that we need to filter on from the options and add a domain for them.
        if 'account_types_cs' in options:
            domain = osv.expression.AND([
                domain,
                self._get_options_account_type_cs_domain(options),
            ])

        return domain