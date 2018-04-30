angular.module('starter.services', [])
.factory('UserService', [function() {
  var users = [
    {
      userId: 1,
      name: "Mom"
    },
    {
      userId: 2,
      name: "Brother"
    },
    {
      userId: 3,
      name: "Grandma"
    },
    {
      userId: 4,
      name: "Uncle"
    },
    {
      userId: 5,
      name: "Dad"
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
