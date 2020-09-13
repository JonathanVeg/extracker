import React, { useEffect } from 'react';
import OneSignal from 'react-native-onesignal';
import { ONE_SIGNAL_KEY2 } from 'react-native-dotenv';
import { useToast } from '../hooks/ToastContext';
import StorageUtils from '../utils/StorageUtils';
import { Alert } from 'react-native';

const OneSignalWrapper: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    OneSignal.init(ONE_SIGNAL_KEY2);

    OneSignal.inFocusDisplaying(2);

    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('opened', onOpened);
    OneSignal.addEventListener('ids', onIds);
  }, []);

  function onReceived(notification) {
    // showToast(`Notification received: ${notification}`);
  }

  function onOpened(openResult) {
    try {
      const { isAppInFocus } = openResult.notification;
      const { coin, market, price } = openResult.notification.payload.additionalData;
    } catch (err) {
      console.error(err);
    }
  }

  function onIds(device) {
    const uid = device.userId;

    StorageUtils.setItem('@extracker:OneSignalUserId', uid);
  }

  function myiOSPromptCallback(permission: boolean) {
    if (!permission) {
      Alert.alert('For using the alerts you need accept notifications. Consider changing in settings.');
    }
  }

  return <></>;
};

export async function readOneSignalUserId() {
  const oneSignalUserIdKey = await StorageUtils.getItem('@extracker:OneSignalUserId');

  return oneSignalUserIdKey;
}

export default OneSignalWrapper;
