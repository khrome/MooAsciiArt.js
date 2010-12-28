/*
---
description: A MooTools Ascii art generator/DOM converter

license: [MIT-style, LGPL]

authors:
- Abbey Hawk Sparrow
- Jacob Seidelin (jsAscii)
- Scott Gonzolez (Figlet js)

requires:
    core/1.2.4: '*'

provides: [MooAsciiArt, Element.toAsciiArt]
...
*/
 
if(!String.reverse){
    String.implement({
        reverse : function(){
            splitext = this.split("");
            revertext = splitext.reverse();
            reversed = revertext.join("");
            return reversed;
        }
    });
}
 
var MooAsciiArt = {
    value : 'variant1',
    valueScales : {
        variant1 : ' .,:;i1tfLCG08@'.split(''),
        variant2 : '@%#*+=-:. '.reverse().split(''),
        variant3 : '#¥¥®®ØØ$$ø0oo°++=-,.    '.reverse().split(''),
        variant4 : '#WMBRXVYIti+=;:,. '.reverse().split(''),
        'ultra-wide' : ('MMMMMMM@@@@@@@WWWWWWWWWBBBBBBBB000000008888888ZZZZZZZZZaZaaaaaa2222222SSS'
            +'SSSSXXXXXXXXXXX7777777rrrrrrr;;;;;;;;iiiiiiiii:::::::,:,,,,,,.........       ').reverse().split(''),
        wide : '@@@@@@@######MMMBBHHHAAAA&&GGhh9933XXX222255SSSiiiissssrrrrrrr;;;;;;;;:::::::,,,,,,,........        '.reverse().split(''),
        hatching : '##XXxxx+++===---;;,,...    '.reverse().split(''),
        bits : '# '.reverse().split(''),
        binary : '01 '.reverse().split(''),
        greyscale : '"█▓▒░ '.reverse().split('')
    },
    color : ' CGO08@'.split(''),
    font : 'courier new',
    fontPath : 'fonts/',
    invert : false,
    alpha : false,
    errorMode : 'console',
    mappedTags : {},
    map : function(tag, font){
        this.mappedTags[tag] = font;
    },
    convertTags : function(tags){
        for(tag in tags){
            this.map(tag, tags[tag]);
            document.getElements(tag).each(function(node){
                node.toAsciiArt(true);
            });
        }
    },
    convertImages : function(forceAll){
        var elements = document.getElements('img');
        //console.log(['imgs', elements]);
        if(elements.length == 0){
            document.addEvent('domready', function(){
                document.getElements('img').each(function(img){
                    if(!img.asciiArtBuffer) this.convertImage(img);
                    console.log(['img', img]);
                }.bind(this));
            });
        }else{
            elements.each(function(img){
                if(!img.asciiArtBuffer) this.convertImage(img);
            }.bind(this));
        }
    },
    convertImage : function(img){
        img.toAsciiArt({invert:this.invert, alpha:this.alpha, inject:true});
    },
    //font handling stuff ported from Figlet
    fonts: {},
    parseFont: function(name, fn) { 
        if (name in MooAsciiArt.fonts) {
            fn();
        }
        MooAsciiArt.loadFont(name, function(defn) {          
            MooAsciiArt._parseFont(name, defn, fn);
        });
    },
    _parseFont: function(name, defn, fn) {
        var lines = defn.split("\n"),
        header = lines[0].split(" "),
        hardblank = header[0].charAt(header[0].length - 1),
        height = +header[1],
        comments = +header[5];
        MooAsciiArt.fonts[name] = {
            defn: lines.slice(comments + 1),
            hardblank: hardblank,
            height: height,
            char: {}
        };
        fn();
    },
    parseChar: function(char, font) {
        if(char > 122) return;
        var fontDefn = MooAsciiArt.fonts[font];
        if (char in fontDefn.char) return fontDefn.char[char];
        var height = fontDefn.height,
            start = (char - 32) * height,
            charDefn = [],
            i;
        for (i = 0; i < height; i++) {
            if(!fontDefn.defn[start + i]) return;
            charDefn[i] = fontDefn.defn[start + i].replace(/@/g, "")
            .replace(RegExp("\\" + fontDefn.hardblank, "g"), " ");
        }
        return fontDefn.char[char] = charDefn;
    },
    write: function(str, font, fn) {
        MooAsciiArt.parseFont(font, function() {
            var chars = {},
            result = "";
            for (var i = 0, len = str.length; i < len; i++) {
                chars[i] = MooAsciiArt.parseChar(str.charCodeAt(i), font);
            }
            for (i = 0, height = chars[0].length; i < height; i++) {
                for (var j = 0; j < len; j++) {
                    if(chars[j]) result += chars[j][i];
                }
                result += "\n";
            }
            fn(result, font);
        });
    },
    loadFont: function(name, fn) {
        var myRequest = new Request({
            url: this.fontPath + name+ '.flf',
            onSuccess: function(data) {
                //console.log('Parsed an FLF('+this.fontPath + name+ '.flf)');
                fn(data);
            }.bind(this)
        }).send();
    }
};

