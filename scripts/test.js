const deburr = require('lodash.deburr');

const categories = [
    {
        "name": "Вступ",
        "icon": "",
        "items": [
            {
                "name": "Пан̃ча-таттва мантра",
                "aliasName": "ш́рі-кр̣ш̣н̣а-чаітанйа прабгу нітйа̄нанда",
                "fileName": "pancha-tattva.html"
            },
            {
                "name": "Харе Кришна маха̄-мантра",
                "aliasName": "харе кр̣ш̣н̣а харе кр̣ш̣н̣а, кр̣ш̣н̣а кр̣ш̣н̣а харе харе",
                "fileName": "hare-krishna.html"
            }
        ]
    },
    {
        "name": "Ранкове Араті і програма",
        "icon": "brightness",
        "items": [
            {
                "name": "Прабга̄ті Ґīті",
                "aliasName": "калі-куккура-кадана джаді ча̄о хе",
                "fileName": "kali-kukkura-kadana-jadi-chhao-he-kaliyuga-pavana-kali-bhaya-nashiana.html"
            },
            {
                "name": "Шрī Шячīнандана-вандана̄",
                "aliasName": "джая шячīнандана сура-муні-вандана,",
                "fileName": "jaya-shiachinandana-sura-muni-vandana-bhava-bhaya-khandana-jayo-he.html"
            },
            {
                "name": "Ґурудева",
                "aliasName": "ґурудева!",
                "fileName": "gurudeva.html"
            },
            {
                "name": "Шаранагаті. Благодатне звернення",
                "aliasName": "шрī-кришна-чайтанья прабгу джīве дая корі’",
                "fileName": "shri-kryshna-chhaitanya-prabhu-jive-daya-kori.html"
            },
            {
                "name": "Нама-Санкірттан",
                "aliasName": "харі харає намах кришна ядава̄я намах",
                "fileName": "hari-haraye-namah-kryshna-yadavaya-namah.html"
            },
            {
                "name": "Арунодоя-кīртан",
                "aliasName": "джīв джа̄ґо, джīв джа̄ґо, ґаура̄ча̄нда боле",
                "fileName": "jiv-jago-jiv-jago-gaurachanda-bole.html"
            }
        ]
    },
    {
        "name": "Вечірнє Араті",
        "icon": "nightlight",
        "items": [
            {
                "name": "Шрī Ґовінда Кунда Ґупта-Ґовардган А̄раті",
                "aliasName": "джая джая ґіріра̄джер а̄раті вішяла",
                "fileName": "jaya-jaya-girirajer-arati-vishiala.html"
            },
            {
                "name": "Ш́рі Ґаура-а̄раті",
                "aliasName": "(кіба)  джая джая ґаура̄ча̄ндер а̄ротіко шобга̄",
                "fileName": "jaya-jaya-gaurachhander-arotiko-shobha.html"
            },
            {
                "name": "Шрī Ґуру-вайшнава Ма̄ха̄тмʼя-ґīті",
                "aliasName": "шрī ґуру чарана-падма, кевала-бгакаті-садма,",
                "fileName": "shri-guru-chharana-padma.html"
            }
        ]
    },
    {
        "name": "Вчителям",
        "icon": "",
        "items": [
            {
                "name": "Шрī Ґуру Āраті",
                "aliasName": "джая джая ґурудевер а̄раті уджджвала",
                "fileName": "jaya-jaya-gurudever-arati-ujjvala.html"
            },
            {
                "name": "Шрī Шрī Ґурва̄штака",
                "aliasName": "самса̄ра-да̄ва̄нала-лīдга-лока-",
                "fileName": "samsara-davanala-lidha-loka.html"
            }
        ]
    },
    {
        "name": "Нітьянанді",
        "icon": "diamond",
        "items": [
            {
                "name": "Акрохдха Парамананада",
                "aliasName": "акродга парама̄нанда нітьянанда ра̄й",
                "fileName": "akrodha-paramananda.html"
            },
            {
                "name": "А̄ґʼя-Тахал",
                "aliasName": "надīя-ґодруме нітьянанда маха̄джана",
                "fileName": "nadiya-godrume-nityananda-mahajana.html"
            }
        ]
    },
    {
        "name": "Шрі Чайтаньї Махапрабгу",
        "icon": "",
        "items": [
            {
                "name": "Авата̄ра Са̄ра",
                "aliasName": "авата̄ра са̄ра ґора̄ авата̄ра",
                "fileName": "avatara-sara-gora-avatara.html"
            },
            {
                "name": "Шрī На̄ма",
                "aliasName": "ґа̄й ґора̄ мадгур сваре",
                "fileName": "gay-gora-madhur-svare.html"
            }
        ]
    },
    {
        "name": "Інші бгаджани",
        "icon": "",
        "items": [
            {
                "name": "Бгаджаху Ре Мана",
                "aliasName": "бгаджаху ре мана шрī-нанда-нандана",
                "fileName": "bhajahu-re-mana-shri-nanda-nandana.html"
            },
            {
                "name": "Ама̄ра джīвана",
                "aliasName": "а̄ма̄ра джīвана, сада̄ па̄пе рата,",
                "fileName": "amara-jivana-sada-pape-rata.html"
            }
        ]
    }
];

