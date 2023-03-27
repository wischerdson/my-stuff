(function($) {
	$.Palette = function(args) {
		if (!arguments[0].container) throw new Error('There is must specify a container. Use property "container" with query to DOM element.');
		let container = $(arguments[0].container);
		if (container.length == 0) throw new Error('Specified container is not found');

		const globalThis = this;

		const hsvToHex = function (hsv) {
			const H = hsv[0], S = hsv[1]*100, V = hsv[2]*100;
			let rgb = [], hex = [];

			Hi = Math.floor((H/60)%6);
			Vmin = ((100 - S)*V)/100;
			a = (V - Vmin)*(H%60)/60;
			Vinc = Vmin + a;
			Vdec = V - a;

			switch (Hi) {
				case 0:
				rgb[0] = V; rgb[1] = Vinc; rgb[2] = Vmin;
				break;
				case 1:
				rgb[0] = Vdec; rgb[1] = V; rgb[2] = Vmin;
				break;
				case 2:
				rgb[0] = Vmin; rgb[1] = V; rgb[2] = Vinc;
				break;
				case 3:
				rgb[0] = Vmin; rgb[1] = Vdec; rgb[2] = V;
				break;
				case 4:
				rgb[0] = Vinc; rgb[1] = Vmin; rgb[2] = V;
				break;
				case 5:
				rgb[0] = V; rgb[1] = Vmin; rgb[2] = Vdec;
				break;
			}

			hex[0] = Math.round(rgb[0]*2.55).toString(16)
			hex[1] = Math.round(rgb[1]*2.55).toString(16)
			hex[2] = Math.round(rgb[2]*2.55).toString(16)

			hex.forEach(function (value, key) {
				hex[key] = hex[key].length === 1 ? '0' + hex[key] : hex[key]
			})

			return hex[0] + hex[1] + hex[2]
		}
		
		$('svg.palette__gradients').length != 0 ? true : $('body').prepend('<svg class="palette__gradients">' +
			'<defs>' +
			'<linearGradient id="palette__color_gradient_black" x1="0%" x2="0%" y1="0%" y2="100%">' +
			'<stop offset="0%" stop-color="rgb(0,0,0)" stop-opacity="0"></stop>' +
			'<stop offset="100%" stop-color="rgb(0,0,0)" stop-opacity="1"></stop>' +
			'</linearGradient>' +
			'<linearGradient id="palette__color_gradient_white" x1="0%" x2="100%" y1="0%" y2="0%">' +
			'<stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="1"></stop>' +
			'<stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0"></stop>' +
			'</linearGradient>' +
			'</defs>' +
			'</svg>');

		container.append('<div class="palette__wrapper">' + 
			'<div class="palette__content">' + 
			'<div class="palette__picker-tone"></div>' + 
			'<svg class="palette__tone">' + 
			'<rect shape-rendering="crispEdges" class="palette__changing_color" x="0" y="0" width="100%" height="100%" fill="hsl(0, 100%, 50%)" id="picker-color-tone" />' + 
			'<rect shape-rendering="crispEdges" x="0" y="0" width="100%" height="100%" fill="url(#palette__color_gradient_white)" />' + 
			'<rect shape-rendering="crispEdges" x="0" y="0" width="100%" height="100%" fill="url(#palette__color_gradient_black)" />' + 
			'</svg>' + 
			'</div>' + 
			'</div>' + 
			'<div class="palette__color-wrapper">' + 
			'<div class="palette__picker-color"></div>' + 
			'<svg class="palette__color">' + 
			'<defs>' + 
			'<linearGradient id="tone-gradient" x1="0%" x2="0%" y1="0%" y2="100%">' + 
			'<stop offset="0%" stop-color="rgb(255,0,0)" stop-opacity="1" />' + 
			'<stop offset="16.6%" stop-color="rgb(255,0,255)" stop-opacity="1" />' + 
			'<stop offset="33.2%" stop-color="rgb(0,0,255)" stop-opacity="1" />' + 
			'<stop offset="49.8%" stop-color="rgb(0,255,255)" stop-opacity="1" />' + 
			'<stop offset="66.4%" stop-color="rgb(0,255,0)" stop-opacity="1" />' + 
			'<stop offset="83%" stop-color="rgb(255,255,0)" stop-opacity="1" />' + 
			'<stop offset="100%" stop-color="rgb(255,0,0)" stop-opacity="1" />' + 
			'</linearGradient>' + 
			'</defs>' + 
			'<rect shape-rendering="crispEdges" x="0" y="0" width="100%" height="100%" fill="url(#tone-gradient)" />' + 
			'</svg>' + 
			'</div>').addClass('palette__user-container');



		const tone = container.find('.palette__wrapper');
		const color = container.find('.palette__color-wrapper');
		const pickerTone = container.find('.palette__picker-tone');
		const pickerColor = container.find('.palette__picker-color');
		let tone_mouseDown = false;
		let color_mouseDown = false;

		let hsv = [0, 1, 1];


		let toneUpdater = function (e) {
			if (!tone_mouseDown) return false;

			const toneW = tone.outerWidth();
			const toneH = tone.outerHeight();
			const pickerToneW = pickerTone.outerWidth();
			const pickerToneH = pickerTone.outerHeight();

			let moveX = e.pageX - tone.offset().left - pickerToneW/2;
			let moveY = e.pageY - tone.offset().top - pickerToneH/2;

			moveX = (moveX + pickerToneW/2 <= 0) ? (-pickerToneW/2) : (moveX >= toneW - pickerToneW/2 ? toneW - pickerToneW/2 : moveX);
			moveY = (moveY + pickerToneH/2 <= 0) ? (-pickerToneH/2) : (moveY >= toneH - pickerToneH/2 ? toneH - pickerToneH/2 : moveY);

			const percentX = (moveX + pickerToneW/2) / toneW;
			const percentY = (moveY + pickerToneH/2) / toneH;

			hsv[1] = percentX;
			hsv[2] = (1 - percentY);

			pickerTone.css('left', moveX + 'px');
			pickerTone.css('top', moveY + 'px');
		}

		let colorUpdater = function (e) {
			const colorH = color.outerHeight();
			
			const pickerColorH = pickerColor.outerHeight();
			let moveY = Math.round(e.pageY - color.offset().top - pickerColorH/2);
			moveY = (moveY + pickerColorH/2 <= 0) ? (-pickerColorH/2) : (moveY >= colorH - pickerColorH/2 ? colorH - pickerColorH/2 : moveY);
			pickerColor.css('top', moveY + 'px');

			const percentY = (moveY + pickerColorH/2) / colorH;
			hsv[0] = (1-percentY)*360;
			container.find('.palette__changing_color').attr('fill', 'hsl(' + (1-percentY)*360 + ', 100%, 50%)');
		}


		this.userFunctionForUpdating = function () { }
		this.userFunctionForUpdatingStopped = function () { }
		this.userFunctionForUpdatingStarted = function () { }



		tone.on('mousedown', function (e) {
			tone_mouseDown = true;
			pickerTone.addClass('palette__pickers-animation');
			toneUpdater(e);
			globalThis.userFunctionForUpdatingStarted();
		});
		color.on('mousedown', function (e) {
			color_mouseDown = true;
			pickerColor.addClass('palette__pickers-animation');
			colorUpdater(e);
			globalThis.userFunctionForUpdatingStarted();
		});
		$(document).on('mouseup', function (e) {
			tone_mouseDown = color_mouseDown = false;
			globalThis.userFunctionForUpdatingStopped();
		});
		$(document).on('mousemove', function (e) {
			if (!tone_mouseDown && !color_mouseDown) return false;
			if (tone_mouseDown) toneUpdater(e);
			if (color_mouseDown) colorUpdater(e);

			globalThis.userFunctionForUpdating(e);

			pickerColor.removeClass('palette__pickers-animation');
			pickerTone.removeClass('palette__pickers-animation');
		});


		this.getColor = function () {
			return hsvToHex(hsv);
		}
		this.setColor = function (hex) {

		}

		this.paletteUpdatingStarted = function (f) {
			this.userFunctionForUpdatingStarted = f;
		}
		this.paletteUpdatingStopped = function (f) {
			this.userFunctionForUpdatingStopped = f;
		}
		this.paletteUpdating = function (f) {
			this.userFunctionForUpdating = f;
		}

		return this;
	};
})(jQuery);


Number.prototype.numSys = String.prototype.numSys = function (from, to) {
	const hexTranslate = {'1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0, 'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15}
	let number = this.toString().toLowerCase().split('')


	number.forEach(function (value1, key1) {
		hexTranslate.forEach(function (value2, key2) {
			number[key1] = number[key1] === key2 ? value2 : -1
		})
	})


	console.log(hexTranslate)


}

