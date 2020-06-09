import React, { useEffect } from 'react';
import OneSignal from 'react-native-onesignal';
import { ONE_SIGNAL_KEY } from 'react-native-dotenv';
import { useToast } from '../hooks/ToastContext';

const OneSignalWrapper: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    OneSignal.init(ONE_SIGNAL_KEY);

    OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.

    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('opened', onOpened);
    OneSignal.addEventListener('ids', onIds);

    showToast({ text: 'OneSignal Started' });
  }, []);

  function onReceived(notification) {
    showToast({ text: `Notification received: ${notification}` });
  }

  function onOpened(openResult) {
    showToast({ text: `Message: ${openResult.notification.payload.body}` });
    showToast({ text: `Data: ${openResult.notification.payload.additionalData}` });
    showToast({ text: `isActive: ${openResult.notification.isAppInFocus}` });
    showToast({ text: `openResult: ${openResult}` });
  }

  function onIds(device) {
    // Alert.alert(`Device info: ${JSON.stringify(device)}`);
  }

  function myiOSPromptCallback(permission) {
    // Alert.alert(`Permission: ${permission}`);
  }

  return <></>;
};

export default OneSignalWrapper;
