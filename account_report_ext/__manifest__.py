# -*- coding: utf-8 -*-
{
    'name': "Accout Report Filter by account type",
    'summary': "enable filtering by account type in account report",
    'description': """
        enable filtering by account type in account report
    """,
    'author': "Khaled Said (kerbrose)",
    'website': "https://kerbrose.github.io/",
    'category': 'Uncategorized',
    'version': '0.1',
    'depends': [
        'account_reports',
        'base',
    ],
    'data': [
        'views/account_report.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'account_report_ext/static/src/components/account_report/filters/filters.js',
            'account_report_ext/static/src/components/account_report/filters/account_report_filters.xml',
        ],
    },
    'demo': [
        'demo/demo.xml',
    ],
    'license': 'OPL-1',
    'currency ': 'USD',
    'price': 10,
    'support': 'contact the developer',
}
