let locations;
async function getLocations_() {
    const response = await fetch('locations.json');
    const loc = await response.json();
    locations = loc;
    return loc;
}
const getLocations = () => locations || getLocations_();

const currentMarkers = {};
const LIMIT = 30;

async function getCafes([lat1, long1, lat2, long2]) {
    const out = [];
    let c = Object.keys(currentMarkers).length;
    const cafes = await getLocations();
    for (let i = 0; i < cafes.length && c < LIMIT; i++) {
        const cafe = cafes[i];
        const [lat, long, path] = cafe;
        if (!(path in currentMarkers) && lat1 <= lat && lat < lat2 && long1 <= long && long < long2) {
            out.push(cafe);
            c++;
        }
    }

    return out;
}

function addMarker(cafe, marker) {
    cafe.push(marker);
    currentMarkers[cafe[2]] = cafe;
}

function garbageCollect([lat1, long1, lat2, long2]) {
    for (const path in currentMarkers) {
        const [lat, long, _, _2, marker] = currentMarkers[path];
        if (lat < lat1 || lat2 <= lat || long < long1 || long2 <= long) {
            marker.remove();
            delete currentMarkers[path];
        }
    }
}
