var Nav = {
	init: function() {
		var vm = new Nav.ViewModel();
		ko.applyBindings(vm, document.getElementById('nav'));
		Nav.jQueryInit();
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
									password: $('#loginPassword').val(),
									client: "web"}),
					success: function(data) {
						if(data.status == "success") location.reload(true);
					},
					error: function(err) {
						console.error(err);
					}
				});
	  });
	}
}

$(document).ready(Nav.init);
