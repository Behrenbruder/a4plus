// Test script to verify PV quotes sync between Supabase and Prisma
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPvQuotesSync() {
  try {
    console.log('🔍 Testing PV Quotes sync...');
    
    // Check if PvQuote table exists and can be queried
    const quotes = await prisma.pvQuote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`✅ Found ${quotes.length} PV quotes in local database:`);
    
    quotes.forEach((quote, index) => {
      console.log(`\n${index + 1}. ${quote.firstName} ${quote.lastName}`);
      console.log(`   Email: ${quote.email}`);
      console.log(`   Supabase ID: ${quote.supabaseId}`);
      console.log(`   Status: ${quote.status}`);
      console.log(`   Created: ${quote.createdAt}`);
      if (quote.roofType) console.log(`   Roof Type: ${quote.roofType}`);
      if (quote.batteryKwh) console.log(`   Battery: ${quote.batteryKwh} kWh`);
    });
    
    if (quotes.length === 0) {
      console.log('\n⚠️  No PV quotes found in local database.');
      console.log('   Try submitting a quote through the website to test the sync.');
    }
    
  } catch (error) {
    console.error('❌ Error testing PV quotes sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPvQuotesSync();
