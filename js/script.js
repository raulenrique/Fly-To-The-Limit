

/*********************
Brett's Form Validation
**********************/

function addFormValidation(formElement) {

	if (formElement === null || formElement.tagName.toUpperCase() !== 'FORM') {
		throw new Error("first parameter to addFormValidation must be a FORM, but got " + formElement.tagName);
	}

	formElement.noValidate = true;

	formElement.addEventListener("submit", function (evt) {
		if (!validateForm(formElement)) {
			evt.preventDefault();
		}
	});

	for (var i = 0; i < formElement.elements.length; i += 1) {
		var field = formElement.elements[i];
		field.addEventListener('blur', blurEvent);
	}

	/* FUNCTIONS */

	function blurEvent(evt) {
		validateField(evt.target);
	}

	function validateForm(formElement) {
		var error = false;

		for (var i = 0; i < formElement.elements.length; i += 1) {
			var isValid = validateField(formElement.elements[i]);
			if ( ! isValid) { 
				error = true;
			}
		}

		return !error;
	}


	function validateField(el) {
		var error = "";

		if (['submit', 'reset', 'button', 'hidden', 'fieldset'].indexOf(el.type) > -1) {
			return true; // buttons and fieldsets are automatically valid.
		}

		if (el.id.length === 0 || el.name.length === 0) {
			console.error("error: ", el);
			throw new Error("found a form element that is missing an id and/or name attribute. name should be there. id is required for determining the field's error message element.");
		}

		// find this element's match error div.
		var errorDiv = document.querySelector("#" + el.id + "-error");
		if (errorDiv === null) {
			console.error("error: ", el);
			throw new Error("could not find the '#" + el.id + "-error' element. It's needed for error messages if #" + el.id + " is ever invalid.");
		}

		errorDiv.innerHTML = "";

		el.classList.remove('invalid');
		errorDiv.classList.remove('danger');

		if (el.type === "email" && el.value.length >= 1 && !isEmail(el.value)) {
			error = "please provide a valid email address.";
		}

		if (hasMinLength(el) && el.value.length < el.minLength) {
			error = "must be " + el.minLength + " or more characters long.";
		}

		if (hasMaxLength(el) && el.value.length > el.maxLength) {
			error = "must be " + el.maxLength + " or less characters long.";
		}

		if (hasMin(el) && parseInt(el.value, 10) < parseInt(el.min, 10)) {
			error = "must be " + el.min + " or greater.";
		}

		if (hasMax(el) && parseInt(el.value, 10) > parseInt(el.max, 10)) {
			error = "must be " + el.max + " or less.";
		}

		if (el.dataset.fvMatch) { // data-fv-match="..."
			var matchingEl = document.querySelector('#' + el.dataset.fvMatch);
			if (matchingEl === null) {
				console.error("error: ", el);
				throw new Error("Couldn't find the field '#" + el.dataset.fvMatch + "' to check #" + el.id + " against.");
			}
			if (el.value !== matchingEl.value) {
				error = "The two fields must match.";
			}
		}

		// is this field required?
		if (el.type === "checkbox" && el.required && !el.checked) { 
			error = "this must be checked.";
		} else if (isRequired(el) && el.value.trim().length === 0) {
			error = "this field is required.";
		}

		if (error !== "") {
			errorDiv.innerHTML = error;
			
			el.classList.add('invalid');
			errorDiv.classList.add('danger');

			return false; // it's invalid
		}

		return true;
	}

	function isEmail(input) {
		return input.match(/^([a-z0-9_.\-+]+)@([\da-z.\-]+)\.([a-z\.]{2,})$/);
	}

	function hasMinLength(el) {
		return (minMaxLengthApplies(el) && el.minLength > 0);
	}

	function hasMaxLength(el) {
		return (minMaxLengthApplies(el) && el.maxLength > -1);
	}

	function hasMin(el) {
		return (numericMinMaxApplies(el) && el.min > 0);
	}

	function hasMax(el) {
		return (numericMinMaxApplies(el) && el.max > -1);
	}

	function isRequired(el) {
		return (requiredApplies(el) && el.required);
	}

	function minMaxLengthApplies(el) {
		return ['text', 'search', 'url', 'tel', 'email', 'password', 'textarea'].indexOf(el.type) > -1;
	}

	function numericMinMaxApplies(el) {
		return ['number', 'range'].indexOf(el.type) > -1;
	}

	function requiredApplies(el) {
		return ['text', 'search', 'url', 'tel', 'email', 'password', 'datetime', 'date', 'month', 'week', 'time', 'number', 'file', 'textarea', 'select-one'].indexOf(el.type) > -1;
	}

}




