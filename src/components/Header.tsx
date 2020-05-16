import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import styled from 'styled-components/native';
import { isAndroid } from '../utils/platform';

export default function Header(props) {
  const {
    children,
    navigation,
    textColor,
    backgroundColor,
    rightContent,
    middleContent,
    containerStyle = {},
  } = props;
  return (
    <View
      style={[
        {
          // paddingTop: 25,
          paddingBottom: 25,
          position: 'relative',
          flexDirection: 'row',
          backgroundColor,
        },
        containerStyle,
      ]}
    >
      <BackButton activeOpacity={0.8} onPress={() => navigation.goBack()}>
        <Icon
          name="arrow-back"
          size={25}
          color={textColor}
          style={{ marginLeft: 7 }}
        />
      </BackButton>

      <View style={{ maxWidth: '60%', alignSelf: 'center', flex: 1 }}>
        {middleContent || (
          <Text
            fontSize={18}
            color={textColor}
            type="black"
            lines={3}
            textAlign="center"
            style={{ paddingTop: isAndroid() ? getStatusBarHeight() : 0 }}
          >
            {children}
          </Text>
        )}
      </View>
      <View style={{ position: 'absolute', right: 10 }}>{rightContent}</View>
    </View>
  );
}

const BackButton = styled.TouchableOpacity`
  padding-top: ${isAndroid() ? getStatusBarHeight() : 0};
`;
