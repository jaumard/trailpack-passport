module.exports = [
  {
    method: 'GET',
    path: '/auth/{provider}/callback',
    handler: 'AuthController.callback'
  }, {
    method: 'GET',
    path: '/auth/{provider}/callback',
    handler: 'AuthController.callback'
  }, {
    method: 'GET',
    path: '/auth/{provider}/{action}',
    handler: 'AuthController.callback'
  },
  {
    method: 'GET',
    path: '/auth/{provider}',
    handler: 'AuthController.provider'
  },
  {
    method: 'GET',
    path: '/logout',
    handler: 'AuthController.logout'
  }
]
