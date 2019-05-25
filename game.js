const progressBar = document.querySelector("progress");
const startBtn = document.querySelector("button");
const target = document.querySelector("#target");
const paragraph = document.querySelector("#result");
let totalScore = document.querySelector("#score");
let markers = [];
const history = [];
const mapStyles = [{
        "elementType": "labels",
        "stylers": [{
            "visibility": "off"
        }]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [{
            "visibility": "off"
        }]
    },
    {
        "featureType": "administrative.neighborhood",
        "stylers": [{
            "visibility": "off"
        }]
    }
]
const places = {
    "1": [
        {
            "name": "Tallinn",
            "lat": 59.4372,
            "lng": 24.745,
            "description": "Tallinn on Eesti pealinn."
        },
        {
            "name": "Tartu",
            "lat": 58.38,
            "lng": 26.7225,
            "description": "Tartu on 'Heade mõtete linn'."
        },
        {
            "name": "Narva",
            "lat": 59.3792,
            "lng": 28.2006,
            "description": "Narva on suuruselt Eesti kolmas linn."
        },
        {
            "name": "Pärnu",
            "lat": 58.3844,
            "lng": 24.4989,
            "description": "Pärnu on Eesti suvepealinn."
        }
    ],
    "2": [
        {
            "name": "Kohtla-Järve",
            "lat": 59.4,
            "lng": 27.2833,
            "description": "Kohtla-Järve elanikkond on valdavalt venekeelne."
        },
        {
            "name": "Viljandi",
            "lat": 58.3633,
            "lng": 25.5956,
            "description": "Viljandi asub Sakala kõrgustikul, Viljandi järve kaldal."
        },
        {
            "name": "Maardu",
            "lat": 59.4781,
            "lng": 25.0161,
            "description": "Maardu asub Muuga lahe kaldal."
        },
        {
            "name": "Rakvere",
            "lat": 59.3506,
            "lng": 26.3611,
            "description": "Rakvere on linn alates 12. juunist 1302."
        },
        {
            "name": "Sillamäe",
            "lat": 59.3931,
            "lng": 27.7742,
            "description": "Sillamäe asub Narva lahe kaldal Sõtke jõe suudmes."
        },
        {
            "name": "Võru",
            "lat": 57.8486,
            "lng": 26.9928,
            "description": "Võru tunnuslause on 'Üts ummamuudu liin'."
        }
    ],
    "3": [
        {
            "name": "Kuressaare",
            "lat": 58.2533,
            "lng": 22.4861,
            "description": "Kuressaare on Saaremaa valla keskus."
        },
        {
            "name": "Valga",
            "lat": 57.7769,
            "lng": 26.0311,
            "description": "Valga on eesti kõige lõunapoolsem linn."
        },
        {
            "name": "Jõhvi",
            "lat": 59.3575,
            "lng": 27.4122,
            "description": "Jõhvi."
        },
        {
            "name": "Haapsalu",
            "lat": 58.9470,
            "lng": 23.5370,
            "description": "Haapsalu."
        }
    ],
    "4": [
        {
            "name": "Keila",
            "lat": 59.3081,
            "lng": 24.4263,
            "description": "Keila."
        },
        {
            "name": "Paide",
            "lat": 58.8833,
            "lng": 25.5667,
            "description": "Paide."
        }
    ],
    "5": [
        {
            "name": "Võiste",
            "lat": 58.2039,
            "lng": 24.4771,
            "description": ":)"
        },
        {
            "name": "Varstu",
            "lat": 57.6430,
            "lng": 26.66,
            "description": ";)"
        }
    ]
};
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

