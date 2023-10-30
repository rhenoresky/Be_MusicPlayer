const SongHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'song',
  version: '1.0.0',
  register: async (server, {service, validator, storageServiceSong}) => {
    const songHandler = new SongHandler(service, validator, storageServiceSong);
    server.route(routes(songHandler));
  },
};
