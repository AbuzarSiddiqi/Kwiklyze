// Script to fetch available voices from ElevenLabs API

// Replace with your actual ElevenLabs API key
const ELEVENLABS_API_KEY = 'your_elevenlabs_api_key_here';

async function getVoices() {
  try {
    console.log('🔍 Fetching available voices from ElevenLabs...\n');
    
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      console.error('❌ Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('✅ Available voices:\n');
    console.log('='.repeat(80));
    
    data.voices.forEach(voice => {
      console.log(`\nName: ${voice.name}`);
      console.log(`Voice ID: ${voice.voice_id}`);
      console.log(`Category: ${voice.category || 'N/A'}`);
      console.log(`Labels: ${JSON.stringify(voice.labels)}`);
      console.log(`Description: ${voice.description || 'N/A'}`);
      console.log('-'.repeat(80));
    });

    console.log(`\n\n📊 Total voices available: ${data.voices.length}`);
    
    // Filter Hindi voices
    const hindiVoices = data.voices.filter(v => 
      v.labels && (
        v.labels.accent?.toLowerCase().includes('hindi') ||
        v.labels.language?.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('hindi')
      )
    );
    
    if (hindiVoices.length > 0) {
      console.log('\n\n🇮🇳 Hindi-specific voices found:');
      hindiVoices.forEach(voice => {
        console.log(`\n  • ${voice.name} (ID: ${voice.voice_id})`);
        console.log(`    Labels: ${JSON.stringify(voice.labels)}`);
      });
    } else {
      console.log('\n\n⚠️ No Hindi-specific voices found.');
      console.log('💡 Tip: Use multilingual voices like Rachel or Josh with the eleven_multilingual_v2 model');
    }

  } catch (error) {
    console.error('❌ Error fetching voices:', error.message);
  }
}

getVoices();
