from odoo import api, fields, models, _


class AccountMoveLine(models.Model):

    _inherit = 'account.move.line'

    account_type = fields.Selection(related='account_id.account_type')
