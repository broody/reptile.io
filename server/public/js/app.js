var App = {
	init: function() {
		var vm = new App.ViewModel();
		ko.applyBindings(vm, document.getElementById('app'));
		App.jQueryInit();
	},

	ViewModel: function() {
		var self = this;
		self.onLogout = function() {
			$.ajax({
				url: 'logout',
				type: 'GET',
				complete: function() {
					location.reload(true);
				}
			});
		};
	},

	jQueryInit: function() {
		$('#register-form').validator().on('submit', function (e) {
			e.preventDefault();
  		$.ajax({
				url: 'register',
				type: 'POST',
				dataType: 'json',
				contentType: 'application/json;charset=utf-8',
				data: JSON.stringify({username: $('#regUsername').val(), 
								email: $('#inputEmail').val(), 
								password: $('#regPassword').val()}),
				success: function(data) {
					console.log(data);
				},
				error: function(err) {
					console.error(err);
				}
			});
		});

		$('#login-form').validator().on('submit', function (e) {
			e.preventDefault();
  		$.ajax({
					url: 'login',
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json;charset=utf-8',
					data: JSON.stringify({username: $('#loginUsername').val(), 
									password: $('#loginPassword').val()}),
					success: function(data) {
						console.log(data.response);
						if(data.response == "success") location.reload(true);
					},
					error: function(err) {
						console.error(err);
					}
				});
	  });
	}
}

$(document).ready(App.init);
