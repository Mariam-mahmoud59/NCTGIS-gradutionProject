import { testPostgresConnection, testAuthService, testFunctionService } from './services/neon.js';

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('   NCTGIS NEON SERVICES END-TO-END VERIFICATION    ');
  console.log('====================================================\n');

  let allPassed = true;

  // 1. Test Neon Postgres
  console.log('1. Testing Neon Postgres Database...');
  try {
    const pg = await testPostgresConnection();
    console.log('   ✅ Postgres connection SUCCESS!');
    console.log('   Timestamp:', pg.current_time);
    console.log('   Version  :', String(pg.pg_version).split(',')[0]);
  } catch (err: any) {
    console.error('   ❌ Postgres test FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // 2. Test Neon Auth
  console.log('2. Testing Neon Auth Service...');
  try {
    const auth = await testAuthService();
    console.log('   ✅ Neon Auth connection SUCCESS!');
    console.log('   Base URL  :', auth.authBaseUrl);
    console.log('   JWKS URL  :', auth.jwksUrl);
    console.log('   JWKS Status:', auth.jwksStatus, 'OK');
  } catch (err: any) {
    console.error('   ❌ Neon Auth test FAILED:', err.message);
    allPassed = false;
  }
  console.log('');

  // 3. Test Neon Functions
  console.log('3. Testing Neon Functions (hello)...');
  try {
    const fn = await testFunctionService();
    console.log('   ✅ Neon Functions execution SUCCESS!');
    console.log('   URL         :', fn.functionUrl);
    console.log('   HTTP Status :', fn.status);
    console.log('   Response    :', JSON.stringify(fn.responseBody));
  } catch (err: any) {
    console.error('   ❌ Neon Functions test FAILED:', err.message);
    allPassed = false;
  }
  console.log('\n====================================================');
  if (allPassed) {
    console.log('   ALL 3 NEON SERVICES PROVEN OPERATIONAL END-TO-END! ');
  } else {
    console.log('   SOME SERVICES FAILED. SEE DETAILS ABOVE.');
    process.exit(1);
  }
  console.log('====================================================');
}

runEndToEndTests().catch((err) => {
  console.error('Fatal error running verification:', err);
  process.exit(1);
});
