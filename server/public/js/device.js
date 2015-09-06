var Device = {
	init: function() {
		var vm = new Device.ViewModel();
		ko.applyBindings(vm, document.getElementById('device-view'));
		vm.init();


		$('#date-picker-from').datetimepicker();
		$('#date-picker-to').datetimepicker();
		$('#dial').knob({
			min: 0,
			max: 30,
			width: 100,
			'change' : function(v) {
				vm.showEvent(Math.floor(v));
			}
		});
		var slider = document.getElementById('slider')
		noUiSlider.create(slider, {
			start: [0],
			range: {
				'min': 0,
				'max': 59
			}
		});

		slider.noUiSlider.on('update', function(values, handle) {
			vm.showEvent(Math.floor(values));
		});
	},

	ViewModel: function() {
		var self = this;
		self.test = ko.observable("hi there");
		self.events = ko.observableArray([]);
		self.currentTime = ko.observable();
		self.currentDate = ko.observable();
		self.interval = ko.observable();
		self.init = function() {
			self.getEvents(function(data) {
				self.events.removeAll();
				data = data.message;
				for(i in data) {
					self.events.push(new Event(data[i]));
					self.showEvent(0);
				}
			}, 1);
		};
		self.onIntervalBtn = function() {
			if(typeof self.interval() === 'undefined' || self.interval() == 0) {
				self.interval(1);
			}
			self.getEvents(function(data) {
				self.events.removeAll();
				data = data.message;
				for(i in data) {
					self.events.push(new Event(data[i]));
					self.showEvent(0);
				}
			}, self.interval());
		};
		self.getEvents = function(callback, interval) {
			$.ajax({
				url: 'get-event?mac=' + MAC_ADDR + '&interval=' + interval,
				type: 'GET',
				success: function(data) {
					callback(data);
				},
				error: function(err) {
					console.error(err);
				}
			});
		};
		self.showEvent = function(idx) {
			for(i in self.events()) {
				self.events()[i].show(false);
			}	
			self.events()[idx].show(true);
			self.currentTime(self.events()[idx].time);
			self.currentDate(self.events()[idx].date);
		};
		var Event = function(event) {
			var self = this;
			self.show = ko.observable(false);
			self.imageSrc = ko.observable("");
			self.creation = ko.observable(event.creation);
			self.event = event;
			self.time = Utils.formatAMPM(event.creation);
			self.date = Utils.formatDate(event.creation);
			self.imagePath = (event.type == 'image') ? './uploads/' + USERNAME + '/' + MAC_ADDR + '/' + event.value : "";
			self.loadImg = function() {
				var img = new Image;
				img.onload = function() {
					self.imageSrc(img.src);
				}	
				img.src = self.imagePath;
			};
			self.loadImg();
		};
	}
}

$(document).ready(Device.init);