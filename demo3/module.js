function ModuleConfig($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             templateUrl: 'templates/layout.html'
           })
    .state('home', {
             url: '/home',
             parent: 'layout',
             templateUrl: 'templates/home.html'
           })
    .state('todolists', {
             abstract: true,
             url: '/todolists',
             parent: 'layout',
             template: '<div ui-view></div>'
           })
    .state('todolists.list', {
             url: '/list',
             templateUrl: 'templates/todolists_lists.html',
             controller: 'TodoListsController as ctrl',
             controllerAs: 'ctrl',
             resolve: {
               queries: function (BoundQuery, ngDexie) {
                 var _this = this;
                 _this.todolists = [];

                 BoundQuery(
                   'todolists',
                   function () {
                     ngDexie.list('todolists')
                       .then(function (data) {
                               _this.todolists = data;
                             });
                   });

                 return _this;

               }
             }
           })
    .state('todolists.todolist', {
             url: '/{todolistId}',
             templateUrl: 'templates/todolist.html',
             controller: 'TodoListController as ctrl',
             controllerAs: 'ctrl',
             resolve: {
               queries: function (BoundQuery, ngDexie, $stateParams) {
                 var _this = this;
                 _this.todolist = {};
                 todolistId = $stateParams.todolistId;

                 console.log('list id is', todolistId);
                 BoundQuery(
                   'todolists',
                   function () {
                     ngDexie.get('todolists', todolistId)
                       .then(function (data) {
                               _this.todolist = data;
                             });
                   });

                 return _this;

               }
             }
           });


  $urlRouterProvider.otherwise("/home");
}

function ModuleRun($rootScope, $log, ngDexie) {
  var configuration = function (db) {
    db.version(1).stores(
      {todolists: '_id'},
      {todo: '_id'}
    );
    db.on('error', function (err) {
      $log.error("db error", err);
    });
  };

  ngDexie.init('ToDoListApp', configuration, false)
    .then(function () {
            $log.debug('Opened ToDoList Database');
          });

  $rootScope
    .$on(
    '$stateChangeError',
    function (event, toState, toParams, fromState, fromParams, error) {
      console.debug('stateChangeError', error);
    });

}

angular.module('app', ['ui.router', 'idb.utils'])
  .config(ModuleConfig)
  .run(ModuleRun);