/**********************************

SMOOTH SCROLLING

**********************************/

/*
 * - autoSmoothScroll -
 * Licence MIT
 * Written by Gabriel Delépine
 *http://stackoverflow.com/questions/10063380/javascript-smooth-scroll-without-the-use-of-jquery/19808153#19808153
 */

(function(window, undefined) // Code in a function to create an isolate scope
{
    'use strict';
    var height_fixed_header = 0, // For layout with header with position:fixed. Write here the height of your header for your anchor don't be hiden behind
        speed = 500,
        moving_frequency = 15, // Affects performance ! High number makes scroll more smooth
        links = document.getElementsByTagName('a'),
        href;
    
    for(var i=0; i<links.length; i++)
    {
        href = (links[i].attributes.href === undefined) ? null : links[i].attributes.href.value.toString();
        if(href !== null && href.length > 1 && href.indexOf('#') != -1) // href.substr(0, 1) == '#'
        {
            links[i].onclick = function()
            {
                var element,
                    href = this.attributes.href.value.toString(),
                    url = href.substr(0, href.indexOf('#')),
                    id = href.substr(href.indexOf('#')+1);
                if(element = document.getElementById(id))
                {
                    
                    var hop_count = (speed - (speed % moving_frequency)) / moving_frequency, // Always make an integer
                        getScrollTopDocumentAtBegin = getScrollTopDocument(),
                        gap = (getScrollTopElement(element) - getScrollTopDocumentAtBegin) / hop_count;
                    
                    if(window.history && typeof window.history.pushState == 'function')
                        window.history.pushState({}, undefined, url+'#'+id);// Change URL for modern browser
                    
                    for(var i = 1; i <= hop_count; i++)
                    {
                        (function()
                        {
                            var hop_top_position = gap*i;
                            setTimeout(function(){  window.scrollTo(0, hop_top_position + getScrollTopDocumentAtBegin); }, moving_frequency*i);
                        })();
                    }
                    
                    return false;
                }
            };
        }
    }
    
    var getScrollTopElement =  function(e)
    {
        var top = height_fixed_header * -1;

        while (e.offsetParent != undefined && e.offsetParent != null)
        {
            top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0);
            e = e.offsetParent;
        }
        
        return top;
    };
    
    var getScrollTopDocument = function()
    {
        return window.pageYOffset !== undefined ? window.pageYOffset : document.documentElement.scrollTop !== undefined ? document.documentElement.scrollTop : document.body.scrollTop;
    };
})(window);

/**********************************

For all pop up windows:

when the thumbnail image is clicked on, the corresponding large image will appear along with the title and information.
The innerHTML of the #mainPhoto will display the photo
The innerHTML of #mainInfo will display the corresponding information

**********************************/


//OPEN THE WINDOW
document.getElementById('flightPopUp').addEventListener('click', function(){
	document.getElementById('flight_popUp').className = 'show';
});

document.getElementById('planePopUp').addEventListener('click', function(){
	document.getElementById('plane_popUp').className = 'show';
});

document.getElementById('aboutPopUp').addEventListener('click', function(){
	document.getElementById('about_popUp').className = 'show';
});

document.getElementById('galleryPopUp').addEventListener('click', function(){
	document.getElementById('gallery_popUp').className = 'show';
});

document.getElementById('bookPopUp').addEventListener('click', function(){
	document.getElementById('booking_popUp').className = 'show';
});

document.getElementById('bookPopUp2').addEventListener('click', function(){
	document.getElementById('booking_popUp').className = 'show';
});


//CLOSE THE WINDOW BY CLOSE BUTTON

document.getElementById('close_flight').addEventListener('click', function(){
	document.getElementById('flight_popUp').className = 'hide';
});

document.getElementById('close_plane').addEventListener('click', function(){
	document.getElementById('plane_popUp').className = 'hide';
});

document.getElementById('close_about').addEventListener('click', function(){
	document.getElementById('about_popUp').className = 'hide';
});

document.getElementById('close_gallery').addEventListener('click', function(){
	document.getElementById('gallery_popUp').className = 'hide';
});

document.getElementById('close_booking').addEventListener('click', function(){
	document.getElementById('booking_popUp').className = 'hide';
});

//WINDOW POP UPS

// FLIGHT PACKAGES

//looping through the different info options

