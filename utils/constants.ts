type IntroLocation = {
    center: [number, number],
    zoom: number,
    pitch: number,
    bearing: number,
}
const olympia: IntroLocation = {
    center: [21.62536, 37.64471],
    zoom: 7,
    bearing: 340,
    pitch: 50
}
const marseille: IntroLocation = {
    center: [5.36455, 43.29527],
    zoom: 7,
    bearing: 340,
    pitch: 50
}
const bastia: IntroLocation = {
    center: [9.450881, 42.697285],
    zoom: 7,
    bearing: 320,
    pitch: 30
}
const perpignan: IntroLocation = {
    center: [2.90064, 42.68751],
    zoom: 7,
    bearing: 340,
    pitch: 50,
}
const guiana: IntroLocation = {
    center: [-52.326000, 4.937200],
    zoom: 5,
    bearing: 320,
    pitch: 30
}
const caledonia: IntroLocation = {
    center: [166.457993, -22.275801],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const reunion: IntroLocation = {
    center: [55.448101, -20.878901],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const polynesia: IntroLocation = {
    center: [-149.569595, -17.535000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const guadeloupe: IntroLocation = {
    center: [-61.580002, 16.270000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const martinique: IntroLocation = {
    center: [-61.083302, 14.600000],
    zoom: 5,
    bearing: 340,
    pitch: 30
}
const nice: IntroLocation = {
    center: [7.26189, 43.71021],
    zoom: 7,
    bearing: 340,
    pitch: 50
}
const paris: IntroLocation = {
    center: [2.294694, 48.858093],
    zoom: 15.5,
    bearing: 0,
    pitch: 55,
}
const start: IntroLocation = {
    center: [5, 43],
    zoom: 2,
    pitch: 0,
    bearing: 400
}
const path = {
    zoom: 7,
    bearing: 340,
    pitch: 50,
}

export { olympia, marseille, bastia, perpignan, guiana, caledonia, reunion, polynesia, guadeloupe, martinique, nice, paris, start, path };