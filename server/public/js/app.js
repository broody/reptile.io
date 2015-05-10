var App = {

	init: function() {
		var vm = new App.ViewModel();
		ko.applyBindings(vm, document.getElementById('app'));

		App.getEvent(function(data) {
			vm.imgSrc("./snapshots/" + data.imgName);
		});
	},

	ViewModel: function() {
		var self = this;
		self.imgSrc = ko.observable();
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