//scenic flight
document.getElementById('img1_flight').addEventListener('click', function(){
	document.getElementById('mainInfo_flight').innerHTML='<h3>Scenic Flight</h3><p>The scenic flight takes you over the breath taking views of the mountain ranges of the deep south. Avalible in either 1 or 2 hour flights, this is one flight that will leave you speechless.</p><ul><li>1 hour - $350 per passenger</li><li>2 hours - $650 per passenger</li><br></ul><button id="scenicBook" class="bookPopUpBtn">Book now.</button>'
	//when the book button for scenic flight is clicked, the book now box will appear and present the options for the scenic flight already chosen
	document.getElementById('scenicBook').addEventListener('click', function(){
		document.getElementById('booking_popUp').className = 'show';
	}); //end of form option
}); //end of scenc flight


//Mountain viewing at sunset and sunrise
document.getElementById('img2_flight').addEventListener('click', function(){
	document.getElementById('mainInfo_flight').innerHTML='<h3>Mountain Viewing</h3><p>Sunrises and sunsets are beautiful when you\'re on land and are just as stunning when you\'re in the sky flying over the mountains. This is a once in a lifetime oppourtunity that you\'re not going to want to miss.<br><br>Prices start at $350 per person - please contact us for more price information<br></p><button id="mountainBook" class="bookPopUpBtn">Book now.</button>'
	document.getElementById('mountainBook').addEventListener('click', function(){
		document.getElementById('booking_popUp').className = 'show';
	});
});//end of mountain viewing

//lake trips
document.getElementById('img3_flight').addEventListener('click', function(){
	document.getElementById('mainInfo_flight').innerHTML='<h3>Lake Trips</h3><p>Our amphibian aricraft is one of our most prized planes and caters to those wanting to visit the secluded lakes around the wanaka region. We provide fully catered day trips or just a drop off and pick up - you choose<br><br>Prices advised upon booking.</p><br><button id="lakeBook" class="bookPopUpBtn">Book now.</button>';
	document.getElementById('lakeBook').addEventListener('click', function(){
		document.getElementById('booking_popUp').className = 'show';
	});
}); //end of lake trips

//photography
document.getElementById('img4_flight').addEventListener('click', function(){
	document.getElementById('mainInfo_flight').innerHTML='<h3>Photographic flights</h3><p>Considering that the Wanaka region is one of the most beautiful places on earth, why wouldn\'t you want to come and photograph the views? We even take the doors off our planes to help you capture the perfect image.<br><br>Prices advised upon booking.</p><br><button id="photoBook" class="bookPopUpBtn">Book now.</button>';
	document.getElementById('photoBook').addEventListener('click', function(){
		document.getElementById('booking_popUp').className = 'show';
	});
});//end of photography

//charter
document.getElementById('img5_flight').addEventListener('click', function(){
	document.getElementById('mainInfo_flight').innerHTML='<h3>Charter flight</h3><p>Want to go somewhere? We can take you. Our friendly staff are happy to take you anywhere throughout the southern part of the South Island. There are a lot of hidden beauties out there that become the icing on the cake of your trip.<br><br>Prices advised upon booking.</p><br><button id="charterBook" class="bookPopUpBtn">Book now.</button>';
	document.getElementById('charterBook').addEventListener('click', function(){
		document.getElementById('booking_popUp').className = 'show';
	}); 
});//end of charter

//tramp
document.getElementById('img6_flight').addEventListener('click', function(){
	document.getElementById('mainInfo_flight').innerHTML='<h3>Tramping</h3><p>Are you a keen tramper who is ready for a new challenge? We can help. We\'re able to take you to some of the most remote tramps avalible throughout the Wanaka region. A new challenge surrounded by stunning views - what more could you want?<br><br>Prices are advised upon booking.<br>Please note that these tramps are only sutible for experienced trampers.</p><br><button id="trampBook" class="bookPopUpBtn">Book now.</button>';
	document.getElementById('trampBook').addEventListener('click', function(){
		document.getElementById('booking_popUp').className = 'show';
	});
});//end of tramp

//customized
document.getElementById('img7_flight').addEventListener('click', function(){
	document.getElementById('mainInfo_flight').innerHTML='<h3>Choose your own</h3><p>We want to provide you with the oppourtunity to create your own flight, so we\'ve done just that. You can choose which aricraft you would like to fly in along with when and how many passnegers. The world is your oyster.</p><ul><li>Fixed Wing - $350/hr per passenger</li><li>Helicopter - $450/hr per passenger</li><li>Glider flights - $1200/hr per passenger (3 hours recommended)</li><br></ul><button id="custBook" class="bookPopUpBtn">Book now.</button>';
	document.getElementById('custBook').addEventListener('click', function(){
		document.getElementById('booking_popUp').className = 'show';
	});
});//end of customized

