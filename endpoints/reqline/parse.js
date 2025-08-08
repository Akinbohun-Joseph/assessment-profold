const { createHandler } = require('@app-core/server');
const parseReqlineService = require('../../services/reqline/parse-reqline');

module.exports = createHandler({
  path: '/',
  method: 'post',
  async handler(rc, helpers) {
    try {
      const payload = rc.body;
      const response = await parseReqlineService(payload);

      if (response.error) {
        return {
          status: helpers.http_statuses.HTTP_400_BAD_REQUEST,
          data: response,
        };
      }

      return {
        status: helpers.http_statuses.HTTP_200_OK,
        data: response,
      };
    } catch (error) {
      return {
        status: helpers.http_statuses.HTTP_400_BAD_REQUEST,
        data: {
          error: true,
          message: error.message || 'An unexpected error occurred',
        },
      };
    }
  },
});
