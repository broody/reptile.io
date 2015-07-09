var init = function() {
	$('#date-picker-from').datetimepicker();
	$('#date-picker-to').datetimepicker();
	$('#dial').knob({
		min: 0,
		max: 30,
		width: 100
	});
}

$(document).ready(init);