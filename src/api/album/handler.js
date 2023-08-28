class AlbumHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const {id} = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const {id} = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const {id} = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const {cover} = request.payload;

    this._validator.validateAlbumCoverHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const url = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;
    const {id} = request.params;

    await this._service.editAlbumCoverById(url, id);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postLikeByIdHandler(request, h) {
    const {id: albumId} = request.params;

    await this._service.getAlbumById(albumId);

    const {id: userId} = request.auth.credentials;

    await this._service.addLikeById(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteLikesByIdHandler(request, h) {
    const {id: albumId} = request.params;

    const {id: userId} = request.auth.credentials;

    await this._service.deleteLikeById(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Batal menyukai album',
    });

    return response;
  }

  async getLikesByIdHandler(request, h) {
    const {id} = request.params;

    const {likes, cache} = await this._service.getLikesById(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (cache) response.header('X-Data-Source', 'cache');

    return response;
  }
}

module.exports = AlbumHandler;
