odoo.define('sakkab_account_report.account_report_generic', function (require) {
    'use strict';

    var core = require('web.core');
    var RelationalFields = require('web.relational_fields');
    var StandaloneFieldManagerMixin = require('web.StandaloneFieldManagerMixin');
    var Widget = require('web.Widget');
    var accountReportsWidget = require('account_reports.account_report');
    var QWeb = core.qweb;
    var _t = core._t;


    var M2MReportFilters = Widget.extend(StandaloneFieldManagerMixin, {
        /**
         * @constructor
         * @param {Object} fields
         */
        init: function (parent, fields) {
            this._super.apply(this, arguments);
            StandaloneFieldManagerMixin.init.call(this);
            this.fields = fields;
            this.widgets = {};
        },
        /**
         * @override
         */
        willStart: function () {
            var self = this;
            var defs = [this._super.apply(this, arguments)];
            _.each(this.fields, function (field, fieldName) {
                defs.push(self._makeM2MWidget(field, fieldName));
            });
            return Promise.all(defs);
        },
        /**
         * @override
         */
        start: function () {
            var self = this;
            var $content = $(QWeb.render("m2mWidgetTable", { fields: this.fields }));
            self.$el.append($content);
            _.each(this.fields, function (field, fieldName) {
                self.widgets[fieldName].appendTo($content.find('#' + fieldName + '_field'));
            });
            return this._super.apply(this, arguments);
        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * This method will be called whenever a field value has changed and has
         * been confirmed by the model.
         *
         * @private
         * @override
         * @returns {Promise}
         */
        _confirmChange: function () {
            var self = this;
            var result = StandaloneFieldManagerMixin._confirmChange.apply(this, arguments);
            var data = {};
            _.each(this.fields, function (filter, fieldName) {
                data[fieldName] = self.widgets[fieldName].value.res_ids;
            });
            this.trigger_up('value_changed', data);
            return result;
        },
        /**
         * This method will create a record and initialize M2M widget.
         *
         * @private
         * @param {Object} fieldInfo
         * @param {string} fieldName
         * @returns {Promise}
         */
        _makeM2MWidget: function (fieldInfo, fieldName) {
            var self = this;
            var options = {};
            options[fieldName] = {
                options: {
                    no_create_edit: true,
                    no_create: true,
                }
            };
            let domain = [];
            if (fieldInfo.domain) {
                domain.push(...fieldInfo.domain);
            }
            return this.model.makeRecord(fieldInfo.modelName, [{
                fields: [{
                    name: 'id',
                    type: 'integer',
                }, {
                    name: 'display_name',
                    type: 'char',
                }],
                name: fieldName,
                relation: fieldInfo.modelName,
                type: 'many2many',
                value: fieldInfo.value,
                domain: domain,
            }], options).then(function (recordID) {
                self.widgets[fieldName] = new RelationalFields.FieldMany2ManyTags(self,
                    fieldName,
                    self.model.get(recordID),
                    { mode: 'edit', }
                );
                self._registerWidget(recordID, fieldName, self.widgets[fieldName]);
            });
        },
    });


    accountReportsWidget.include({

        custom_events: _.extend({}, accountReportsWidget.prototype.custom_events, {

            'value_changed': function (ev) {
                var self = this;

                self.report_options.child_ids = ev.data.child;
                self.report_options.child_categories = ev.data.tags;
                self.report_options.sale_user_ids = ev.data.user;
                self.report_options.sales_team_ids = ev.data.sales_team;
                self.report_options.partner_ids = ev.data.partner_ids;
                self.report_options.partner_categories = ev.data.partner_categories;
                self.report_options.analytic_accounts = ev.data.analytic_accounts;
                self.report_options.analytic_tags = ev.data.analytic_tags;
                return self.reload().then(function () {
                    console.log();
                });
            },
        }),

        render_searchview_buttons: function () {
            var self = this;

            self._super();

            if (this.report_options.child) {

                if (!this.M2MChildFilters) {
                    var fields = {};
                    let domain = [['company_type', '=', 'person']];
                    if ('child_ids' in this.report_options) {
                        fields['child'] = {
                            label: _t('Child'),
                            modelName: 'res.partner',
                            domain: domain,
                            value: this.report_options.child_ids.map(Number),
                        };
                    }
                    if ('child_categories' in this.report_options) {
                        fields['tags'] = {
                            label: _t('Tags'),
                            modelName: 'res.partner.category',
                            value: this.report_options.child_categories.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.M2MChildFilters = new M2MReportFilters(this, fields);
                        this.M2MChildFilters.appendTo(this.$searchview_buttons.find('.js_account_child_m2m'));
                    }
                } else {
                    this.$searchview_buttons.find('.js_account_child_m2m').append(this.M2MChildFilters.$el);
                }
            }

            if (this.report_options.sale_user) {

                if (!this.M2MUserFilters) {
                    var fields = {};
                    if ('sale_user_ids' in this.report_options) {
                        fields['user'] = {
                            label: _t('User'),
                            modelName: 'res.users',
                            value: this.report_options.child_ids.map(Number),
                        };
                    }
                    if ('sales_team_ids' in this.report_options) {
                        fields['sales_team'] = {
                            label: _t('Sales Team'),
                            modelName: 'crm.team',
                            value: this.report_options.sales_team_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.M2MUserFilters = new M2MReportFilters(this, fields);
                        this.M2MUserFilters.appendTo(this.$searchview_buttons.find('.js_account_user_m2m'));
                    }
                } else {
                    this.$searchview_buttons.find('.js_account_user_m2m').append(this.M2MUserFilters.$el);
                }
            }
        },

    });

});
