var App = {

	init: function() {
		var vm = new App.ViewModel();
		ko.applyBindings(vm, document.getElementById('app'));

		vm.getImg();
		setInterval( function() {
			vm.getImg();
		}, 5000);
	},

	ViewModel: function() {
		var self = this;
		self.imgSrc = ko.observable();
		self.lastImgSrc = false;
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
	}
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