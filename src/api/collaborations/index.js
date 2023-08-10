const routes = require('./routes.js');
const CollaborationsHandler = require('./handler.js');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {collaborationsService, playlistsService, usersService, validator}) => {
    const collaborationHandler = new CollaborationsHandler(collaborationsService, playlistsService, usersService, validator);
    server.route(routes(collaborationHandler));
  },
};
