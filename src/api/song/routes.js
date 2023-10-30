const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: (request, h) => handler.postSongHandler(request, h),
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 15120000,
      },
    },
  },
  {
    method: 'GET',
    path: '/songs/file/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file/songs'),
      },
    },
  },
  {
    method: 'GET',
    path: '/songs',
    handler: (request, h) => handler.getSongsHandler(request, h),
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: (request, h) => handler.getSongByIdHandler(request, h),
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: (request, h) => handler.putSongByIdHandler(request, h),
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: (request, h) => handler.deleteSongByIdHandler(request, h),
  },
];

module.exports = routes;
