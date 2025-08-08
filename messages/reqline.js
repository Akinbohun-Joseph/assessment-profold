const ReqlineMessages = {
  MISSING_HTTP_KEYWORD: 'Missing required HTTP keyword',
  MISSING_URL_KEYWORD: 'Missing required URL keyword',
  INVALID_HTTP_METHOD: 'Invalid HTTP method. Only GET and POST are supported',
  INVALID_HTTP_METHOD_CASE: 'HTTP method must be uppercase',
  INVALID_SPACING: 'Invalid spacing around pipe delimiter',
  INVALID_HEADERS_JSON: 'Invalid JSON format in HEADERS section',
  INVALID_QUERY_JSON: 'Invalid JSON format in QUERY section',
  INVALID_BODY_JSON: 'Invalid JSON format in BODY section',
  KEYWORDS_MUST_BE_UPPERCASE: 'Keywords must be uppercase',
  MISSING_SPACE_AFTER_KEYWORD: 'Missing space after keyword',
  MULTIPLE_SPACES: 'Multiple spaces found where single space expected',
};

module.exports = ReqlineMessages;
