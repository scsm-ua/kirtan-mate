type TCategory = {
    name: string; // Category name.
    items: TCategoryItem[];
};


type TCategoryItem = {
    aliasName: string; // The First line.
    embeds: string[];
    fileName: string; // id + '.html'
    id: string;
    name: string;
    page: string;
    title: string; // Same as name
};


type TSongJSONVerse = {
    number: string;
    text: string[];
    translation: string[];
};


type TSongJSON = {
    author?: string;
    title?: string;
    verses: TSongJSONVerse[];
};


type TSongBookInfo = {
    i18n: Array<Record<string, string>>;
    path: string;
    slug: string;
    subtitle: string;
    title: string;
};


type TSongBookAsOption = {
    href: string;
    i18n: Array<Record<string, string>>;
    isSelected: boolean;
    slug: string;
    title: string;
};
