/**
Company : Bensiva
File    : custom.js
Version : 1.0
**/



/*************------------------------------


JS INDEX
    ===================

    01. Counter
    02. Menu
    03. Scroll Top
    04. OWL SLider
    05. Header Sticky


------------------------------*************/


(function ($) {
    $(document).on('ready', function() {
     "use strict";


/*------- OWL SLIDER START -------*/

/****---- service Slider Start ----****/

$('.service-slider').owlCarousel({
        loop:true, 
        margin:25,
        dots:false,
        autoplay:true,
        responsive:{

           0:{
                items:1
            },

            640:{
                items:2
            },

            1280:{
                items:3
            },

            1400:{
                items:4
            }
        }
    });

/****---- service Slider End ----****/


/****---- Portfolio Slider Start ----****/

$('.portfolio-slider').owlCarousel({
        loop:true, 
        dots:false,
        autoplay:true,
        responsive:{

           0:{
                items:1
            },

           568:{
                items:1
            },

            767:{
                items:2
            },

            990:{
                items:3
            },

            1280:{
                items:3,
                margin:20
            },
            1400:{
                items:4,
                margin:50
            }
        }
    });

/****---- Portfolio Slider End ----****/

/****---- Blog Slider Start ----****/

$('.blog-slider').owlCarousel({
        loop:true, 
        margin:30,
        autoplay:true,
        responsive:{

           0:{
                items:1
            },

           480:{
                items:1
            },

            640:{
                items:1
            },

            990:{
                items:2
            },

            1140:{
                items:2
            }
        }
    });

/****---- Blog Slider End ----****/

/****---- Testimonials Slider Start ----****/


$('.testimonials-slider').owlCarousel({
        loop:true, 
        margin:35,
        autoplay:true,
        responsive:{

           0:{
                items:1
            },

           480:{
                items:1
            },

            640:{
                items:1
            },

            990:{
                items:1
            },

            1140:{
                items:2
            }
        }
    });

/****---- Testimonials Slider Start ----****/

/****---- Blog 2 Slider Start ----****/

$('.blog-slider-2').owlCarousel({
        loop:true, 
        margin:50,
        autoplay:true,
        responsive:{

           0:{
                items:1
            },

           480:{
                items:1
            },

            640:{
                items:2
            },

            990:{
                items:3
            },

            1140:{
                items:3
            },
            1400:{
                items:4
            }

        }
    });

/****---- Blog 2 Slider End ----****/

/****---- Client Slider Start ----****/

$('.client').owlCarousel({
        loop:true, 
        margin:50,
        dots:false,
        autoplay:true,
        responsive:{

           0:{
                items:2
            },

           480:{
                items:2
            },

            640:{
                items:3
            },

            990:{
                items:4
            },

            1140:{
                items:5
            },
            
            1400:{
                items:6
            }

        }
    });

/****---- Client Slider End ----****/

/****---- Page Main Slider Start ----****/

$('.owl-main').owlCarousel({
    loop:true,
    margin:0,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    autoplay:true,
    autoplayTimeout:7000,
    autoplayHoverPause:false,
    responsive:{
        320:{
            items:1
        }
        ,
       1920:{
            items:1
        }
    }
});


/****---- Page Main Slider End ----****/


/*------- OWL SLIDER END -------*/


/****---- Counter Start ----****/

    $('.counter').counterUp({
        delay: 10,
        time: 1000
    });

/****---- Counter End ----****/



/****---- Scroll Top Start ----****/

 $(window).on("scroll", function(){
        if ($(this).scrollTop() > 100) { 
            $('#scroll').fadeIn(); 
        } else { 
            $('#scroll').fadeOut(); 
        } 
    }); 
    $('#scroll').on("click", function(){ 
        $("html, body").animate({ scrollTop: 0 }, 600); 
        return false; 
    }); 

/****---- Scroll Top End ----****/


 /****---- Menu Start ----****/


    /*--------------- SMARTMENU ---------------*/

    $('#main-menu').smartmenus({
        mainMenuSubOffsetX: -1,
        mainMenuSubOffsetY: 4,
        subMenusSubOffsetX: 6,
        subMenusSubOffsetY: -6
    });

    /*--------------- SMARTMENUS MOBILE MENU TOGGLE BUTTON ---------------*/

    var $mainMenuState = $('#main-menu-state');
    if ($mainMenuState.length) {
        // animate mobile menu
        $mainMenuState.on('change', function () {
            var $menu = $('#main-menu');
            if (this.checked) {
                $menu.hide().slideDown(250, function () {
                    $menu.css('display', '');
                });
            } else {
                $menu.show().slideUp(250, function () {
                    $menu.css('display', '');
                });
            }
        });
        // hide mobile menu beforeunload
        $(window).on('bind', 'beforeunload unload', function () {
            if ($mainMenuState[0].checked) {
                $mainMenuState[0].on("click");
            }
        });
    }
    $(function () {
        // use the whole parent item as sub menu toggle button
        $('#main-menu').on('bind', 'click.smapi', function (e, item) {
            var obj = $(this).data('smartmenus');
            if (obj.isCollapsible()) {
                var $sub = $(item).dataSM('sub');
                if ($sub && $sub.is(':visible')) {
                    obj.menuHide($sub);
                    return false;
                }
            }
        });
    });


    /*--------------- navigation menu---------------*/

    function mainmenu() {
        if ($(window).width() < 992) {
            $('.navbar .dropdown-item').on('click', function (e) {
                var $el = $(this).children('.dropdown-toggle');
                var $parent = $el.offsetParent(".dropdown-menu");
                $(this).parent("li").toggleClass('open');

                if (!$parent.parent().hasClass('navbar-nav')) {
                    if ($parent.hasClass('show')) {
                        $parent.removeClass('show');
                        $el.next().removeClass('show');
                        $el.next().css({
                            "top": -999,
                            "left": -999
                        });
                    } else {
                        $parent.parent().find('.show').removeClass('show');
                        $parent.addClass('show');
                        $el.next().addClass('show');
                        $el.next().css({
                            "top": $el[0].offsetTop,
                            "left": $parent.outerWidth() - 4
                        });
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            $('.navbar .dropdown').on('hidden.bs.dropdown', function () {
                $(this).find('li.dropdown').removeClass('show open');
                $(this).find('ul.dropdown-menu').removeClass('show open');
            });
        }
    }
    
    
 /****---- Menu End ----****/

 });

})(jQuery);

