exports.up = (pgm) => {
  pgm.addColumn('songs', {
    file: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('songs', 'file');
};