/**
 * Converts the list of categories into the index list. The primary letters
 * and the alias names are sorted alphabetically.
 * @param categories: TCategory[]
 * @returns {TIndexItem[]}
 */
function makeIndexList(categories) {
    const list = new Map();

    makeLineVersions(
        categories.flatMap((cat) => cat.items)
    ).sort((a, b) =>
        getAliasCleaned(a).localeCompare(getAliasCleaned(b))
    )
    .forEach((item) => {
        const firstLetter = getFirstLetter(item);

        if (!list.has(firstLetter)) {
            return list.set(firstLetter, [item]);
        }

        const arr = list.get(firstLetter);
        list.set(firstLetter, [...arr, item]);
    });

    return Array.from(list.entries())
        .map(([letter, items]) => ([letter.toUpperCase(), items]))
        .sort(((a, b) => a[0].localeCompare(b[0])));
}

/**
 * Checking for the aliasNames that are prefixed with words
 * in brackets, such as `(кіба) джая...`. Making duplicates for them.
 * @param items: TCategoryItem[]
 * @returns {TCategoryItem[]}
 */
function makeLineVersions(items) {
    const arr = [];

    items.forEach((cat) => {
        const alias = processLineEnding(cat.aliasName);
        const idx = alias.indexOf(')');

        arr.push({
            ...cat,
            aliasName: alias
        })

        if (~idx) {
            arr.push({
                ...cat,
                aliasName: alias.slice(idx + 1).trim()
            })
        }
    });

    return arr;
}

/**
 * Some lines (alisNames) may end with a comma or hyphen which need to be removed.
 * @param line: string
 * @returns {string}
 */
function processLineEnding(line) {
    const len = line.length - 1;
    let idx = line.lastIndexOf('-');
    if (idx === len) return line.slice(0, idx);

    idx = line.lastIndexOf(',');
    if (idx === len) return line.slice(0, idx);

    return line;
}

/**
 * Some lines may start with a bracket, e.g. `(кіба) джая...`.
 * @param item: TCategoryItem
 * @returns {string}
 */
function getFirstLetter(item) {
    return item.aliasName.startsWith('(')
        ? item.aliasName[1]
        : item.aliasName[0];
}

/**
 * For the sake of correct comparison some symbols should be omitted.
 * @param item: TCategoryItem
 * @returns {string}
 */
function getAliasCleaned(item) {
    const x = deburr(item.aliasName)
        .replace(/[,\-'()\s]/g, '');

    console.log(x);
    return x;
}

/**/
console.log(JSON.stringify(makeIndexList(categories), null, 2));
