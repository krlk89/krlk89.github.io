import { mapStyles } from "./modules/mapStyles.js";
import { places } from "./modules/places.js";

const progressBar = document.querySelector("progress");
const startBtn = document.querySelector("button");
const target = document.querySelector("#target");
const paragraph = document.querySelector("#result");
let totalScore = document.querySelector("#score");
let markers = [];
const history = [];
const latitudeLongitude = new google.maps.LatLng(58.5889, 25.4787); // Paenasti (geographical center of Estonia)
const options = {
    zoom: 7,
    center: latitudeLongitude,
    styles: mapStyles,
    disableDefaultUI: true,
    draggableCursor: "crosshair"
};
const map = new google.maps.Map(document.getElementById('map-canvas'), options);
let currentLevel = 1;
let questionCountOnCurrentLevel = 0;


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function degToRad(deg) {
    return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    // https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula/27943#27943
    const R = 6371; // Radius of the earth in km
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km

    return d;
}

function mapInteraction(event, listener, timerId, selectedPlace) {
    //console.log(selectedPlace);
    const targetIcon = "https://maps.google.com/mapfiles/kml/paddle/grn-circle.png";
    const distance = parseInt(getDistanceFromLatLonInKm(selectedPlace.lat, selectedPlace.lng, event.latLng.lat(), event.latLng.lng()))
    let score = parseInt(progressBar.value / 10 * (100 - distance));
    if (score < 0) {
        score = 0;
    }
    const previousScore = +totalScore.textContent;
    totalScore.textContent = previousScore + score;

    clearInterval(timerId);

    if (progressBar.value > 0) {
        paragraph.textContent = `${distance} km / ${score}`;
    }

    const marker = new google.maps.Marker({
        position: event.latLng,
        map: map
    });
    const targetLatlng = new google.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
    const target = new google.maps.Marker({
        position: targetLatlng,
        map: map,
        icon: targetIcon
    });

    const infoWindow = new google.maps.InfoWindow({
        content: selectedPlace.description
    });

    target.addListener('click', () => {
        infoWindow.open(map, target);
    });

    markers.push(marker);
    markers.push(target);
    markers.forEach(marker => {
        marker.setMap(map);
    });

    google.maps.event.removeListener(listener);

    progressBar.value = 100;
    const newTimerId = setInterval(() => {
        progressBar.value -= 1.2;
        if (progressBar.value === 0) {
            clearInterval(newTimerId);
            startGame();
        }
    }, 60);
}

function startGame() {
    if (currentLevel === 6) {
        target.textContent = "Mäng läbi!";
        return;
    }
    progressBar.value = 100;
    paragraph.textContent = "";

    markers.forEach(marker => {
        marker.setMap(null)
    });
    markers = [];

    const places_ = places[currentLevel];
    const index = getRandomInt(places_.length);
    const selectedPlace = places_[index];
    if (!selectedPlace) {
        target.textContent = "Mäng läbi!";
        return;
    }
    history.push(selectedPlace);
    places_.splice(index, 1);
    questionCountOnCurrentLevel++;
    if (questionCountOnCurrentLevel === 2) {
        currentLevel++;
        questionCountOnCurrentLevel = 0;
    }

    target.textContent = selectedPlace.name;

    startBtn.disabled = true;

    const timerId = setInterval(() => {
        progressBar.value -= 0.6;
        if (progressBar.value === 0) {
            clearInterval(timerId);
            paragraph.textContent = "Fail";
        }
    }, 60);

    const eventListener = map.addListener("click", event => {
        mapInteraction(event, eventListener, timerId, selectedPlace);
    });
}

// event handling
startBtn.addEventListener("click", startGame);

