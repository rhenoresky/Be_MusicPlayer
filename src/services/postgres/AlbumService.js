const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const {mapDBToModelAlbum} = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({name, year}) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const {rows} = await this._pool.query('SELECT id, name, year, cover FROM albums');
    return rows;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE albums.id = $1',
      values: [id],
    };

    const querySong = {
      text: 'SELECT * FROM songs WHERE songs.album_id = $1',
      values: [id],
    };

    const resultAlbum = await this._pool.query(queryAlbum);
    const resultSong = await this._pool.query(querySong);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return {
      ...resultAlbum.rows.map(mapDBToModelAlbum)[0],
      songs: resultSong.rows,
    };
  }

  async editAlbumById(id, {name, year}) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async editAlbumCoverById(url, id) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [url, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan.');
    }
  }

  async addLikeById(albumId, userId) {
    const query = {
      text: `SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `like-${nanoid(16)}`;
    const queryAdd = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const resultAdd = await this._pool.query(queryAdd);

    if (!resultAdd.rows[0].id) {
      throw new InvariantError('Gagal menambahkan like');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async deleteLikeById(albumId, userId) {
    const query = {
      text: `DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id`,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikesById(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      const likes = parseInt(result);

      return {
        cache: true,
        likes,
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Tidak ada like');
      }

      const likes = parseInt(result.rows[0].count);

      await this._cacheService.set(`likes:${albumId}`, likes);
      return {
        cache: false,
        likes,
      };
    }
  }
}

module.exports = AlbumService;
