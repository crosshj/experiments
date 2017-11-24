

// http://www.samstarling.co.uk/2012/05/desaturating-colours-using-javascript/
function desaturate(r, g, b) {
    var intensity = 0.3 * r + 0.59 * g + 0.11 * b;
    var k = 1;
    r = Math.floor(intensity * k + r * (1 - k));
    g = Math.floor(intensity * k + g * (1 - k));
    b = Math.floor(intensity * k + b * (1 - k));
    return rgb_to_string(r, g, b);
}

function rgb_to_string(r, g, b) {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function desaturate_element(selector) {
	 $(selector).each(function(){
		 var foreground = $(this).css('color').match(/\d+/g);
	    var background = $(this).css('background-color').match(/\d+/g);
		 var border = $(this).css("border-color").match(/\d+/g);
		 $(this).css('color', desaturate(foreground[0], foreground[1], foreground[2]));
	    $(this).css('background-color', desaturate(background[0], background[1], background[2]));
		 $(this).css('border-color', desaturate(border[0], border[1], border[2]));
	});
}

function desaturate_all() {
	  desaturate_element('div');
	  desaturate_element('canvas');
	  desaturate_element('font');
	  $('font').css('background-color','');
}

$('document').ready(function (){
	//desaturate_all();
 });