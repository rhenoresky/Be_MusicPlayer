const routes = require('./routes.js');
const PlaylistsHandler = require('./handler.js');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {playlistsService, songsService, validator}) => {
    const playlistHandler = new PlaylistsHandler(playlistsService, songsService, validator);
    server.route(routes(playlistHandler));
  },
};
