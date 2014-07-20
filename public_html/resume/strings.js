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
        'meteor': 'Meteor'
    },
    'jpn': {
        'contact_info':'連絡',
        'russ_full' : 'ラセル=ジオンソン',
        'education' : '教育',
        'programming' : 'プログラミング',
        'javascript': 'ジャヴァスクリプト',
        'java': 'ジャバ',
        'cplus' : 'シープラスプラス',
        'grand_valley': 'グランドバレー州立大学'
    },
}

function getI18N(lang) {
    return i18n[lang];
}

function getStr(lang,key) {
    var result = i18n[lang][key] || i18n['eng'][key];
    console.log(result);
    return  result //default to english
}
