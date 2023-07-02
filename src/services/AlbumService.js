const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../exceptions/InvariantError')
const { mapDBToModelAlbum } = require('../utils')
const NotFoundError = require('../exceptions/NotFoundError')

class AlbumService {
  constructor() {
    this._pool = new Pool()
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO album VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM album WHERE album.id = $1',
      values: [id]
    }

    const querySong = {
      text: 'SELECT * FROM song WHERE song.album_id = $1',
      values: [id]
    }

    const resultAlbum = await this._pool.query(queryAlbum)
    const resultSong = await this._pool.query(querySong)

    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return {
      ...resultAlbum.rows.map(mapDBToModelAlbum)[0],
      songs: resultSong.rows
    }
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE album SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM album WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = AlbumService