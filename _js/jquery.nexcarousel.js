/*
 * NEXCAROUSEL  https://github.com/tonyjwalt/nexcarousel
 * LICENSE      Copyright (c) 2013 Anthony Walt - MIT License
 * Written by:  Tony Walt
 * Notes:       Jquery Widget carousel written to be responsive and rely on a sandbaging technique
 *              to maintain proper sizing and aspect ratio.
 *              It was written for a specific use. Please feel free to fork it, but I
 *              would greatly appreciate any changes so that I can continue to improve upon this.
 * Requires:    jQuery 1.9+
 * Requires:    jQuery UI 1.8.16+
 */

 // make sure required JavaScript modules are loaded
if (typeof jQuery === "undefined") {
  throw "This widget requires jquery module to be loaded";
}
(function($){
  var NexCarousel = {
    options: {
      height: 'min',      //set height of carousel - based on largest image ("max"), smallest ("min"), or a value
      autoInterval: 5000,     //milliseconds to hold each frame
      animSpeed: 1000,        //miliseconds for the animation speed
      autoPlay : true,      //play transitions automatically
      activeClass: 'active',    //class for the active item
      imglistClass: '.slide-list',
      useBullets: true,     //does the carousel use bullets
      bulletlistClass: '.bullet-list',
      bulletItemIdentifier: 'li', //Identifies the bullet items
      toSandbag: true,
      animationType: 'auto',
      useNav: true,       //does the carousel use nav
      carouselNavContClass: '.carousel-nav'
    },

    /************************
    *    PRIVATE METHODS    *
    *************************/
    _create : function(){
      var self = this;
      self.exists = true;
      /* set up a timer */
      self.inta = null;
      /* set an animation type if it's not already defined, based on modernizer */
      if ( self.animationType != 'css' || self.animationType != 'js' ) {
        self.animationType = ( Modernizr.csstransitions ) ? 'css' : 'js';
      }
      /* Map options to $this.optionName instead of $this.options.optionName */
      $.each(self.options, function(k,v){
        self[k] = v;
      });
    },
    _init : function(){
      var self = this
        i = 0;
      // set viewer
      self.$viewer = self.element;
      // set the image list
      self.$ImgList = $( self.imglistClass, self.element );
      
      // -- SET THE SLIDES -- //
      self.ImgItems = $( "li", self.$ImgList );
      if ( self.animationType != 'css' || self.animationType != 'js' ) {
        self.animationType = ( $('html').hasClass('csstransitions') ) ? 'css' : 'js';
      }
      if ( self.animationType == 'js' ) {
        self.ImgItems.hide();
      } else {
        self.ImgItems.addClass('csshide');
      }
      // create empty array
      self.$ImgItemArr = [];
      // fill the array with Jquery list items and hide them
      self._populateJQArr( self.ImgItems, self.$ImgItemArr );
      
      // -- SET THE BULLETS -- //
      if ( self.useBullets ) {
        self.$BulletList = $( self.bulletlistClass, self.element );
        self.$BulletItems = self.$BulletList.find( self.bulletItemIdentifier );
        // create empty array
        self.$BulletItemArr = [];
        // fill the array with Jquery list items and hide them
        self._populateJQArr( self.$BulletItems, self.$BulletItemArr );
        // Bind buttons
        self._bindBullets();
      }

      // -- SET THE NAV -- //
      if ( self.useNav ) {
        self._bindNav();
      }
      
      // assume starting on first slide
      self.activeNum = 0;
      // set the current element
      self.$currentEl = $( self.ImgItems[self.activeNum] );
      //self.$currentEl.addClass( self.activeClass );
      self.$currentEl.show();
      
      // Set height of view panel
      if (self.toSandbag) { self._setSizing(); }

      
      // Set Autoplay
       if(self.autoPlay){
        self._automate();
       }
    },
    _setSizing : function(){
      var self = this,
        baseSize = 0,
        $sandBagImg,
        $toAppend;
      
      switch (self.height) {
        case 'max':
        // find the tallest
          self.ImgItems.each( function ( i ) {
            var $this = $(this),
              tempH = $this.outerHeight();
            if ( tempH > baseSize ) {
              baseSize = tempH;
              $sandBagImg = $this;
            }
          } );
        break;
        case 'min':
        // find the shortest
          self.ImgItems.each( function ( i ) {
            var $this = $(this),
              tempH = $this.outerHeight();
            baseSize = ( i == 0 ) ? tempH : baseSize;
            if ( tempH <= baseSize ) {
              baseSize = tempH;
              $sandBagImg = $this;
            }
          } );
        break;
        default:
          if ( typeof self.height === 'number' ) {
            $sandBagImg = $(self.ImgItems[0]).clone();
            $sandBagImg.find('img').height( self.height );
          } else {
            //if self.height is not a valid value set it to min, and then run it
            self.height = 'min';
            self._setSizing();
            return false;
          }
        break;
      }
      $toAppend = $sandBagImg.find('img').clone().addClass('sandbag');
      //$toAppend = "<img class='sandbag' height='" + baseSize + "px' alt='sandbag image' src=''/>"
      self.$ImgList.after( $toAppend );
      //set image positions to absolute and rely on the sandbag for sizing
      self.ImgItems.each( function ( j ) {
        var $this = $( this );
        $this.find( 'img' ).css( { position: 'absolute' } );
        $this.append( $toAppend.clone() );
      } );
      return self;
    },
    _start : function(){
      var self = this;
      // set time to trigger next item
      self.inta = window.setInterval( function() {
        //advance to next item when triggered
        self.nextItem();
      }, self.autoInterval );
    },
    _automate : function(){
      var self = this;
      // set up timer
      self._start();
      
      self.$viewer.on( 'stop', function() {
        window.clearInterval( self.inta );
      } );
      
      self.$viewer.on( 'mouseenter', function(){
        $(this).trigger('stop');
      });
      
      self.$viewer.on( 'mouseleave', function(){
        self._start();
      });
      return self;
    },
    /* ===== BUTTON EVENTS ===== */
    _bindBullets : function ( ) {
      var self = this;
      self.$BulletList.on( 'click', self.bulletItemIdentifier, function ( e ) {
        e.preventDefault();
        // find the index of the clicked item in the bullet array
        var transNum = self._normalizeNum( $.inArray( this, self.$BulletItems ) );
        // pass that index (normalized) to the slide swap function
        self.swapSlide( transNum );
      } );
    },
    _bindNav : function ( ) {
      var self = this;
      $( self.carouselNavContClass ).on( 'click', 'button', function ( e ) {
        e.preventDefault();
        //get the advance amount
        var $this = $( this ),
          advVal =  Number( $this.attr( 'data-advance' ) ) + self.activeNum,
          transNum = self._normalizeNum( advVal );
        // pass that index (normalized) to the slide swap function
        self.swapSlide( transNum );
      } );
    },
    /* ===== HELPER METHODS ===== */
    _normalizeNum : function ( num ) {
      //ensure num is always a valid number
      var ImgLen = this.ImgItems.length,
        num = ( num < 0 ) ? ImgLen - 1 : num,
        num = ( num > ImgLen -1 ) ? num - ImgLen : num;
      return num;
    },
    _populateJQArr : function ( arr, jqarr ) {
      var i=0;
      //populate an array of Jquery objects
      for (; i<arr.length; i++) {
        var $temp = $( arr[i] );
        
        jqarr.push( $temp );
      }
    },
    /* ===== SWAP SLIDE ===== */
    _swapCSS : function ( transNum ) {
      var self = this;
      // fade out the current element
      self.$ImgItemArr[ self.activeNum ].removeClass( self.activeClass );
      // fade in the new element
      self.$ImgItemArr[ transNum ].addClass( self.activeClass );
      // finish the swap
      self._finishSwap( transNum );   
    },
    _swapJS : function ( transNum ) {
      var self = this;
      // fade out the current element
      self.$ImgItemArr[ self.activeNum ].fadeOut( self.animSpeed );
      // fade in the new element
      self.$ImgItemArr[ transNum ].fadeIn( self.animSpeed );
      // finish the swap
      self._finishSwap( transNum ); 
    },
    _finishSwap : function ( transNum ) {
      var self = this;
      //change out the bullet
      self.$BulletItemArr[ self.activeNum ].removeClass( self.activeClass );
      self.$BulletItemArr[ transNum ].addClass( self.activeClass );
      // set the active number to the transition number
      self.activeNum = transNum;
    },

    /***********************
    *    PUBLIC METHODS    *
    ************************/
    nextItem : function() {
      transNum = this._normalizeNum( this.activeNum + 1 );
      //set the transition number to the active number (normalized) + 1 , then swap slide
      this.swapSlide( transNum );
      return this;
    },
    swapSlide : function ( transNum ) {
      var self = this;
      if ( self.animationType == 'css') {
        self._swapCSS( transNum );
      } else {
        self._swapJS( transNum );
      }
      return this;
    },
    pauseSlides : function(){
      var self = this;
      $(this).trigger('stop');
      return self;
    },
    startSlides : function(){
      var self = this;
      self._start();
      return self;
    }     
  };

  $.widget( 'ui.NexCarousel', NexCarousel );
  /**
  * Example
  * $( '#myID' ).NexCarousel();
  **/
})(jQuery);
