type TCategory = {
    name: string; // Category name.
    items: {
        aliasName: string; // The First line.
        fileName: string;
        name: string;
    }
};


type TCategoryItem = {
    aliasName: string; // The First line.
    fileName: string;
    name: string;
};


type TIndexItem = [
    string, // Index letter А--я
    TCategoryItem[]
];


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
