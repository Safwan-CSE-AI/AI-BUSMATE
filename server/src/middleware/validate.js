export function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (validated.body) req.body = validated.body;
      if (validated.query) req.query = validated.query;
      if (validated.params) req.params = validated.params;

      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({
          success: false,
          error: `Validation error: ${errorMessages}`,
          details: err.errors
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid request data'
      });
    }
  };
}
