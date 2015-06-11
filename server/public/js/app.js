var App = {

	init: function() {

		var vm = new App.ViewModel();
		ko.applyBindings(vm, document.getElementById('app'));
		vm.init();
		
		$('#slider-time').on('change', function() {
			var idx = $('#slider-time').val();
			if(idx == 30) return;
			vm.showEvent(idx);
		});


		/*vm.getImg();
		setInterval( function() {
			vm.getImg();
		}, 5000);*/
	},

	ViewModel: function() {
		var self = this;
		self.events = ko.observableArray([]);
		self.lastImgSrc = false;
		self.currentId;
		self.init = function() {
			App.getEvents(function(events) {
				for(i in events) {
					console.log(events[i]);
					var evt = new Event(events[i]);
					self.events.push(evt);
				}
				self.events()[events.length-1].show(true);
			});
		};
		self.getImg = function() {
			App.getEvent(function(data) {
				if(self.lastImgSrc == "./snapshots/" + data.imgName) {
					return;
				}
				self.lastImgSrc = self.imgSrc();
				var img = new Image;
				img.onload = function() {
					self.imgSrc(img.src);
				};
				img.src = "./snapshots/" + data.imgName;
			});
		};
		self.showEvent = function(idx) {
			for(i in self.events()) {
				self.events()[i].show(false);
			}	
			self.events()[idx].show(true);
		};
		var Event = function(event) {
			var self = this;
			self.event = event;
			self.imgPath = "./snapshots/" + event.imgName;
			self.imgSrc = ko.observable();
			self.date = ko.observable("SF Time: " +  event.timestamp);
			self.show = ko.observable(false);
			self.loadImg = function() {
				console.log("loading " + self.imgPath);
				var img = new Image;
				img.onload = function() {
					self.imgSrc(img.src);
				}	
				img.src = self.imgPath;
			};
			self.loadImg();
		}
	},

	getEvent: function(successCb) {
		$.ajax({
			url: "/event",
			type: "GET",
			dataType: "json",
			success: function(data) {
				successCb(data);
			},
			error: function(err) {
				console.error(err);
			}
		});
	},

	getEvents: function(successCb) {
		$.ajax({
                        url: "/events",
                        type: "GET",
                        dataType: "json",
                        success: function(data) {
                                successCb(data);
                        },      
                        error: function(err) {
                                console.error(err);
                        }       
                });
	},
	/*sendGcmNotify: function(data, successCb) {
		$.ajax({
			url: "/event",
			type: "POST",
			dataType: "json",
			contentType: "application/json;charset=utf-8",
			data: JSON.stringify(data),
			success: function(result, status, jqxhr) {
				successCb(result);
			},
			error: function(err) {
				console.error(err);
			}
		});
	},*/
	
};

$(document).ready(App.init);
