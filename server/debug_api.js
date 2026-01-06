const axios = require('axios');

async function checkApi() {
    try {
        const response = await axios.get('http://localhost:4000/api/products');
        console.log('API Response Status:', response.status);
        console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

checkApi();
