exports.shorthands = undefined;

exports.up = (pgm) => {
  // pgm.sql("INSERT INTO albums VALUES ('old_songs', 'old_songs', 1980)");

  // pgm.sql("UPDATE songs SET album_id = 'old_songs' WHERE album_id IS NULL");

  pgm.addConstraint('songs', 'fk__songs.album_id__albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk__songs.album_id__albums.id');

  // pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_songs'");

  // pgm.sql("DELETE FROM albums WHERE id = 'old_songs'");
};
