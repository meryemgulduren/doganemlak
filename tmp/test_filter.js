
// Mocking req.query and testing filter construction logic from listingController.js

function testFilter(query) {
    const filter = { status: 'ACTIVE' };

    // Basic fields
    const directFields = ['category', 'listing_type', 'subType', 'property_type', 'currency', 'using_status', 'property_condition', 'zoning_status', 'title_deed_status', 'heating_type', 'building_age', 'room_count'];
    directFields.forEach(field => {
      if (query[field]) {
        const value = query[field];
        if (typeof value === 'string' && value.includes(',')) {
          filter[field] = { $in: value.split(',').map(v => v.trim()) };
        } else {
          filter[field] = value;
        }
      }
    });

    // Range fields
    const rangeFields = [
      { key: 'price', min: 'minPrice', max: 'maxPrice' },
      { key: 'm2_brut', min: 'min_m2_brut', max: 'max_m2_brut' },
      { key: 'm2_net', min: 'min_m2_net', max: 'max_m2_net' },
      { key: 'open_area_m2', min: 'min_open_area_m2', max: 'max_open_area_m2' },
      { key: 'floor_number', min: 'min_floor', max: 'max_floor' },
      { key: 'total_floors', min: 'min_total_floors', max: 'max_total_floors' },
      { key: 'bathroom_count', min: 'min_bathrooms', max: 'max_bathrooms' },
      { key: 'dues', min: 'min_dues', max: 'max_dues' },
    ];

    rangeFields.forEach(({ key, min, max }) => {
      if (query[min] || query[max]) {
        filter[key] = {};
        if (query[min]) filter[key].$gte = Number(query[min]);
        if (query[max]) filter[key].$lte = Number(query[max]);
      }
    });

    // Boolean fields
    const booleanFields = ['balcony', 'furnished', 'in_site', 'credit_eligible'];
    booleanFields.forEach(field => {
      if (query[field] !== undefined) {
        filter[field] = query[field] === 'true';
      }
    });

    // Facade (Array field)
    if (query.facade) {
      const facades = query.facade.split(',').map(v => v.trim());
      filter.facade = { $in: facades };
    }

    // Search
    if (query.search) {
      const searchTerm = query.search.trim();
      const numSearch = Number(searchTerm);
      if (!isNaN(numSearch) && searchTerm !== "") {
        filter.listing_no = numSearch;
      } else {
        filter.title = { $regex: searchTerm, $options: 'i' };
      }
    }

    // Location
    if (query.city && !query.district && !query.neighborhood) {
       filter.$text = { $search: query.city.trim() };
    } else {
      if (query.city) filter['location.city'] = query.city;
      if (query.district) filter['location.district'] = query.district;
      if (query.neighborhood) filter['location.neighborhood'] = query.neighborhood;
    }

    return filter;
}

// Case 1: Complex filter
const q1 = {
    minPrice: "1000000",
    maxPrice: "5000000",
    room_count: "2+1,3+1",
    city: "Istanbul",
    district: "Kadikoy",
    balcony: "true",
    min_m2_brut: "100"
};
console.log("Q1 Filter:", JSON.stringify(testFilter(q1), null, 2));

// Case 2: Multi-select string
const q2 = {
    heating_type: "Kombi,Merkezi",
    facade: "Doğu,Batı"
};
console.log("Q2 Filter:", JSON.stringify(testFilter(q2), null, 2));

// Case 3: Search listing no
const q3 = {
    search: "12345"
};
console.log("Q3 Filter:", JSON.stringify(testFilter(q3), null, 2));
