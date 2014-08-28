(function ($) {
	$.fn.cyclorama = function (o) {

		o = $.extend({
			panLeft: null,
			panRight: null,
			useKeyboard: false // включить перемотку клавиатурой
		}, o || {});

		return this.each(function () {

			var $pan = $(this);
			var $panInner = $pan.find('.pan-inner');

			///////////////

			var initPos = -Math.round($panInner.width() / 2); // начальное положение

			var startPos = initPos; // положение в начале драга
			var curPos = initPos; // положение относительно стартового
			var prevPos = 0; // предыдущее положение для расчета инерции
			var dirPrevPos; // предыдущее положение для расчета направления

			var direction = 0; // 1 - вправо, 2 - влево, 0 - никак
			var offsetX = 0; // смещение при драге
			var isDragging = false; // идет ли перетаскивание
			var percentage = 0; // процент смещения

			var timer;
			var dist = 0; // дистанция для расчета инерции
			var posx;

			$pan.on('mousedown touchstart', dragStart);
			$pan.on('mouseup touchend', dragEnd);
			$pan.on('mousemove touchmove', dragging);
			// влево, вправо
			if (o.panLeft) {
				$(o.panLeft).on('click', dragRight);
			}
			if (o.panRight) {
				$(o.panRight).on('click', dragLeft);
			}
			// клавиатура
			if (o.useKeyboard) {
				$(document).on("keydown", function (e) {
					if (e.which == 37) {
						e.preventDefault();
						dragRight();
					} else if (e.which == 39) {
						e.preventDefault();
						dragLeft();
					}
				});
			}

			// нажали
			function dragStart(e) {
				e.preventDefault();
				e.stopPropagation();

				if (e.type == "touchstart")
					offsetX = e.originalEvent.touches[0].pageX;
				else
					offsetX = e.pageX;

				isDragging = true;
				direction = 0; // сбросим направление

				prevPos = 0;
				timer = window.setInterval(setDist, 100);
			}

			// отпустили
			function dragEnd(e) {
				e.preventDefault();
				e.stopPropagation();

				isDragging = false;

				startPos = curPos; // новое положение для старта драга

				// плавное завершение
				smooth(dist);

				window.clearInterval(timer);
			}

			// двигаем
			function dragging(e) {
				e.preventDefault();
				e.stopPropagation();

				if (isDragging) {

					if (e.type == "touchmove")
						posx = e.originalEvent.touches[0].pageX - offsetX;
					else
						posx = e.pageX - offsetX;

					// направление
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

			// перемещение влево
			function dragLeft() {
				direction = 2;
				smooth(250);
			}

			// перемещение вправо
			function dragRight() {
				direction = 1;
				smooth(250);
			}

			// смещение
			function move(pos) {
				curPos = startPos + pos;

				if (curPos >= 0)
					startPos = startPos + initPos;
				if (curPos <= initPos)
					startPos = startPos - initPos;

				$panInner.css({left: curPos});

				percentage = 100 - ((Math.abs(initPos) - Math.abs(curPos)) / Math.abs(initPos) * 100);
				if (percentage == 100) percentage = 0;

				//showPercentage();
			}

			// плавное смещение
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

			// расчет дистанции для инерции
			function setDist() {
				dist = Math.abs(posx - prevPos);
				prevPos = posx;
			}

			//////////

			// show percentage
			/*function showPercentage() {
				$('#info').text(percentage + '%');
			}*/
		});
	};

})(jQuery);