//Questions
document.getElementById('img8_flight').addEventListener('click', function(){
	document.getElementById('mainInfo_flight').innerHTML='<h3>Have any questions?</h3><p>We would love to hear from you about any of the flights that we offer or could offer in the future!<div id="form2" class="cf"><form class="cf" id="question-form" method="post" action="#"><div class="form-group2"><label for="firstname">Name:</label><input id="firstname" name="firstname"type="text" required minlength="2" placeholder="John"><div id="firstname-error"></div></div><div class="form-group2"><label for="email">Email:</label><input id="email" name="email" type="email" required placeholder="example @ mail.com"><div id="email-error"></span></div><div class="form-group2"><label for="message">Message:</label><textarea id="message" name="message" rows="4" cols="60" required minlength="10" placeholder="Please enter your message here."></textarea><span id="message-error"></span></div><div class="form-group2"><input id="submit-button" type="submit" class="submit left cf" value="Submit Message"></div></form></div></p>';		
		
				addFormValidation(document.querySelector('#question-form'));
			
});//end of questions

/////////////////////////////////// PLANE INFO ///////////////////////////////////

//Cessna caravan amphibian
document.getElementById('img1_plane').addEventListener('click', function(){
	document.getElementById('mainInfo_plane').innerHTML='<h3>The Amphibian</h3><p>An amphibious aircraft or amphibian is an aircraft that can take off and land on both land and water. Fixed-wing amphibious aircraft are seaplanes (flying boats and floatplanes) that are equipped with retractable wheels, at the expense of extra weight and complexity, plus diminished range and fuel economy compared to planes designed for land or water only.</p>'
}); //end of caravan amphibian

//glider
document.getElementById('img2_plane').addEventListener('click', function(){
	document.getElementById('mainInfo_plane').innerHTML='<h3>The Glider</h3><p>A glider is a heavier-than-air aircraft that is supported in flight by the dynamic reaction of the air against its lifting surfaces, and whose free flight does not depend on an engine. A sailplane or glider is a type of glider aircraft used in the sport of gliding. Sailplanes are aerodynamically streamlined and are capable of soaring in rising air.</p>'
}); //end of glider

//stunt plane
document.getElementById('img3_plane').addEventListener('click', function(){
	document.getElementById('mainInfo_plane').innerHTML='<h3>The Stunt Plane</h3><p>Most aerobatic maneuvers involve rotation of the aircraft about its longitudinal (roll) axis or lateral (pitch) axis. Other maneuvers, such as a spin, displace the aircraft about its vertical (yaw) axis.[4] Maneuvers are often combined to form a complete aerobatic sequence for entertainment or competition.</p>'
});//end of stunt plane

//skyhawk
document.getElementById('img4_plane').addEventListener('click', function(){
	document.getElementById('mainInfo_plane').innerHTML='<h3>The Sky Hawk</h3><p>The Cessna Skyhawk® is the ultimate training aircraft and the most popular single-engine aircraft ever built. With the Garmin® G1000™ and GFC 700 autopilot, it delivers an intuitive cockpit experience matched with a highly durable air-frame with forgiving flying characteristics. This superior platform is ideally suited to learn the skills needed to become a true pilot in command.</p>'
});//end of skyhawk

//fixed wing
document.getElementById('img5_plane').addEventListener('click', function(){
	document.getElementById('mainInfo_plane').innerHTML='<h3>The Scenic</h3><p>Get on board our high-wing Cessna 206 float plane for a scenic flight you won’t forget: experience your take-off (and landing) from the water, then enjoy unrestricted views, looking down on sparkling lakes, snow-capped mountains and volcanoes, geothermal wonders, rolling surf beaches and lush forest. Therefore, booking is recommended, but not essential.</p>'
}); //fixed wing 1

//heli
document.getElementById('img6_plane').addEventListener('click', function(){
	document.getElementById('mainInfo_plane').innerHTML='<h3>The Helicoptor</h3><p>A helicopter is a type of rotorcraft in which lift and thrust are supplied by rotors. This allows the helicopter to take off and land vertically, to hover, and to fly forward, backward, and laterally. These attributes allow helicopters to be used in congested or isolated areas where fixed-wing aircraft and many forms of VTOL (vertical takeoff and landing) aircraft cannot perform.</p>'
});//heli



/////////////////////////////////// ABOUT //////////////////////////////////////

//STAFF