if(!Element.toAsciiArt){
    Element.implement({
        toAsciiArt : function(options){
            if(options === true) options = {inject:true};
            switch(this.tagName.toLowerCase()){
                case 'img':
                    if(!this.complete){
                        this.frozenOptions = options
                        this.onload = this.toAsciiArt.bind(this);
                        return;
                    }
                    if(this.frozenOptions){
                        options = this.frozenOptions;
                        delete this.frozenOptions;
                    }
                    if(!options){
                        options = {};
                    }
                    // settings : prefer options over attributes over defualts
                    var scale = options['scale']?options['scale']:(this.getAttribute("asciiscale")?parseInt(this.getAttribute("asciiscale")):1);
                    var isColor = options['color']=='true'||options['color']===true?true:(this.getAttribute("asciicolor")=='true'?true:false);
                    var isAlpha = options['alpha']=='true'||options['alpha']===true?true:(this.getAttribute("asciialpha")=='true'?true:false);
                    var isBlock = options['block']=='true'||options['block']===true?true:(this.getAttribute("asciiblock")=='true'?true:false);
                    var isInverted = options['invert']=='true'||options['invert']===true?true:(this.getAttribute("asciiinvert")=='true'?true:false);
                    var resolution = options['resolution']?options['resolution']:(this.getAttribute("asciiresolution")?this.getAttribute("asciiresolution"):'medium');
                    var characters = options['characters']?options['characters']:(this.getAttribute("asciichars")?this.getAttribute("asciichars"):(isColor ? MooAsciiArt.color : MooAsciiArt.valueScales[MooAsciiArt.value]));
                    //convert resolution enum to a value
                    var resolutionMode = resolution;
                    switch (resolution) {
                        case "low" : 	resolution = 0.25; break;
                        case "medium" : resolution = 0.5; break;
                        case "high" : 	resolution = 1; break;
                        default : resolution = parseFloat(resolution);
                    }
                    //setup our resources
                    var width = Math.round(parseInt(this.offsetWidth) * resolution);
                    var height = Math.round(parseInt(this.offsetHeight) * resolution);
                    if(!this.asciiArtBuffer) this.asciiArtBuffer = new Element('canvas', {
                        width : width,
                        height : height,
                        styles :{
                            width : width,
                            height : height,
                            display : 'none'
                        }
                    });
                    if(!this.asciiArtBuffer.getContext) throw('No buffer context available (Canvas unsupported?)');
                    var context = this.asciiArtBuffer.getContext('2d');
                    if(!context.getImageData) throw('No buffer context available (getImageData unsupported?)');
                    context.drawImage(this, 0, 0, width, height);
                    var data = context.getImageData(0, 0, width, height).data;
                    //now, fuck this shit up
                    var strChars = "";
                    var offset, red, green, blue, alpha, characterPosition, brightness, brightnessPosition, thisChar;
                    for (var y=0;y<height;y+=2) {
                        for (var x=0;x<width;x++) {
                            if(x%3 == 0) continue; // account for the mismatch in scale of a char, here we assume 3:2 ratio and correct to 2:2
                            offset = (y*width + x) * 4;
                            red = data[offset];
                            green = data[offset + 1];
                            blue = data[offset + 2];
                            alpha = data[offset + 3];
                            if(alpha == 0) {
                                brightnessPosition = 0;
                            } else {
                                if(isAlpha) brightness = (0.3*red + 0.59*green + 0.11*blue) * (alpha/255) / 255;
                                else brightness = (0.3*red + 0.59*green + 0.11*blue) / 255;
                                characterPosition = (characters.length-1) - Math.round(brightness * (characters.length-1));
                            }
                            if(isInverted) characterPosition = (characters.length-1) - characterPosition;
                            thisChar = characters[characterPosition];
                            if (thisChar == ' ') thisChar = '&nbsp;';
                            if (isColor) {
                                strChars += '<span style="'
                                    + 'color:rgb('+red+','+green+','+blue+');'
                                    + (isBlock ? 'background-color:rgb('+red+','+green+','+iBlue+');' : '')
                                    + (isAlpha ? 'opacity:' + (alpha/255) + ';' : '')
                                    + '">' + thisChar + '</span>';
                            } else {
                                if(isAlpha){
                                    if(alpha/255 < 0.3) strChars += ' ';
                                    else strChars += thisChar
                                }else strChars += thisChar;
                            }
                        }
                        strChars += '<br/>';
                    }
                    var fontSize = (2/resolution)*scale;
                    var lineHeight = (2/resolution)*scale;
                    // adjust letter-spacing for all combinations of scale and resolution to get it to fit the image width.
                    // AKA HACKY BULLSHIT
                    // todo: annihilate
                    var letterSpacing = 0;
                    if (resolutionMode == "low") {
                        switch (scale) {
                            case 1 : letterSpacing = -1; break;
                            case 2 : 
                            case 3 : letterSpacing = -2.1; break;
                            case 4 : letterSpacing = -3.1; break;
                            case 5 : letterSpacing = -4.15; break;
                        }
                    }
                    if (resolutionMode == "medium") {
                        switch (scale) {
                            case 1 : letterSpacing = 0; break;
                            case 2 : letterSpacing = -1; break;
                            case 3 : letterSpacing = -1.04; break;
                            case 4 : 
                            case 5 : letterSpacing = -2.1; break;
                        }
                    }
                    if (resolutionMode == "high") {
                        switch (scale) {
                            case 1 : 
                            case 2 : letterSpacing = 0; break;
                            case 3 : 
                            case 4 : 
                            case 5 : letterSpacing = -1; break;
                        }
                    }
                    var ascii = new Element('div', {
                        cellSpacing : 0,
                        cellPadding : 0,
                        styles : {
                            display : 'block',
                            width : Math.round(width/resolution*scale) + 'px',
                            height : Math.round(height/resolution*scale) + 'px',
                            'white-space' : 'pre',
                            margin : '0px',
                            padding : '0px',
                            'letter-spacing' : letterSpacing + 'px',
                            'font-family' : MooAsciiArt.font,
                            'font-size' : fontSize + 'px',
                            'line-height' : lineHeight + 'px',
                            'text-align' : 'left',
                            'text-decoration' : 'none',
                            //duplicate all the styles from the parent image
                            float : this.getStyle('float'),
                            padding : this.getStyle('padding'),
                            border : this.getStyle('border'),
                            margin : this.getStyle('margin'),
                            position : this.getStyle('position'),
                            top : this.getStyle('top'),
                            bottom : this.getStyle('bottom'),
                            left : this.getStyle('left'),
                            right : this.getStyle('right'),
                        }
                    });
                    ascii.innerHTML = (strChars);
                    if(options.inject){
                        ascii.replaces(this);
                        return this;   
                    }
                    if(options.returnText) return strChars;
                    return ascii.clone();
                    break;
                default:
                    //console.log(['convert', this.getAttribute('asciiConverted'), this]);
                    if(this.getAttribute('asciiConverted') == 'true') return;
                    var noActionFoundForTag = true;
                    if(options.inject && MooAsciiArt.mappedTags[this.tagName.toLowerCase()]){
                        this.setAttribute('asciiConverted', 'true');
                        MooAsciiArt.write(
                            this.innerHTML, 
                            MooAsciiArt.mappedTags[this.tagName.toLowerCase()], 
                            function(result){
                                this.innerHTML = '<pre>'+result+'</pre>';
                            }.bind(this)
                        );
                        noActionFoundForTag = false;
                    }
                    //console.log(['convert-', this.getAttribute('asciiConverted'), this]);
                    if(noActionFoundForTag){
                        var message = 'ASCII conversion not supported on this node type('+this.tagName+')!';
                        switch(MooAsciiArt.errorMode.toLowerCase()){
                            case 'exception':
                                throw(message);
                                break;
                            case 'console' :
                                console.log(message);
                                break;
                            case 'alert' :
                                alert(message);
                                break;
                            case 'silent' :
                            default :
                        }
                    }
                //switch
            }
        }
    });
}