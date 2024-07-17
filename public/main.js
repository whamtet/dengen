const map = L.map('map');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

navigator.geolocation.getCurrentPosition((position) => {
    const {latitude, longitude} = position.coords;
    map.setView([latitude, longitude], 14);
}, (failure) => {
    map.setView([35.7645267, 139.8322096], 14); // no yakuza
});

const render = cafe => cafe[3];

async function updateResults(e) {
    const bounds = map.getBounds();
    const boundsVector = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()];

    garbageCollect(boundsVector);

    (await getCafes(boundsVector)).forEach(cafe => {
        const [latitude, longitude, path] = cafe;
        const dengenHref = 'https://dengen-cafe.com/cafes/' + path;
        const open = () => window.open(dengenHref);
        // add
        const marker = L.marker([latitude, longitude]).addTo(map);
        const tooltip = L.tooltip({permanent: true, content: render(cafe)});
        marker.bindTooltip(tooltip);
        marker.on('click', open);
        addMarker(cafe, marker);
    });
}
map.on('moveend', updateResults);
