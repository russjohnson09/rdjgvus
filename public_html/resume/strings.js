//localization strings

            
var i18n = {
    'eng': {
        'contact_info': 'Contact Info',
        'russ_full' : 'Russell Johnson',
        'education' : 'Education',
        'programming' : 'Programming',
        'web' : 'Web',
        'javascript': 'Javascript',
        'csharp': 'C#',
        'mumps': 'Mumps',
        'python': 'Python',
        'cplus': 'C++',
        'vb': 'Visual Basic',
        'grand_valley': 'Grand Valley State University',
        'node':'Node.js',
        'django': 'Django',
        'html': 'HTML5',
        'css': 'CSS',
        'xml_xsl': 'XML/XSL',
        'meteor': 'Meteor',
        'database': 'Database',
        'industry_knowledge': 'Industry Knowldge',
        'emr': 'Electronic Medical Record Software',
        'emr_abr': 'EMR Software',
        'pb': 'Professional Billing',
        'languages': 'Languages',
        'mongo': 'MongoDB',
        'indexed': 'IndexedDB',
        'sqlite': 'SQLite',
        'chronicles': 'Chronicles',
        'lib': 'Library',
        'ed2': 'BA in Mathematics with a Minor in Computer Science (GPA 3.65)',
        'handlebars': 'Handlebars',
        'jquery': 'jQuery',
        'knockout': 'Knockout',
        'radio': 'Radio',
        'epic': 'Epic Systems',
        'epic_full': 'Epic Systems Verona, WI (2013-Present)',
        'epic_exposition': 'Epic Systems provides a wide range of software applications for healthcare organizations. Clinical documentation, scheduling, patient registration, and professional/hospital billing are just a few areas that Epic specializes in.',
        'employment': 'Employment',
        'language_select': 'Language Select',
        'eng': 'English',
        'jpn': 'Japanese',
    },
    'jpn': {
        'contact_info':'連絡',
        'russ_full' : 'ラセル=ジオンソン',
        'education' : '教育',
        'programming' : 'プログラミング',
        'javascript': 'ジャヴァスクリプト',
        'java': 'ジャバ',
        'cplus' : 'シープラスプラス',
        'grand_valley': 'グランドバレー州立大学',
        'web': 'ウェブ',
        'database': 'データベース',
        'languages': '言語',
        'language': '言語',
        'language_select': '言語を選択',
        'industry_knowledge': '業界の知識',
        'employment': '職歴'
    },
}

function getI18N(lang) {
    return $.extend({},i18n['eng'],i18n[lang]); //default english
}

function getStr(lang,key) {
    var result = i18n[lang][key] || i18n['eng'][key];
    //console.log(result);
    return  result //default to english
}
