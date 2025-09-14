const { UserActivityRepository } = require('./dist/apps/api/src/modules/user-profile/user-activity.repository');
const { UserActivityService } = require('./dist/apps/api/src/modules/user-profile/user-activity.service');
const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'aegisx_db'
  }
});

async function testActivitySystem() {
  try {
    console.log('🔍 Testing Activity Tracking System...');
    
    const repository = new UserActivityRepository(knex);
    const service = new UserActivityService(repository);
    
    // Test basic repository function
    console.log('📊 Testing getUserActivityStats...');
    const stats = await repository.getUserActivityStats('d107f32c-6bfa-4806-a1ba-bfbbbf1aadab');
    console.log('✅ Stats:', stats);
    
    // Test service function  
    console.log('📝 Testing createActivityLog...');
    const activity = await repository.createActivityLog(
      'd107f32c-6bfa-4806-a1ba-bfbbbf1aadab',
      {
        action: 'test',
        description: 'Test activity'
      }
    );
    console.log('✅ Activity created:', activity);
    
    console.log('✅ Activity system working!');
    
  } catch (error) {
    console.error('❌ Error testing activity system:', error);
  } finally {
    await knex.destroy();
  }
}

testActivitySystem();