// Menu slide in / Slide Out
var menu = document.querySelector('.MenuButton');
var mapContainer = document.getElementById('MapContainer');
var drawer = document.querySelector('nav');
var menuIcon = document.getElementById('MenuIcon');

menu.addEventListener('click', function(e) {
	drawer.classList.toggle('open');
	if($('#Nav').hasClass('open')){
		menuIcon.innerHTML = 'clear';
	} else {
		menuIcon.innerHTML = 'menu';
	}
	e.stopPropagation();
});

mapContainer.addEventListener('click', function() {
    hideNavMenu();
});

var hideNavMenu = function(){
	drawer.classList.remove('open');
	menuIcon.innerHTML = 'menu';
};

// Data Model / Source
var restaurantLocations = [
	{
		name: 'Pho Super Bowl',
		note: 'The soup will make you feel super.',
		phone: "1-317-399-7858",
		url: "http://www.superbowlphowestfield.com/",
		address: {
			street: "112 E Main St",
			city: "Westfield",
			state: "IN",
			zip: 46074
		},
		location: {lat: 40.043006, lng: -86.12732},
		yelpBizId: 'super-bowl-pho-westfield',
		yelpAPIData: {}
	},
	{
		name: "Big Hoffa's Smokehouse Bar-B-Que",
		note: 'Amazing sandwiches and BBQ, matey!',
		phone: "1-317-867-0077",
		url: "http://bbqindianapolis.com/",
		address: {
			street: "800 E Main St",
			city: "Westfield",
			state: "IN",
			zip: 46074
		},
		location: {lat: 40.04333800000001, lng: -86.117615},
		yelpBizId: 'big-hoffas-smokehouse-bar-b-que-westfield',
		yelpAPIData: {}
	},
	{
		name: "Jan's Village Pizza",
		note: 'A nice pizza pie!',
		phone: "1-317-896-5050",
		url: "http://www.jansvillagepizzas.com/",
		address: {
			street: "108 S Union St",
			city: "Westfield",
			state: "IN",
			zip: 46074
		},
		location: {lat: 40.042494, lng: -86.127522},
		yelpBizId: 'jans-village-pizza-westfield',
		yelpAPIData: {}
	},
	{
		name: "Wolfies Grill",
		note: 'Yay for Steak!',
		phone: "1-317-399-7826",
		url: "http://www.wolfiesgrill.com/",
		address: {
			street: "137 W Main St",
			city: "Westfield",
			state: "IN",
			zip: 46074
		},
		location: {lat: 40.042439, lng: -86.129261},
		yelpBizId: 'wolfies-grill-westfield',
		yelpAPIData: {}
	},
	{
		name: 'Maneki Neko',
		note: 'Sushi makes you feel lucky.',
		phone: "1-317-867-4810",
		url: "https://locu.com/places/maneki-neko-westfield-us/#menu",
		address: {
			street: "214 E Main St",
			city: "Westfield",
			state: "IN",
			zip: 46074
		},
		location: {lat: 40.04307, lng: -86.125765},
		yelpBizId: 'maneki-neko-japanese-restaurant-and-sushi-bar-westfield',
		yelpAPIData: {}
	}
];


