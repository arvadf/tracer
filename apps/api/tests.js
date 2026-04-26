const assert = require('assert');

// Simple wrapper for fetch
async function req(method, path, body = null, headers = {}) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`http://localhost:5000${path}`, options);
  
  // parse cookies
  let cookies = '';
  if (res.headers.get('set-cookie')) {
    cookies = res.headers.get('set-cookie').split(';')[0];
  }
  
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { data = text; }
  
  return { status: res.status, data, cookies };
}

async function runTests() {
  console.log("=== STARTING INTEGRATION TESTS ===\n");
  try {
    // 1. Test Search Endpoint
    console.log("1. Public Search Endpoint (/api/v1/alumni/search?query=ahmad)");
    let r = await req('GET', '/api/v1/alumni/search?query=ahmad');
    assert.strictEqual(r.status, 200, "Should return 200");
    assert.deepStrictEqual(r.data.success, true);
    assert(r.data.data.items.length >= 1, "Should find at least 1 alumni");
    console.log("   [PASSED] ✅");

    const ahmadId = r.data.data.items[0].id;

    // 2. Test Check Survey Status
    console.log(`\n2. Check Survey Status (/api/v1/alumni/${ahmadId}/status)`);
    r = await req('GET', `/api/v1/alumni/${ahmadId}/status`);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.data.survey_exists, false, "Survey should not exist yet");
    console.log("   [PASSED] ✅");

    // 3. Test POST Survey
    console.log(`\n3. Create Survey (/api/v1/alumni/${ahmadId}/survey)`);
    const surveyData = {
      tahun_lulus_konfirmasi: 2020,
      status_pekerjaan: "GURU",
      nama_instansi: "SMA N 1 Test",
      nomor_hp: "081234567890",
      lanjut_s2s3: false,
      lanjut_ppg: true,
      tahun_ppg: 2023,
      universitas_ppg: "UMS",
      pesan_saran: "Bagus"
    };
    r = await req('POST', `/api/v1/alumni/${ahmadId}/survey`, surveyData);
    assert.strictEqual(r.status, 201, "Should create survey");
    assert.strictEqual(r.data.success, true);
    console.log("   [PASSED] ✅");

    // 4. Test POST Survey Conflict (Anti-Double Submit)
    console.log(`\n4. Double Submit Survey (/api/v1/alumni/${ahmadId}/survey)`);
    r = await req('POST', `/api/v1/alumni/${ahmadId}/survey`, surveyData);
    assert.strictEqual(r.status, 409, "Should return Conflict 409");
    console.log("   [PASSED] ✅");

    // 5. Test Invalid Data (Zod Validation)
    console.log(`\n5. Zod Validation Check (/api/v1/alumni/${ahmadId}/survey, invalid data)`);
    const invalidSurveyData = {
      tahun_lulus_konfirmasi: 200, // Invalid year
      status_pekerjaan: "INVALID_STATUS",
      nama_instansi: "", // Invalid empty string
      nomor_hp: "123", // Too short
      lanjut_s2s3: false,
      lanjut_ppg: true
      // Missing required universitas_ppg due to lanjut_ppg = true
    };
    r = await req('PUT', `/api/v1/alumni/${ahmadId}/survey`, invalidSurveyData);
    assert.strictEqual(r.status, 422, "Should return Validation Error 422");
    assert.strictEqual(r.data.success, false);
    assert(r.data.errors && r.data.errors.length > 0, "Should contain specific errors array");
    console.log("   [PASSED] ✅");

    // 6. Test Admin Auth
    console.log("\n6. Admin Auth Login (/api/v1/admin/auth/login)");
    r = await req('POST', '/api/v1/admin/auth/login', { username: 'admin', password: 'admin123' });
    assert.strictEqual(r.status, 200, "Login should succeed");
    const sessionCookie = r.cookies;
    assert(sessionCookie, "Session cookie should be returned");
    console.log("   [PASSED] ✅");

    // 7. Test Protected Route (Me)
    console.log("\n7. Fetch Admin Profile (/api/v1/admin/auth/me)");
    r = await req('GET', '/api/v1/admin/auth/me', null, { Cookie: sessionCookie });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.data.username, 'admin');
    console.log("   [PASSED] ✅");

    // 8. Test Protected Route without Session
    console.log("\n8. Block Unauthenticated (/api/v1/admin/auth/me)");
    r = await req('GET', '/api/v1/admin/auth/me');
    assert.strictEqual(r.status, 401, "Should block without session");
    console.log("   [PASSED] ✅");

    // 9. Test Pagination (Admin List Alumni)
    console.log("\n9. List Alumni with Pagination (/api/v1/admin/alumni)");
    r = await req('GET', '/api/v1/admin/alumni?page=1&limit=2', null, { Cookie: sessionCookie });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.data.items.length, 2, "Should limit to 2 items correctly");
    assert.strictEqual(r.data.data.meta.limit, 2);
    console.log("   [PASSED] ✅");

    console.log("\n=== ALL INTEGRATION TESTS PASSED 🎉 ===");
  } catch (err) {
    console.error("\n[TEST FAILED] ❌", err.message);
    if(err.expected !== undefined && err.actual !== undefined) {
      console.error(`Expected: ${err.expected}`);
      console.error(`Actual: ${err.actual}`);
    }
  }
}

// Make sure node fetch is available
if (typeof fetch === 'undefined') {
    console.error('Node 18+ is required for built-in fetch. Please check your Node version.');
} else {
    runTests();
}
