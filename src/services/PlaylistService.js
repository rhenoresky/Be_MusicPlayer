const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT p.id, p.name, u.username FROM playlist AS p INNER JOIN users AS u ON p.owner = u.id WHERE p.owner = $1 
      UNION
      SELECT p.id, p.name, u.username FROM collaborations AS c INNER JOIN playlist AS p ON c.playlist_id = p.id INNER JOIN users AS u ON p.owner = u.id WHERE c.user_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal dihapus. Id tidak ditemukan.');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan kedalam playlist');
    }
  }

  async getSongsFromPlaylistById(playlistId, userId) {
    await this.verifyPlaylistAccess(playlistId, userId);
    const queryGetPlaylist = {
      text: `SELECT p.id, p.name, u.username FROM playlist AS p INNER JOIN users AS u ON p.owner = u.id WHERE p.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(queryGetPlaylist);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const queryGetSongs = {
      text: `SELECT s.id, s.title, s.performer FROM songs AS s INNER JOIN playlist_songs AS p ON p.song_id = s.id WHERE p.playlist_id = $1`,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(queryGetSongs);

    const playlist = playlistResult.rows[0];
    const result = {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: songsResult.rows,
    };

    return result;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak memiliki akses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch (error) {
        throw error;
      }
    }
  }

  async getPlaylistActivitiesById(playlistId) {
    await this.getPlaylistById(playlistId);
    const query = {
      text: `SELECT u.username, s.title, a.action, a.time FROM playlist_song_activities AS a INNER JOIN songs AS s ON a.song_id = s.id INNER JOIN users AS u ON a.user_id = u.id WHERE playlist_id = $1 ORDER BY a.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `playlist-activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: `INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan activitas');
    }
  }
}

module.exports = PlaylistService;
