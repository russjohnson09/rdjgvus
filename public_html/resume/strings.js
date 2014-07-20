//localization strings

            
var i18n = {
    'eng': {
        'contact_info': 'Contact Info',
        'russ_full' : 'Russell Johnson',
        'education' : 'Education',
        'programming' : 'Programming',
        'web' : 'Web',
        'javascript': 'Javascript',
        'cplus': 'C++',
        'grand_valley': 'Grand Valley State University'
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
    console.log(lang);
    return i18n[lang][key] || i18n['eng'][key]; //default to english
}