// KnockoutJS Code!
var markers = [];
function AppViewModel(){

	var self = this;
	self.filteredLocations = ko.observableArray();
	self.query = ko.observable();

	for (var x in restaurantLocations){
		self.filteredLocations.push(restaurantLocations[x]);
	}


	$( "#ClearFilterTextBtn" ).click(function() {
	  resetMapListDisplay();
	});

	var resetMapListDisplay = function(){
		$('#FilterText').val('');
		self.filteredLocations.removeAll();
		for (var x in restaurantLocations){
			self.filteredLocations.push(restaurantLocations[x]);
			restaurantLocations[x].marker.setVisible(true);
		}
		largeInfoWindow.close();
		largeInfoWindow.marker = null;
	};

	self.query.subscribe(function (value){

		self.filteredLocations.removeAll();

		for (var x in restaurantLocations){
			restaurantLocations[x].marker.setVisible(false);
		}

		for(var x in restaurantLocations){
			if(restaurantLocations[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0){
				largeInfoWindow.close();
				largeInfoWindow.marker = null;
				restaurantLocations[x].marker.setVisible(true);
				self.filteredLocations.push(restaurantLocations[x]);
				}
		}
	}, this);

	var largeInfoWindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < restaurantLocations.length; i++){
		var position = restaurantLocations[i].location;
		var title = restaurantLocations[i].name;
		var note = restaurantLocations[i].note;
		var phone = restaurantLocations[i].phone;
		var url = restaurantLocations[i].url;
		var address = restaurantLocations[i].address;

		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			note: note,
			phone: phone,
			url: url,
			address: address,
			id: restaurantLocations[i].name,
			yelpRating: ""
		});

		markers.push(marker);
		marker.addListener('click', function(){
			populateInfoWindow(this, largeInfoWindow);
			map.panTo(this.getPosition());
			if (this.getAnimation() !== null) {
				this.setAnimation(null);
			} else {
				this.setAnimation(google.maps.Animation.BOUNCE);
				var targetMarker = this;
				setTimeout(function(){
					targetMarker.setAnimation(null);
				}, 725);
			}

		});
		restaurantLocations[i].marker = marker;
		bounds.extend(markers[i].position);
	}

	map.fitBounds(bounds);

	function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
		if (infowindow.marker != marker) {
	  		infowindow.marker = marker;
				// If there is a Yelp Rating available, show appropriate stars.
				if(marker.yelpRating !== ""){
						infowindow.setContent(
						'<div><strong>'+ marker.id +
						'</strong></div><div><p><a  target="_blank" href="' + marker.url +'">' + marker.url+'</a><br><br>'+
						marker.address.street +'<br>' +
						marker.address.city + ', ' + marker.address.state + ' ' + marker.address.zip +
						'<br><a href="tel:'+marker.phone+'">' + marker.phone + '</a><br><br>' +
						marker.note +
						'</p><BR><div id="YelpReviewContainer"><a href="' + marker.yelpPageUrl + '" target="_blank"><img id="YelpRatingStars" src="' + marker.yelpRatingImgUrl +
						'"><span>Based Upon ' + marker.yelpReviewCount + ' Reviews</span><img id="YelpRatingLogo" src="img/yelp_review_stars/Reviews_From_Yelp.png"></a></div></div>');
				// If API call fails, just show our note.
				}else{
						infowindow.setContent('<div><strong>' + marker.id + '</strong></div><div><p><a href="'+marker.url+'">'+ marker.url +'</a><br>'+ marker.note +'</p><br><p style="font-style: italic">Restaurant reviews currently unavailable...</p></div>');
				}
	  		infowindow.open(map, marker);
		  	// Make sure the marker property is cleared if the infowindow is closed.
	  		infowindow.addListener('closeclick',function(){
	    		infowindow.marker = null;
	  		});
		}
	}

  self.setSelectedPlace = function(data){
		populateInfoWindow(data.marker, largeInfoWindow);
		map.panTo(data.marker.getPosition());
		if (data.marker.getAnimation() !== null) {
			data.marker.setAnimation(null);
		} else {
			data.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function(){
				data.marker.setAnimation(null);
			}, 725);
			hideNavMenu();
		}
	};

	// Begin code for Yelp API Call
	function nonce_generate() {
	 return (Math.floor(Math.random() * 1e12).toString());
	}

	var YELP_BASE_URL = 'https://api.yelp.com/v2/';
	var YELP_KEY = 'MkWESitTrNdz2LBPjwjQ7w';
	var YELP_TOKEN = 'ZBzwfX0onQooHSG-3Tytj33IKBDztUjK';
	var YELP_KEY_SECRET = 'CKz4L9RKmnvMjl6YJfQMtPKvT1o';
	var YELP_TOKEN_SECRET = 'mKSvHXhDiiR-ZTK-UoJ84GqQC5M';

	for (var x = 0; x < restaurantLocations.length; x++)
	{

		(function(x){
			var yelp_url = YELP_BASE_URL + 'business/' + restaurantLocations[x].yelpBizId;
				 var parameters = {
					 oauth_consumer_key: YELP_KEY,
					 oauth_token: YELP_TOKEN,
					 oauth_nonce: nonce_generate(),
					 oauth_timestamp: Math.floor(Date.now()/1000),
					 oauth_signature_method: 'HMAC-SHA1',
					 oauth_version : '1.0',
					 callback: 'cb'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
				 };

				 var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
				 parameters.oauth_signature = encodedSignature;

				 var settings = {
					 url: yelp_url,
					 data: parameters,
					 cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
					 dataType: 'jsonp',
					 success: function(results) {
						 restaurantLocations[x].yelpAPIData = results;
						 markers[x].yelpRating = results.rating;
						 markers[x].yelpReviewCount = results.review_count;
						 markers[x].yelpRatingImgUrl = results.rating_img_url_large;
						 markers[x].yelpPageUrl = results.mobile_url;
					},
					 fail: function() {
						 console.log("Error getting Yelp API Data!");
					 }
				 };
				 // Send AJAX query via jQuery library.
				 $.ajax(settings);
		})(x);
	}
}

// Map Initialization
var map;
function initMap(){
	map = new google.maps.Map(document.getElementById('MapContainer'), {
		center: {lat: 40.04307, lng: -86.125765},
		zoom:11,
		disableDefaultUI: true,
		styles:[
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ebe3cd"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#523735"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f1e6"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#c9b2a6"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#dcd2be"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#ae9e90"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#93817c"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#a5b076"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#447530"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f1e6"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fdfcf8"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f8c967"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#e9bc62"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e98d58"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#db8555"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#806b63"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8f7d77"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ebe3cd"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#b9d3c2"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#92998d"
      }
    ]
  }
	]});
	ko.applyBindings(new AppViewModel());
}
