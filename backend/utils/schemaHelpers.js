// Applied to every schema so res.json(doc) always returns { id, ...fields }
// instead of Mongo's { _id, __v, ... }.
function applyIdTransform(schema) {
  schema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });
}

module.exports = { applyIdTransform };
