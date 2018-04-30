angular.module('starter.services', [])
.factory('UserService', [function() {
  var users = [
    {
      userId: 1,
      name: "Rosie"
    },
    {
      userId: 2,
      name: "Jace"
    }
  ];

  function addMessage(msg){
    //TODO
    return null;
  }

  function getUserName(userId){
    var foundUsers = _.filter(users,function(item){return item.userId == userId});
    return foundUsers[0].name;
  }

  return {
    users: users,
    addMessage: addMessage,
    getUserName: getUserName,
  };
}])
