import { useState, useCallback, useEffect } from 'react';
import { useStorage } from './useStorage';

export function useCharacter() {
  const [selectedCharacter, setSelectedCharacter] = useStorage('selectedCharacter', null);
  const [characterState, setCharacterState] = useState('idle'); // idle, listening, talking, happy, thinking

  // Migrate old voice names to new ones
  useEffect(() => {
    if (selectedCharacter && selectedCharacter.voice) {
      const voiceMapping = {
        'Kai-PlayAI': 'Mason-PlayAI',
        'Aria-PlayAI': 'Ruby-PlayAI'
      };
      
      if (voiceMapping[selectedCharacter.voice]) {
        console.log('🔄 Migrating voice from', selectedCharacter.voice, 'to', voiceMapping[selectedCharacter.voice]);
        setSelectedCharacter({
          ...selectedCharacter,
          voice: voiceMapping[selectedCharacter.voice]
        });
      }
    }
  }, [selectedCharacter, setSelectedCharacter]);

  const selectCharacter = useCallback((character) => {
    setSelectedCharacter(character);
  }, [setSelectedCharacter]);

  const changeState = useCallback((newState) => {
    setCharacterState(newState);
  }, []);

  const resetCharacter = useCallback(() => {
    setSelectedCharacter(null);
    setCharacterState('idle');
  }, [setSelectedCharacter]);

  return {
    selectedCharacter,
    selectCharacter,
    characterState,
    changeState,
    resetCharacter,
  };
}
