// File: test-simple.js
// Better test with detailed error reporting

const axios = require('axios');

const BASE_URL = 'http://localhost:8811';

async function testBasic() {
  try {
    console.log('Testing basic GET request...');
    console.log('Request:', { reqline: 'HTTP GET | URL https://dummyjson.com/quotes/1' });

    const response = await axios.post(BASE_URL, {
      reqline: 'HTTP GET | URL https://dummyjson.com/quotes/1',
    });

    console.log('Success!');
    console.log('Status:', response.data.response.status_https);
    console.log('URL:', response.data.request.full_url);
    console.log('Quote:', response.data.response.response_data.quote);
    console.log('Duration:', `${response.data.response.duration}ms`);
  } catch (error) {
    console.log('Error:', error.message);
    console.log('Full error details:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received');
      console.log('Request config:', error.config);
    } else {
      console.log('Error setting up request:', error.message);
    }
    console.log('Error stack:', error.stack);
  }
}

async function testWithQuery() {
  try {
    console.log('\nTesting GET request with query...');
    console.log('Request:', {
      reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"limit": 1}',
    });

    const response = await axios.post(BASE_URL, {
      reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"limit": 1}',
    });

    console.log('Success!');
    console.log('Full URL:', response.data.request.full_url);
    console.log('Query params:', response.data.request.query);
  } catch (error) {
    console.log('Error:', error.message);
    console.log('Full error details:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received');
      console.log('Request config:', error.config);
    } else {
      console.log('Error setting up request:', error.message);
    }
    console.log('Error stack:', error.stack);
  }
}

async function testError() {
  try {
    console.log('\nTesting invalid syntax (should fail)...');
    console.log('Request:', { reqline: 'HTTP get | URL https://example.com' });

    const response = await axios.post(BASE_URL, {
      reqline: 'HTTP get | URL https://example.com', // lowercase method
    });

    console.log('Should have failed but got success');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Got expected error:', error.response.data.message);
    } else {
      console.log('Unexpected error:', error.message);
      console.log('Full error details:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log('No response received');
        console.log('Request config:', error.config);
      } else {
        console.log('Error setting up request:', error.message);
      }
      console.log('Error stack:', error.stack);
    }
  }
}

async function runTests() {
  console.log('=== ReqLine Parser Test ===\n');

  await testBasic();
  await testWithQuery();
  await testError();

  console.log('\n=== Tests Complete ===');
}

runTests().catch(console.error);
