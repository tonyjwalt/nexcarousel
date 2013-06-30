# Nexcarousel

This is a responsive Jquery Widget carousel using sandbagging to keep sizing and aspect ratio without JS events on resize. Transition animations utilize CSS transitions, unless it is not supported. In that instance the carousel uses JS.

### Requires
1. jQuery 1.9+
2. jQuery UI 1.8.16+ - To make the widget
3. Modernizer - I use this to determine if the browser supports CSS3 transitions.

### Options
* height - 'min', 'max', number
	min - string - (default) size the carousel height based on the smallest image
	max - string - size the carousel height on the largest image
	number - number - set the carousel height to a specific height
* autoInterval - 5000 - milliseconds to hold each frame
* animSpeed - 1000 - milliseconds for the animation speed
* autoPlay - true - play the carousel automatically
* activeClass - 'active' - class to apply to the active item
* imgListClass - '.slide-list' - class for the image list
* useBullets - true - tell the carousel to use bullets
* bulletlistClass - '.bullet-list' - class for the bullet list
* bulletItemIdentifier - 'li' - identifies the bullet items
* toSandbag - true - tells the carousel to apply it's own sandbags dynamically on initialization
* animationType - 'auto', 'css', 'js'
	auto - string - tells the carousel to detect if the browser supports css transitions and animates accordingly
	css - string - forces the carousel to use css transitions
	js - string - forces the carousel to use JS driven transitions
* useNav - true - tells the carousel to use nav buttons
* carouselNavContClass - '.carousel-nav' - the class for the carousel navigation container

### Public Methods
* nextItem ()
* swapSlide ( transition to slide number :number )
* pauseSlides ()
* startSlides ()

### Example Use
$( '#myID' ).NexCarousel();