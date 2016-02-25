
/*
* Title                   : Image Loader (jQuery Plugin)
* Version                 : 1.3
* File                    : jquery.dop.ImageLoader.js
* File Version            : 1.3
* Created / Last Modified : 26 February 2012
* Author                  : Dot on Paper 
* Copyright               : © 2012 Dot on Paper
* Website                 : http://www.dotonpaper.net
* Description             : Image Loader jQuery plugin.
*/

(function($){
    $.fn.DOPImageLoader = function(options){
        var Settings = {'Container': '',
                        'LoaderURL': 'ImageLoader/images/loader.gif',
                        'NoImageURL': 'ImageLoader/images/no-image.png',
                        'LoadPreloaderFirst': true,
                        'LoadingInOrder': true,
                        'ImageSize': 'fill', // none, container, fill, proportionally
                        'ImageDelay': 600,
                        'CacheBuster': false,
                        'SuccessCallback': '',
                        'ErrorCallback': ''},
        UniqueID = 0,
        Container = this,
        Images = new Array(),
        Attributes = new Array(),
        Parents = new Array(),
        ParentsWidth = new Array(),
        ParentsHeight = new Array(),
        NoImages = 0,

        methods = {
                    init:function(){// Init Plugin.
                        UniqueID = prototypes.randomString(32);
                        return this.each(function(){
                            if (options){
                                $.extend(Settings, options);
                            }
                            if (Settings['Container'] != ''){
                                Container = $(Settings['Container']);
                            }
                            methods.getImages();
                        });
                    },
                    getImages:function(){// Get all images data from the container and remove them.
                        $('img', Container).each(function(){
                            var t = $(this),
                            attributes = new Array();
				
                            for (var key in this.attributes) {
                                if(!isNaN(key) && this.attributes[key].name != 'src'){
                                    attributes.push(this.attributes[key]);
                                }
                            }
                            
                            NoImages++;
                            Images[NoImages] = t.attr('src');
                            Attributes[NoImages] = attributes;
                            Parents[NoImages] = t.parent();
                            ParentsWidth[NoImages] = t.parent().width();
                            ParentsHeight[NoImages] = t.parent().height();
                        });
                        methods.initImages();
                    },
                    initImages:function(){// Init Images.
                        var i;
                        
                        for (i=1; i<=NoImages; i++){
                            Parents[i].html('');
                        }

                        for (i=1; i<=NoImages; i++){
                            Parents[i].html(Parents[i].html()+'<span class="'+UniqueID+'-'+i+'">');
                            $('.'+UniqueID+'-'+i).css({'background':'url('+Settings['LoaderURL']+') no-repeat center center',
                                                       'display':'block',
                                                       'width':ParentsWidth[i],
                                                       'height':ParentsHeight[i]});
                        }

                        if (Settings['LoadPreloaderFirst']){
                            methods.loadPreloader();
                        }
                        else{
                            methods.initImagePreload();
                        }
                    },
                    loadPreloader:function(){// Load Preloader
                        var img = new Image();
                        
                        $(img).load(function(){
                            methods.initImagePreload();
                        }).error(function(){
                            methods.initImagePreload();
                        }).attr('src', Settings['LoaderURL']);
                    },
                    initImagePreload:function(){
                        if (Settings['LoadingInOrder']){
                            methods.loadImage(1);
                        }
                        else{
                            for (var i=1; i<=NoImages; i++){
                                methods.loadImage(i);
                            }
                        }
                    },
                    loadImage:function(no){// Load Image
                        var img = new Image(),
                        imgSrc = Images[no];

                        if (Settings['CacheBuster']){
                            imgSrc += '?CacheBuster='+prototypes.randomString(32);
                        }

                        $(img).load(function(){
                            var t = $(this), i;
                            
                            $('.'+UniqueID+'-'+no).append(this);
                            $('.'+UniqueID+'-'+no).css('background', 'none');
                            
                            for (i=0; i<Attributes[no].length; i++){
                                t.attr(Attributes[no][i].name, Attributes[no][i].nodeValue);
                            }
                            
                            if (Settings['ImageSize'] == 'container'){
                                t.width($('.'+UniqueID+'-'+no).width());
                                t.height($('.'+UniqueID+'-'+no).height());
                            }
                            else if (Settings['ImageSize'] == 'fill'){
                                $('.'+UniqueID+'-'+no).css('overflow', 'hidden');
                                prototypes.resizeItem2($('.'+UniqueID+'-'+no), t, $('.'+UniqueID+'-'+no).width(), $('.'+UniqueID+'-'+no).height(), t.width(), t.height(), 'center')
                            }
                            else if (Settings['ImageSize'] == 'proportionally'){
                                prototypes.resizeItem($('.'+UniqueID+'-'+no), t, $('.'+UniqueID+'-'+no).width(), $('.'+UniqueID+'-'+no).height(), t.width(), t.height(), 'center')
                            }
                            
                            $('.'+UniqueID+'-'+no).css('opacity', 0);
                            $('.'+UniqueID+'-'+no).animate({'opacity': 1}, Settings['ImageDelay']);
                            
                            if (Settings['LoadingInOrder'] && no < NoImages){
                                methods.loadImage(no+1);
                            }
                            
                            eval(Settings['SuccessCallback']);
                        }).error(function(){
                            $('.'+UniqueID+'-'+no).css({'background':'url('+Settings['NoImageURL']+') no-repeat center center',
                                                        'opacity': 0});
                            $('.'+UniqueID+'-'+no).animate({'opacity': 1}, Settings['ImageDelay']);
                            
                            if (Settings['LoadingInOrder'] && no < NoImages){
                                methods.loadImage(no+1);
                            }
                            
                            eval(Settings['ErrorCallback']);
                        }).attr('src', imgSrc);
                    }                    
                  },

        prototypes = {
                        resizeItem:function(parent, child, cw, ch, dw, dh, pos){// Resize & Position an Item (the item is 100% visible)
                            var currW = 0, currH = 0;

                            if (dw <= cw && dh <= ch){
                                currW = dw;
                                currH = dh;
                            }
                            else{
                                currH = ch;
                                currW = (dw*ch)/dh;

                                if (currW > cw){
                                    currW = cw;
                                    currH = (dh*cw)/dw;
                                }
                            }

                            child.width(currW);
                            child.height(currH);
                            switch(pos.toLowerCase()){
                                case 'top':
                                    prototypes.topItem(parent, child, ch);
                                    break;
                                case 'bottom':
                                    prototypes.bottomItem(parent, child, ch);
                                    break;                            
                                case 'left':
                                    prototypes.leftItem(parent, child, cw);
                                    break;
                                case 'right':
                                    prototypes.rightItem(parent, child, cw);
                                    break;
                                case 'horizontal-center':
                                    prototypes.hCenterItem(parent, child, cw);
                                    break;
                                case 'vertical-center':
                                    prototypes.vCenterItem(parent, child, ch);
                                    break;
                                case 'center':
                                    prototypes.centerItem(parent, child, cw, ch);
                                    break;
                                case 'top-left':
                                    prototypes.tlItem(parent, child, cw, ch);
                                    break;
                                case 'top-center':
                                    prototypes.tcItem(parent, child, cw, ch);
                                    break;
                                case 'top-right':
                                    prototypes.trItem(parent, child, cw, ch);
                                    break;
                                case 'middle-left':
                                    prototypes.mlItem(parent, child, cw, ch);
                                    break;
                                case 'middle-right':
                                    prototypes.mrItem(parent, child, cw, ch);
                                    break;
                                case 'bottom-left':
                                    prototypes.blItem(parent, child, cw, ch);
                                    break;
                                case 'bottom-center':
                                    prototypes.bcItem(parent, child, cw, ch);
                                    break;
                                case 'bottom-right':
                                    prototypes.brItem(parent, child, cw, ch);
                                    break;
                            }
                        },
                        resizeItem2:function(parent, child, cw, ch, dw, dh, pos){// Resize & Position an Item (the item covers all the container)
                            var currW = 0, currH = 0;

                            currH = ch;
                            currW = (dw*ch)/dh;

                            if (currW < cw){
                                currW = cw;
                                currH = (dh*cw)/dw;
                            }

                            child.width(currW);
                            child.height(currH);

                            switch(pos.toLowerCase()){
                                case 'top':
                                    prototypes.topItem(parent, child, ch);
                                    break;
                                case 'bottom':
                                    prototypes.bottomItem(parent, child, ch);
                                    break;
                                case 'left':
                                    prototypes.leftItem(parent, child, cw);
                                    break;
                                case 'right':
                                    prototypes.rightItem(parent, child, cw);
                                    break;
                                case 'horizontal-center':
                                    prototypes.hCenterItem(parent, child, cw);
                                    break;
                                case 'vertical-center':
                                    prototypes.vCenterItem(parent, child, ch);
                                    break;
                                case 'center':
                                    prototypes.centerItem(parent, child, cw, ch);
                                    break;
                                case 'top-left':
                                    prototypes.tlItem(parent, child, cw, ch);
                                    break;
                                case 'top-center':
                                    prototypes.tcItem(parent, child, cw, ch);
                                    break;
                                case 'top-right':
                                    prototypes.trItem(parent, child, cw, ch);
                                    break;
                                case 'middle-left':
                                    prototypes.mlItem(parent, child, cw, ch);
                                    break;
                                case 'middle-right':
                                    prototypes.mrItem(parent, child, cw, ch);
                                    break;
                                case 'bottom-left':
                                    prototypes.blItem(parent, child, cw, ch);
                                    break;
                                case 'bottom-center':
                                    prototypes.bcItem(parent, child, cw, ch);
                                    break;
                                case 'bottom-right':
                                    prototypes.brItem(parent, child, cw, ch);
                                    break;
                            }
                        },

                        topItem:function(parent, child, ch){// Position Item on Top
                            parent.height(ch);
                            child.css('margin-top', 0);
                        },
                        bottomItem:function(parent, child, ch){// Position Item on Bottom
                            parent.height(ch);
                            child.css('margin-top', ch-child.height());
                        },
                        leftItem:function(parent, child, cw){// Position Item on Left
                            parent.width(cw);
                            child.css('margin-left', 0);
                        },
                        rightItem:function(parent, child, cw){// Position Item on Right
                            parent.width(cw);
                            child.css('margin-left', parent.width()-child.width());
                        },
                        hCenterItem:function(parent, child, cw){// Position Item on Horizontal Center
                            parent.width(cw);
                            child.css('margin-left', (cw-child.width())/2);
                        },
                        vCenterItem:function(parent, child, ch){// Position Item on Vertical Center
                            parent.height(ch);
                            child.css('margin-top', (ch-child.height())/2);
                        },
                        centerItem:function(parent, child, cw, ch){// Position Item on Center
                            prototypes.hCenterItem(parent, child, cw);
                            prototypes.vCenterItem(parent, child, ch);
                        },
                        tlItem:function(parent, child, cw, ch){// Position Item on Top-Left
                            prototypes.topItem(parent, child, ch);
                            prototypes.leftItem(parent, child, cw);
                        },
                        tcItem:function(parent, child, cw, ch){// Position Item on Top-Center
                            prototypes.topItem(parent, child, ch);
                            prototypes.hCenterItem(parent, child, cw);
                        },
                        trItem:function(parent, child, cw, ch){// Position Item on Top-Right
                            prototypes.topItem(parent, child, ch);
                            prototypes.rightItem(parent, child, cw);
                        },
                        mlItem:function(parent, child, cw, ch){// Position Item on Middle-Left
                            prototypes.vCenterItem(parent, child, ch);
                            prototypes.leftItem(parent, child, cw);
                        },
                        mrItem:function(parent, child, cw, ch){// Position Item on Middle-Right
                            prototypes.vCenterItem(parent, child, ch);
                            prototypes.rightItem(parent, child, cw);
                        },
                        blItem:function(parent, child, cw, ch){// Position Item on Bottom-Left
                            prototypes.bottomItem(parent, child, ch);
                            prototypes.leftItem(parent, child, cw);
                        },
                        bcItem:function(parent, child, cw, ch){// Position Item on Bottom-Center
                            prototypes.bottomItem(parent, child, ch);
                            prototypes.hCenterItem(parent, child, cw);
                        },
                        brItem:function(parent, child, cw, ch){// Position Item on Bottom-Right
                            prototypes.bottomItem(parent, child, ch);
                            prototypes.rightItem(parent, child, cw);
                        },

                        randomize:function(theArray){// Randomize the items of an array
                            theArray.sort(function(){
                                return 0.5-Math.random();
                            });
                            return theArray;
                        },
                        randomString:function(string_length){// Create a string with random elements
                            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
                            random_string = '';

                            for (var i=0; i<string_length; i++){
                                var rnum = Math.floor(Math.random()*chars.length);
                                random_string += chars.substring(rnum,rnum+1);
                            }
                            return random_string;
                        },

                        isIE8Browser:function(){// Detect the browser IE8
                            var isIE8 = false,
                            agent = navigator.userAgent.toLowerCase();

                            if (agent.indexOf('msie 8') != -1){
                                isIE8 = true;
                            }
                            return isIE8;
                        },
                        isTouchDevice:function(){// Detect Touchscreen devices
                            var isTouch = false,
                            agent = navigator.userAgent.toLowerCase();

                            if (agent.indexOf('android') != -1){
                                isTouch = true;
                            }
                            if (agent.indexOf('blackberry') != -1){
                                isTouch = true;
                            }
                            if (agent.indexOf('ipad') != -1){
                                isTouch = true;
                            }
                            if (agent.indexOf('iphone') != -1){
                                isTouch = true;
                            }
                            if (agent.indexOf('ipod') != -1){
                                isTouch = true;
                            }
                            if (agent.indexOf('palm') != -1){
                                isTouch = true;
                            }
                            if (agent.indexOf('series60') != -1){
                                isTouch = true;
                            }
                            if (agent.indexOf('symbian') != -1){
                                isTouch = true;
                            }
                            if (agent.indexOf('windows ce') != -1){
                                isTouch = true;
                            }

                            return isTouch;
                        },

                        openLink:function(url, target){// Open a link.
                            if (target.toLowerCase() == '_blank'){
                                window.open(url);
                            }
                            else{
                                window.location = url;
                            }
                        }
                     };

        return methods.init.apply(this);
    }
})(jQuery);