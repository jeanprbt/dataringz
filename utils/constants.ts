type IntroLocation = {
    center: [number, number],
    zoom: number,
    pitch: number,
    bearing: number,
    name: string
}
const olympia: IntroLocation = {
    center: [21.62536, 37.64471],
    zoom: 7,
    bearing: 340,
    pitch: 50,
    name: "Olympia"
}
const marseille: IntroLocation = {
    center: [5.36455, 43.29527],
    zoom: 7,
    bearing: 340,
    pitch: 50,
    name: "Marseille"
}
const bastia: IntroLocation = {
    center: [9.450881, 42.697285],
    zoom: 7,
    bearing: 320,
    pitch: 30,
    name: "Bastia"
}
const perpignan: IntroLocation = {
    center: [2.90064, 42.68751],
    zoom: 7,
    bearing: 340,
    pitch: 50,
    name: "Perpignan"
}
const guiana: IntroLocation = {
    center: [-52.326000, 4.937200],
    zoom: 5,
    bearing: 320,
    pitch: 30,
    name: "French Guiana"
}
const caledonia: IntroLocation = {
    center: [166.457993, -22.275801],
    zoom: 5,
    bearing: 340,
    pitch: 30,
    name: "New Caledonia"
}
const reunion: IntroLocation = {
    center: [55.448101, -20.878901],
    zoom: 5,
    bearing: 340,
    pitch: 30,
    name: "La Réunion"
}
const polynesia: IntroLocation = {
    center: [-149.569595, -17.535000],
    zoom: 5,
    bearing: 340,
    pitch: 30,
    name: "French Polynesia"
}
const guadeloupe: IntroLocation = {
    center: [-61.580002, 16.270000],
    zoom: 5,
    bearing: 340,
    pitch: 30,
    name: "Guadeloupe"
}
const martinique: IntroLocation = {
    center: [-61.083302, 14.600000],
    zoom: 5,
    bearing: 340,
    pitch: 30,
    name: "Martinique"
}
const nice: IntroLocation = {
    center: [7.26189, 43.71021],
    zoom: 7,
    bearing: 340,
    pitch: 50,
    name: "Nice"
}
const paris: IntroLocation = {
    center: [2.294694, 48.858093],
    zoom: 15.5,
    bearing: 0,
    pitch: 55,
    name: "Paris"
}
const start: IntroLocation = {
    center: [5, 43],
    zoom: 2,
    pitch: 0,
    bearing: 440,
    name: ""
}
const path = {
    zoom: 7,
    bearing: 340,
    pitch: 50,
}

const availableImages = [
    'aquatics-centre',
    'bercy-arena',
    'bordeaux-stadium',
    'champ-de-mars-arena',
    'chateau-de-versailles',
    'chateauroux-shooting-centre',
    'eiffel-tower-stadium',
    'elancourt-hill',
    'geoffroy-guichard-stadium',
    'grand-palais',
    'hotel-de-ville',
    'invalides',
    'la-beaujoire-stadium',
    'la-concorde',
    'le-bourget-climbing-venue',
    'le-golf-national',
    'lyon-stadium',
    'marseille-marina',
    'marseille-stadium',
    'nice-stadium',
    'north-paris-arena',
    'parc-des-princes',
    'paris-la-defense-arena',
    'pierre-mauroy-stadium',
    'pont-alexandre-iii',
    'porte-de-la-chapelle-arena',
    'roland-garros-stadium',
    'saint-quentin-en-yvelines-bmx-stadium',
    'saint-quentin-en-yvelines-velodrome',
    'south-paris-arena',
    'stade-de-france',
    'trocadero',
    'vaires-sur-marne-nautical-stadium',
    'teahupo-o-tahiti',
    'yves-du-manoir-stadium',
];

export { olympia, marseille, bastia, perpignan, guiana, caledonia, reunion, polynesia, guadeloupe, martinique, nice, paris, start, path, availableImages };