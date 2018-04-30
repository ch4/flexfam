angular.module('starter.services', [])
.factory('UserService', ['$http', function($http) {
  var users = [
    {
      userId: 1,
      name: "Mom",
      phone: '+15412818096'
    },
    {
      userId: 2,
      name: "Brother",
      phone: '+12252509661'
    },
    {
      userId: 3,
      name: "Grandma",
      phone: '+17196495701'
    },
    {
      userId: 4,
      name: "Uncle",
      phone: '+14156466297'
    },
    {
      userId: 5,
      name: "Dad",
      phone: '+15857277105'
    }
  ];

  function addMessage(data){

    $http.post('https://flexfam.herokuapp.com/messages', data, null)
      .then(
        function(response){
          // success callback
          console.log(response)
          return response;
        },
        function(response){
          // failure callback
          console.log(response)
          return response;
        }
      );
  }

  function getUserName(userId){
    var foundUsers = _.filter(users,function(item){return item.userId == userId});
    return foundUsers[0].name;
  }

  function getMessages() {
    return $http({
      method: 'GET',
      url: 'https://flexfam.herokuapp.com/messages'
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      return response.data;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  }

  return {
    users: users,
    addMessage: addMessage,
    getMessages: getMessages,
    getUserName: getUserName,
  };
}])
