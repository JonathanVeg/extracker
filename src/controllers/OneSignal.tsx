import React, { useEffect } from 'react';
import OneSignal from 'react-native-onesignal';
import { ONE_SIGNAL_KEY2 } from 'react-native-dotenv';
import { useToast } from '../hooks/ToastContext';
import StorageUtils from '../utils/StorageUtils';

const OneSignalWrapper: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    OneSignal.init(ONE_SIGNAL_KEY2);

    OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.

    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('opened', onOpened);
    OneSignal.addEventListener('ids', onIds);
  }, []);

  function onReceived(notification) {
    showToast(`Notification received: ${notification}`);
  }

  function onOpened(openResult) {
    try {
      const { isAppInFocus } = openResult.notification;
      const { coin, market, price } = openResult.notification.payload.additionalData;
    } catch (err) {
      console.log(err);
    }
  }

  function onIds(device) {
    const uid = device.userId;

    StorageUtils.setItem('@extracker:OneSignalUserId', uid);
  }

  function myiOSPromptCallback(permission) {
    // Alert.alert(`Permission: ${permission}`);
  }

  return <></>;
};

export async function readOneSignalUserId() {
  const oneSignalUserIdKey = await StorageUtils.getItem('@extracker:OneSignalUserId');

  return oneSignalUserIdKey;
}

export default OneSignalWrapper;
