const fs = require('fs');
const path = require('path');

const GEO_DATA_PATH = path.join(__dirname, '../data/turkey-geo.json');

let geoData = null;

function loadGeoData() {
  if (!geoData) {
    const rawData = fs.readFileSync(GEO_DATA_PATH, 'utf8');
    geoData = JSON.parse(rawData);
  }
  return geoData;
}

/**
 * GET /api/cities
 */
async function getCities(req, res) {
  try {
    const data = loadGeoData();
    const cities = data.map(city => ({
      name: city.Province,
      plateNumber: city.PlateNumber,
      coordinates: city.Coordinates,
    }));
    res.json({ success: true, data: cities });
  } catch (err) {
    console.error('getCities error:', err);
    res.status(500).json({ success: false, message: 'Şehirler yüklenirken hata oluştu.' });
  }
}

/**
 * GET /api/cities/:province/districts
 */
async function getDistricts(req, res) {
  try {
    const { province } = req.params;
    const data = loadGeoData();
    const city = data.find(c => c.Province.toLowerCase() === province.toLowerCase());
    
    if (!city) {
      return res.status(404).json({ success: false, message: 'Şehir bulunamadı.' });
    }

    const districts = city.Districts.map(d => ({
      name: d.District,
      coordinates: d.Coordinates,
    }));

    res.json({ success: true, data: districts });
  } catch (err) {
    console.error('getDistricts error:', err);
    res.status(500).json({ success: false, message: 'İlçeler yüklenirken hata oluştu.' });
  }
}

/**
 * GET /api/cities/:province/districts/:district/neighborhoods
 */
async function getNeighborhoods(req, res) {
  try {
    const { province, district } = req.params;
    const data = loadGeoData();
    const city = data.find(c => c.Province.toLowerCase() === province.toLowerCase());
    
    if (!city) {
      return res.status(404).json({ success: false, message: 'Şehir bulunamadı.' });
    }

    const distObj = city.Districts.find(d => d.District.toLowerCase() === district.toLowerCase());
    
    if (!distObj) {
      return res.status(404).json({ success: false, message: 'İlçe bulunamadı.' });
    }

    // Neighbourhoods are grouped by Towns in the JSON, we flatten them
    const neighborhoods = [];
    distObj.Towns.forEach(town => {
      town.Neighbourhoods.forEach(n => {
        if (!neighborhoods.includes(n)) {
          neighborhoods.push(n);
        }
      });
    });

    res.json({ success: true, data: neighborhoods.sort() });
  } catch (err) {
    console.error('getNeighborhoods error:', err);
    res.status(500).json({ success: false, message: 'Mahalleler yüklenirken hata oluştu.' });
  }
}

module.exports = { getCities, getDistricts, getNeighborhoods };
