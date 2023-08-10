const InvariantError = require('../../exceptions/InvariantError');
const CollaborationsPayloadScheme = require('./schema.js');

module.exports = {
  validateCollaborationPayload: (payload) => {
    const validationResult = CollaborationsPayloadScheme.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
