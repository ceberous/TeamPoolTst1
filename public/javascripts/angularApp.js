var app = angular.module('redditClone', ['ui.router']);

app.factory('posts', ['$http', function($http){
	var o = {
		posts : []
	};
	o.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, o.posts);
		});
	};
	o.create = function(post) {
		return $http.post('/posts', post).success(function(data) {
			o.posts.push(data);
		});
	};
	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
		.success(function(data) {
			post.upvotes++;
		});
	};
	o.downvote = function(post) {
		return $http.put('/posts/' + post._id + '/downvote')
			.success(function(data) {
				post.upvotes--;
			})
		;
	};

	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};
	o.addComment = function(id, comment) {
		return $http.post('/posts/' + '/comments', comment);
	};
	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + '/upvote')
		.success(function(data) {
			comment.upvotes++;
		});
	};
	return o;
}]);

app.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/views/home.html',
			controller: 'MainCtrl',
			resolve: {
				postPromise: ['posts', function(posts) {
					return posts.getAll();
				}]
			}
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/views/posts.html',
			controller: 'PostsCtrl',
			resolve: {
				post: ['$stateParams', 'posts', function($stateParams, posts) {
					return posts.get($stateParams.id);
				}]
			}
		});
		$urlRouterProvider.otherwise('home');
	}]);

app.controller('MainCtrl', ['$scope', 'posts' ,

	function($scope, posts) {

		$scope.posts = posts.posts;

		$scope.possiblePath = "testing";

		$scope.addPost = function() {
			if($scope.title === '') { return; }
			posts.create({
				title: $scope.title,
				link: $scope.link,
			});
			$scope.title = '';
			$scope.link = '';
		};
		$scope.incrementVote = function(post) {
			posts.upvote(post);
		};
		$scope.decrementVote = function(post) {
			posts.downvote(post);
		};
	}

]);

app.controller('PostsCtrl', ['$scope' , '$stateParams' , 'posts', 'post',
	
	function($scope, $stateParams , posts, post) {
		
		$scope.post = $stateParams.id;

		$scope.posts = posts;

		// var postGuess = $stateParams

		$scope.addComment = function() {
			if($scope.body === '') { return; }
			posts.addComment(post._id, {
				body: $scope.body,
				author: 'user',
			}).success(function(comment) {
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
		};
		$scope.incrementUpvotes = function(comment) {
			posts.upvoteComment(post, comment);
		};
	}

]);