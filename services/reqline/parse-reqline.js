const httpRequest = require('@app-core/http-request');
const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');

// Parse specification for input validation
const parsedSpec = validator.parse(`root{
  reqline is a required string
}`);

function parseReqlineStatement(reqline) {
  // Check if reqline starts with HTTP
  if (!reqline.startsWith('HTTP ')) {
    throwAppError('Missing required HTTP keyword', ERROR_CODE.VALIDATION_ERROR);
  }

  // Split by pipe delimiter
  const parts = reqline.split('|');

  if (parts.length < 2) {
    throwAppError('Missing required URL keyword', ERROR_CODE.VALIDATION_ERROR);
  }

  // Validate spacing around pipes
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && !parts[i].startsWith(' ')) {
      throwAppError('Invalid spacing around pipe delimiter', ERROR_CODE.VALIDATION_ERROR);
    }
    if (i < parts.length - 1 && !parts[i].endsWith(' ')) {
      throwAppError('Invalid spacing around pipe delimiter', ERROR_CODE.VALIDATION_ERROR);
    }
  }

  const result = {
    method: null,
    url: null,
    headers: {},
    query: {},
    body: {},
    fullUrl: null,
  };

  // Parse HTTP method
  const httpPart = parts[0].trim();
  const httpMatch = httpPart.match(/^HTTP\s+(.+)$/);

  if (!httpMatch) {
    throwAppError('Missing required HTTP keyword', ERROR_CODE.VALIDATION_ERROR);
  }

  const method = httpMatch[1].trim();

  if (!['GET', 'POST'].includes(method)) {
    if (method.toLowerCase() === 'get' || method.toLowerCase() === 'post') {
      throwAppError('HTTP method must be uppercase', ERROR_CODE.VALIDATION_ERROR);
    } else {
      throwAppError(
        'Invalid HTTP method. Only GET and POST are supported',
        ERROR_CODE.VALIDATION_ERROR
      );
    }
  }

  // Check for multiple spaces
  if (httpPart.includes('  ')) {
    throwAppError('Multiple spaces found where single space expected', ERROR_CODE.VALIDATION_ERROR);
  }

  result.method = method;

  let urlFound = false;

  // Parse remaining parts
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();

    if (part.startsWith('URL ')) {
      if (urlFound) {
        throwAppError('Duplicate URL keyword found', ERROR_CODE.VALIDATION_ERROR);
      }

      const urlValue = part.substring(4);
      if (!urlValue) {
        throwAppError('Missing URL value', ERROR_CODE.VALIDATION_ERROR);
      }

      // Check for multiple spaces
      if (part.includes('  ')) {
        throwAppError(
          'Multiple spaces found where single space expected',
          ERROR_CODE.VALIDATION_ERROR
        );
      }

      result.url = urlValue;
      urlFound = true;
    } else if (part.startsWith('HEADERS ')) {
      const headersValue = part.substring(8);
      if (!headersValue) {
        throwAppError('Missing HEADERS value', ERROR_CODE.VALIDATION_ERROR);
      }

      // Check for multiple spaces
      if (part.includes('  ')) {
        throwAppError(
          'Multiple spaces found where single space expected',
          ERROR_CODE.VALIDATION_ERROR
        );
      }

      try {
        result.headers = JSON.parse(headersValue);
      } catch (error) {
        throwAppError('Invalid JSON format in HEADERS section', ERROR_CODE.VALIDATION_ERROR);
      }
    } else if (part.startsWith('QUERY ')) {
      const queryValue = part.substring(6);
      if (!queryValue) {
        throwAppError('Missing QUERY value', ERROR_CODE.VALIDATION_ERROR);
      }

      // Check for multiple spaces
      if (part.includes('  ')) {
        throwAppError(
          'Multiple spaces found where single space expected',
          ERROR_CODE.VALIDATION_ERROR
        );
      }

      try {
        result.query = JSON.parse(queryValue);
      } catch (error) {
        throwAppError('Invalid JSON format in QUERY section', ERROR_CODE.VALIDATION_ERROR);
      }
    } else if (part.startsWith('BODY ')) {
      const bodyValue = part.substring(5);
      if (!bodyValue) {
        throwAppError('Missing BODY value', ERROR_CODE.VALIDATION_ERROR);
      }

      // Check for multiple spaces
      if (part.includes('  ')) {
        throwAppError(
          'Multiple spaces found where single space expected',
          ERROR_CODE.VALIDATION_ERROR
        );
      }

      try {
        result.body = JSON.parse(bodyValue);
      } catch (error) {
        throwAppError('Invalid JSON format in BODY section', ERROR_CODE.VALIDATION_ERROR);
      }
    } else {
      // Check if keyword is lowercase
      const lowerPart = part.toLowerCase();
      if (
        lowerPart.startsWith('url ') ||
        lowerPart.startsWith('headers ') ||
        lowerPart.startsWith('query ') ||
        lowerPart.startsWith('body ')
      ) {
        throwAppError('Keywords must be uppercase', ERROR_CODE.VALIDATION_ERROR);
      }

      // Check for missing space after keyword
      if (part.match(/^[A-Z]+[a-zA-Z]/)) {
        throwAppError('Missing space after keyword', ERROR_CODE.VALIDATION_ERROR);
      }

      throwAppError(`Unknown keyword or invalid syntax: ${part}`, ERROR_CODE.VALIDATION_ERROR);
    }
  }

  if (!urlFound) {
    throwAppError('Missing required URL keyword', ERROR_CODE.VALIDATION_ERROR);
  }

  // Build full URL with query parameters
  result.fullUrl = result.url;
  if (Object.keys(result.query).length > 0) {
    const queryString = new URLSearchParams(result.query).toString();
    result.fullUrl += `?${queryString}`;
  }

  return result;
}
async function parseReqlineService(serviceData) {
  try {
    // Validate input
    const data = validator.validate(serviceData, parsedSpec);
    const reqlineStatement = data.reqline.trim();

    // Parse the reqline statement
    const parsed = parseReqlineStatement(reqlineStatement);

    // Execute the HTTP request
    const requestStartTime = Date.now();

    const requestConfig = {
      method: parsed.method.toLowerCase(),
      url: parsed.fullUrl,
      headers: parsed.headers,
    };

    if (parsed.method === 'POST' && Object.keys(parsed.body).length > 0) {
      requestConfig.data = parsed.body;
    }

    const response = await httpRequest(requestConfig);
    const requestEndTime = Date.now();

    return {
      request: {
        query: parsed.query,
        body: parsed.body,
        headers: parsed.headers,
        full_url: parsed.fullUrl,
      },
      response: {
        http_status: response.status,
        duration: requestEndTime - requestStartTime,
        request_start_timestamp: requestStartTime,
        request_stop_timestamp: requestEndTime,
        response_data: response.data,
      },
    };
  } catch (error) {
    if (error.isAppError) {
      return {
        error: true,
        message: error.message,
      };
    }

    return {
      error: true,
      message: error.message || 'An unexpected error occurred while processing the request',
    };
  }
}

module.exports = parseReqlineService;
