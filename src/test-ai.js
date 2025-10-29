import { livingAI } from './services/livingAI';

/**
 * Test the Living AI with Groq API
 * Run this in browser console: testLivingAI()
 */

export async function testLivingAI() {
  console.log('🤖 Testing Living AI with Groq API...\n');
  console.log('API Key:', livingAI ? 'livingAI loaded ✅' : 'livingAI NOT loaded ❌');
  
  try {
    // Simple test
    console.log('\n📝 Sending test message: "Hello!"');
    const response = await livingAI.generateResponse('Hello!');
    console.log('✅ AI Response:', response);
    
    console.log('\n🎉 SUCCESS! The AI is working!\n');
    console.log('AI State:');
    console.log('- Mood:', livingAI.state.mood, livingAI.getMoodEmoji());
    console.log('- Energy:', livingAI.state.energy + '%');
    console.log('- Relationship:', livingAI.getRelationshipLevel());
    
    return { success: true, response };
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    
    return { success: false, error: error.message };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.testLivingAI = testLivingAI;
  console.log('\n💡 AI Test Ready! Type: testLivingAI()');
}

export default testLivingAI;
