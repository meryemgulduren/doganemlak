const BASE_URL = 'http://localhost:5000/api/cities';

async function testApi() {
  try {
    console.log('Testing GET /api/cities...');
    const citiesRes = await fetch(BASE_URL).then(r => r.json());
    if (citiesRes.success && citiesRes.data.length > 0) {
      console.log('✅ getCities successful. Found', citiesRes.data.length, 'cities.');
      const firstCity = citiesRes.data[0].name;
      
      console.log(`Testing GET /api/cities/${firstCity}/districts...`);
      const districtsRes = await fetch(`${BASE_URL}/${encodeURIComponent(firstCity)}/districts`).then(r => r.json());
      if (districtsRes.success && districtsRes.data.length > 0) {
        console.log(`✅ getDistricts successful for ${firstCity}. Found`, districtsRes.data.length, 'districts.');
        const firstDist = districtsRes.data[0].name;

        console.log(`Testing GET /api/cities/${firstCity}/districts/${firstDist}/neighborhoods...`);
        const neighborhoodsRes = await fetch(`${BASE_URL}/${encodeURIComponent(firstCity)}/districts/${encodeURIComponent(firstDist)}/neighborhoods`).then(r => r.json());
        if (neighborhoodsRes.success && neighborhoodsRes.data.length > 0) {
          console.log(`✅ getNeighborhoods successful for ${firstDist}. Found`, neighborhoodsRes.data.length, 'neighborhoods.');
        } else {
          console.log('❌ getNeighborhoods failed or returned empty data.');
        }
      } else {
        console.log('❌ getDistricts failed or returned empty data.');
      }
    } else {
      console.log('❌ getCities failed or returned empty data.');
    }
  } catch (err) {
    console.error('❌ API test failed:', err.message);
    if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
      console.log('ℹ️ Note: Ensure the backend server is running on port 5000.');
    }
  }
}

testApi();
