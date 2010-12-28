MooAsciiArt.js
===========

This is a port of two libraries combined into one, modified and extended, for the purpose of creating an ASCII display object capable of converting any DOM node into ASCII. It currently works on image nodes and any nodes you explicitly map to figlet fonts.

![Screenshot](http://patternweaver.com/MooAsciiArt/MooAsciiArt.jpg)

How to use
----------

convert all the images on the page:

    MooAsciiArt.convertImages();

convert a single image:

    MooAsciiArt.convertImage(img);
    
or
    img.toAsciiArt(true);
    
Now let's set h2 elements to the figlet doom font

    MooAsciiArt.convertTags({
        h2:'doom'
    });

what options are available?

MooAsciiArt.value determines the value scale the image conversion uses and can accept these built-in value scales: variant1', 'variant2', 'variant3', 'variant4', 'ultra-wide', 'wide', 'hatching', 'bits', 'binary' and 'greyscale

MooAsciiArt.fontPath : Sets the location of your .flf fonts directory.

MooAsciiArt.errorMode : Determines how the library will react if there is an error converting a DOM node settings are 'console', 'silent' and 'exception'.

MooAsciiArt.alpha : A boolean to determine whether (in black and white) alpha is considered and (in color) if opacity is applied to each character

MooAsciiArt.font : The monospaced font we're using.

Not too painful, eh? Enjoy!