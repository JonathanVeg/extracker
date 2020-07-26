import React, { useEffect } from 'react';
import OneSignal from 'react-native-onesignal';
import { ONE_SIGNAL_KEY } from 'react-native-dotenv';
import { useToast } from '../hooks/ToastContext';
import StorageUtils from '../utils/StorageUtils';

const OneSignalWrapper: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    OneSignal.init(ONE_SIGNAL_KEY);

    OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.

    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('opened', onOpened);
    OneSignal.addEventListener('ids', onIds);

    showToast('OneSignal Started');
  }, []);

  function onReceived(notification) {
    showToast(`Notification received: ${notification}`);
  }

  function onOpened(openResult) {
    showToast(`Message: ${openResult.notification.payload.body}`);
    showToast(`Data: ${openResult.notification.payload.additionalData}`);
    showToast(`isActive: ${openResult.notification.isAppInFocus}`);
    showToast(`openResult: ${openResult}`);
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
