const {SongPayloadSchema, SongFileHeadersSchema} = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const SongValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateSongFileHeaders: (headers) => {
    const validationResult = SongFileHeadersSchema.validate(headers);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongValidator;
