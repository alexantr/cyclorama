/*! http://yashkin.by/cyclorama/ by @alexantr */
;(function ($) {
	$.fn.cyclorama = function (o) {

		o = $.extend({
			useKeyboard: false // enable keyboard support
		}, o || {});

		return this.each(function () {

			var $pan = $(this);
			var $panInner = $pan.find('.pan-inner');
			var $panLeft = $pan.find('.pan-left');
			var $panRight = $pan.find('.pan-right');

			// cloning
			var screenWidth = window.screen.width;
			var contentWidth = $panInner.find('.pan-content').width();

			while (contentWidth <= screenWidth) {
				$panInner.append($panInner.find('.pan-content').clone());
				contentWidth += contentWidth;
			}

			// multiply by 2
			$panInner.append($panInner.find('.pan-content').clone());

			$panInner.css({width: contentWidth * 2}); // set full width
			var initPos = -Math.round($panInner.width() / 2); // init position (-50% left)

			var startPos = initPos; // position while dragging start
			var curPos = initPos; // current position while dragging
			var prevPos = 0; // previous position for calc inertia
			var dirPrevPos; // previous position for calc direction

			var direction = 0; // 1 - left, 2 - right, 0 - nothing
			var offsetX = 0; // drag offset
			var isDragging = false; // is dragging now
			var percentage = 0; // offset percentage

			var timer;
			var dist = 0; // distance for inertia
			var posx;

			$panInner.on('mousedown touchstart', dragStart);
			$panInner.on('mouseup touchend', dragEnd);
			$panInner.on('mousemove touchmove', dragging);
			// left, right
			$($panLeft).on('mousedown', goRight);
			$($panRight).on('mousedown', goLeft);
			// keyboard left, right
			if (o.useKeyboard) {
				$(document).on("keydown", function (e) {
					if (e.which == 37) {
						e.preventDefault();
						goRight();
					} else if (e.which == 39) {
						e.preventDefault();
						goLeft();
					}
				});
			}

			function dragStart(e) {
				e.preventDefault();
				e.stopPropagation();

				if (e.type == "touchstart")
					offsetX = e.originalEvent.touches[0].pageX;
				else
					offsetX = e.pageX;

				isDragging = true;
				direction = 0; // reset direction

				prevPos = 0;
				timer = window.setInterval(setDist, 100);
			}

			function dragEnd(e) {
				e.preventDefault();
				e.stopPropagation();

				isDragging = false;

				startPos = curPos; // new position for drag start

				// smooth ending
				smooth(dist);

				window.clearInterval(timer);
			}

			function dragging(e) {
				e.preventDefault();
				e.stopPropagation();

				if (isDragging) {

					if (e.type == "touchmove")
						posx = e.originalEvent.touches[0].pageX - offsetX;
					else
						posx = e.pageX - offsetX;

					// direction
					if (typeof(dirPrevPos) != 'undefined') {
						var deltaX = dirPrevPos - e.pageX;
						if (deltaX > 0)
							direction = 2;
						else if (deltaX < 0)
							direction = 1;
						else
							direction = 0;
					}
					dirPrevPos = e.pageX;

					move(posx);
				}
			}

			function goLeft(e) {
				e.preventDefault();
				direction = 2;
				smooth(250);
			}

			function goRight(e) {
				e.preventDefault();
				direction = 1;
				smooth(250);
			}

			function move(pos) {
				curPos = startPos + pos;

				if (curPos >= 0)
					startPos = startPos + initPos;
				if (curPos <= initPos)
					startPos = startPos - initPos;

				$panInner.css({left: curPos});

				percentage = 100 - ((Math.abs(initPos) - Math.abs(curPos)) / Math.abs(initPos) * 100);
				if (percentage == 100) percentage = 0;

				showPercentage();
			}

			function smooth(dist) {
				if (!isDragging && dist > 1) {

					if (direction == 1)
						startPos = startPos + (dist / 10);
					else if (direction == 2)
						startPos = startPos - (dist / 10);

					if (direction > 0) {
						move(0);
						dist = dist * 0.97;
						setTimeout(function () {
							smooth(dist);
						}, 10);
					}
				}
			}

			function setDist() {
				dist = Math.abs(posx - prevPos);
				prevPos = posx;
			}

			function showPercentage() {
				$pan.find('.pan-runner').css({left: percentage + '%'});
			}
		});
	};

})(jQuery);