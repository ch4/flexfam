angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', ['$scope', '$ionicModal', '$timeout', 'UserService', function($scope, $ionicModal, $timeout, UserService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  // $scope.familyMembers = [
  //   {id: 1, fname:"Becky"},
  //   {id: 2, fname:"Maurice"},
  //   {id: 3, fname:"April"},
  //   {id: 4, fname:"Jack"},
  // ];

  $scope.familyMembers = UserService.users;
  $scope.UserService = UserService;
}])

.controller('HomeCtrl', ['$scope', '$stateParams', '$state', function($scope, $stateParams, $state) {
  $scope.filterByFamilyMemberId = null;

  $scope.setFilterByFamilyMemberId = function(id) {
    $scope.filterByFamilyMemberId = id;
    console.log('selected member id', $scope.filterByFamilyMemberId);
  };

  $scope.onEventSelected = function (event) {
    console.log('selected event', event);
    $state.go('app.eventdetails', {event: event});
  };

  function createRandomEvents() {
    var events = [];
    for (var i = 0; i < 50; i += 1) {
      var date = new Date();
      var eventType = Math.floor(Math.random() * 2);
      var startDay = Math.floor(Math.random() * 90) - 45;
      var endDay = Math.floor(Math.random() * 2) + startDay;
      var startTime;
      var endTime;
      if (eventType === 0) {
        startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
        if (endDay === startDay) {
          endDay += 1;
        }
        endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + endDay));
        events.push({
          id: i,
          title: 'All Day - ' + i,
          startTime: startTime,
          endTime: endTime,
          allDay: true,
          participants: [1,2],
        });
      } else {
        var startMinute = Math.floor(Math.random() * 24 * 60);
        var endMinute = Math.floor(Math.random() * 180) + startMinute;
        startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + startDay, 0, date.getMinutes() + startMinute);
        endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + endDay, 0, date.getMinutes() + endMinute);
        events.push({
          id: i,
          title: 'Event - ' + i,
          startTime: startTime,
          endTime: endTime,
          allDay: false,
          participants: [3,4],
        });
      }
    }
    return events;
  }

  $scope.calendar = {};
  $scope.calendar.eventSource = createRandomEvents();

}])

.controller('ChatCtrl', ['$scope', '$stateParams', '$state', 'UserService', '$ionicScrollDelegate', function($scope, $stateParams, $state, UserService, $ionicScrollDelegate) {
  $scope.UserService = UserService;
  $scope.data = {
    message: '',

  };


  UserService.getMessages().then(function(res){
    $scope.chatData = res;
  });



  setInterval(myMethod, 1000);

  function myMethod( )
  {
    UserService.getMessages().then(function(res){
      $scope.chatData = res;
    });
    $scope.$apply();
  }

  $scope.convertUtcToLocal = function (timeStr) {
    return new Date(timeStr).toString();
    //return prettyDate(timeStr);
  };

  $scope.sendMessage = function() {
    var d = new Date();
    // d = d.toLocaleTimeString().replace(/:\d+ /, ' ');

    var chatData = angular.copy($scope.chatData[0]);

    chatData.messages.push({
      userId: 5,
      text: $scope.data.message,
      time: d
    });

    UserService.addMessage(chatData);

    delete $scope.data.message;
    $ionicScrollDelegate.scrollBottom(true);

  };

}])

.controller('EventDetailsCtrl', function($scope, $stateParams) {
  $scope.eventObj = $stateParams.event;
  console.log('$scope.event', $scope.event);


})

.controller('SettingsCtrl', function($scope, $stateParams) {

});
