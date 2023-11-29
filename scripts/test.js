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
                "aliasName": "    калі-куккура-кадана джаді ча̄о хе",
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
 * type TCategoryItem = {
 *     aliasName: sting; // The First line.
 *     fileName: string;
 *     name: string;
 * };
 */

/**
 * type TCategory = {
 *     icon: string; // !!! Obsolete.
 *     name: string; // Category name.
 *     items: TCategoryItem[];
 * };
 */

/**
 * type TIndexItem = [
 *     string; // Index letter А--я
 *     TCategoryItem[];
 * ];
 */

/**
 *
 * @param categories: TCategory[]
 * @returns {TIndexItem[]}
 */
function makeIndexList(categories) {
    const list = new Map();

    categories
        .flatMap((cat) => cat.items)
        .map((item) => ({
            ...item,
            aliasName: trimAliasName(item.aliasName)
        }))
        .sort((a, b) =>
            a.aliasName.localeCompare(b.aliasName)
        )
        .forEach((item) => {
            const firstLetter = item.name[0];

            if (!list.has(firstLetter)) {
                return list.set(firstLetter, [item]);
            }

            const arr = list.get(firstLetter);
            list.set(firstLetter, [...arr, item]);
        });

    return Array.from(list.entries())
        .sort(((a, b) => a[0].localeCompare(b[0])));
}

/**
 * Removes the brackets if any, trims. `(кіба)  джая джая ґаура̄ча̄ндер а̄ротіко шобга`
 * @param name - song 1st line.
 * @returns {string}
 */
function trimAliasName(name) {
    const n = name.trim();
    const idx = n.indexOf(')');

    return ~idx
        ? name.slice(idx + 1).trim()
        : n;
}

console.log(JSON.stringify(makeIndexList(categories), null, 2));
