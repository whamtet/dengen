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

const render = cafe => {
    const {
        businessHours,
        path,
        name,
        description
    } = cafe;
    console.log(cafe);

    const dengenHref = 'https://dengen-cafe.com/cafes/' + path;

    return (`
            <div>
                <a href="${dengenHref}" target="_blank">${name || description}</a>
            </div>
            `);
};

const loading = document.getElementById('loading');
const load = () => loading.style.display = '';
const loadDone = () => loading.style.display = 'none';

async function updateResults(e) {
    load();
    const {lat, lng} = map.getCenter();
    (await query(lat, lng)).forEach(cafe => {
        const {latitude, longitude} = cafe;
        // add
        L.marker([latitude, longitude]).addTo(map).bindPopup(render(cafe)).on('click', () => console.log(cafe));
    });
    loadDone();
}
map.on('moveend', updateResults);
