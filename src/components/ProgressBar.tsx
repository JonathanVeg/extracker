import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

// import { Container } from './styles';

const ProgressBar: React.FC = ({ backgroundColor, onComplete }) => {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pos < 100) setPos(pos + 1);
      else {
        setPos(0);
        if (onComplete) onComplete();
      }
    }, 20);

    return () => clearTimeout(timeout);
  }, [pos]);

  return <View style={{ height: 10, backgroundColor, width: `${pos}%` }} />;
};

export default ProgressBar;
