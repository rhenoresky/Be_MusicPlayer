const Joi = require('joi');
const currentYear = new Date().getFullYear();

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
  song: Joi.allow(),
});

const SongFileHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('audio/mpeg', 'audio/vorbis').required(),
}).unknown();

module.exports = {SongPayloadSchema, SongFileHeadersSchema};