//olga and bruce
document.getElementById('img1_aboutUs').addEventListener('click', function(){
	document.getElementById('mainInfo_aboutUs').innerHTML='<h3>Olga and Bruce McKenzie</h3><p>The owners, Olga and Bruce McKenzie. Both born in Southland, travelled extensively, both have a commercial pilots licenses with 19 and 9 years respectively flying for Middle eastern airlines.<br><br>They own and operate a Cessna Caravan Amphibian which can take up to 7 people to any remote lake in the area. They also own a DG Flugzeugbau DG-­‐1001S with a Cessna Turbo Stationair to tow it. The Cessna is also available for custom scenic tours</p>'
});//end of olga and bruce

//finn mccool
document.getElementById('img2_aboutUs').addEventListener('click', function(){
	document.getElementById('mainInfo_aboutUs').innerHTML='<h3>Finn McCool</h3><p>Stunt pilot with the Red Arrows (UK airforce stunt team), has served in combat choppers in 3 recent wars, and fears nothing except small dogs and single women. Owns an Extra EA-­‐200 for the ultimate full stunt flight experience, and flies all our other fixed wing craft much more sedately when required.<br><br>And, yes, that is his real name. He’s Irish and he doesn’t want to talk about it.</p>'
});//finn mccool

//wendy
document.getElementById('img3_aboutUs').addEventListener('click', function(){
	document.getElementById('mainInfo_aboutUs').innerHTML='<h3>Wendy "Dropper" Gilhallen</h3><p>13 years commercial pilot in Africa, Russia and South America, during which she survived 3 crashes (none her own fault, she maintains). Owns a Cessna ­‐ 172Skyhawk P that is ideal for low level sight seeing, rides a Harley and is a ski instructor during the season.</p>'
});//wendy

//john
document.getElementById('img4_aboutUs').addEventListener('click', function(){
	document.getElementById('mainInfo_aboutUs').innerHTML='<h3>John "Doc" Holliday</h3><p>With over 10,000 hours piloting helicopters in the bush and mountains of the Southern Alps for deer recovery and mountain rescue operations, Doc is well qualified to land you and your friends in remote parts of the country that only he knows about. He’ll help you plot your route, drop extra provisions where you want them, and will pick you up when you’re done.</p>'
});//john

//Hans
document.getElementById('img5_aboutUs').addEventListener('click', function(){
	document.getElementById('mainInfo_aboutUs').innerHTML='<h3>Hans Gerhansen</h3><p>Hans has flown almost everything there is to fly. He first took the controls of a small plane at 12 years old, and flew solo when he was 14. After a few years flying “anything, anywhere” he settled into a series of test pilot jobs, but left that because he prefers company when he’s in the air. Hans doesn’t actually own his own plane right now , unless you count the microlight, but you will find him in the pilot’s seat of any of our aircraft. When he’s not skiing, tramping, climbing, hang gliding, or performing with his backup band at a local hotel.</p>'
});//hans


// DISPLAYING THE MAIN IMGAES ON THE POP UP WINDOWS

//GALLERY
window.thumbs = document.querySelectorAll('#thumbs img')

for(i = 0; i < thumbs.length; i++){
	thumbs[i].addEventListener('click', function(){
		var source = this.src;
		var newSource = source.replace('thumbs', 'large');
		document.getElementById('mainPhoto_gallery').innerHTML = '<img src="'+newSource+'">';
	});//end of thumbs event listener
};//end of about

//ABOUT US
window.aboutThumbs = document.querySelectorAll('#aboutThumbs img')

for(i = 0; i < aboutThumbs.length; i++){
	aboutThumbs[i].addEventListener('click', function(){
		var source = this.src;
		var newSource = source.replace('thumbs', 'large');
		document.getElementById('mainPhoto_about').innerHTML = '<img src="'+newSource+'">';
	});//end of thumbs event listener
};//end of about

//PLANE
window.planeThumbs = document.querySelectorAll('#planeThumbs img')

for(i = 0; i < planeThumbs.length; i++){
	planeThumbs[i].addEventListener('click', function(){
		var source = this.src;
		var newSource = source.replace('thumbs', 'large');
		document.getElementById('mainPhoto_plane').innerHTML = '<img src="'+newSource+'">';
	});//end of thumbs event listener
};//end of about

//FLIGHT PACKAGE

window.flightThumbs = document.querySelectorAll('#flightThumbs img');

for(i = 0; i < flightThumbs.length; i++){
	flightThumbs[i].addEventListener('click', function(){
		var source = this.src;
		var newSource = source.replace('thumbs', 'large');
		document.getElementById('mainPhoto_flight').innerHTML = '<img src="'+newSource+'">';
	});
};
