class SongHandler {
  constructor(service, validator, storageServiceSong) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageServiceSong;
  };

  async postSongHandler(request, h) {
    const {song} = request.payload;

    this._validator.validateSongPayload(request.payload);

    this._validator.validateSongFileHeaders(song.hapi.header);

    const songId = await this._service.addSong(request.payload);


    const filename = await this._storageService.writeFile(song, song.hapi);

    const url = `http://${process.env.HOST}:${process.env.PORT}/songs/file/${filename}`;

    await this._service.editFileSong(url, songId);

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const {title, performer} = request.query;
    const songs = await this._service.getSongs(title, performer);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const {id} = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const {id} = request.params;

    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request, h) {
    const {id} = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongHandler;
