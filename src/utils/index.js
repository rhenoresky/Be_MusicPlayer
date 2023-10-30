/* eslint-disable camelcase */
const mapDBToModelAlbum = ({
  id,
  name,
  year,
  created_at,
  updated_at,
  cover,
}) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
  coverUrl: cover,
});

const mapDBToModelSong = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
  created_at,
  updated_at,
  file,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  file,
  albumId: album_id,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = {mapDBToModelAlbum, mapDBToModelSong};
