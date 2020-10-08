import React, { useEffect } from 'react';
import OneSignal from 'react-native-onesignal';
import { ONE_SIGNAL_KEY2 } from 'react-native-dotenv';
import StorageUtils from '../utils/StorageUtils';
import { Alert } from 'react-native';
import Tracker from '../services/Tracker';

const OneSignalWrapper: React.FC = () => {
  useEffect(() => {
    OneSignal.init(ONE_SIGNAL_KEY2);

    OneSignal.inFocusDisplaying(2);

    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('opened', onOpened);
    OneSignal.addEventListener('ids', onIds);
  }, []);

  function onReceived() {
    // showToast(`Notification received: ${notification}`);
  }

  function onOpened(openResult) {
    try {
    } catch (err) {
      console.error(err);
    }
  }

  function onIds(device) {
    const uid = device.userId;

    async function run() {
      await StorageUtils.setItem('@extracker:OneSignalUserId', uid);

      await Tracker.identifyUser();
    }

    run();
  }

  function myiOSPromptCallback(permission: boolean) {
    if (!permission) Alert.alert('For using the alerts you need accept notifications. Consider changing in settings.');
  }

  return <></>;
};

export async function readOneSignalUserId() {
  const oneSignalUserIdKey = await StorageUtils.getItem('@extracker:OneSignalUserId');

  return oneSignalUserIdKey;
}

export default OneSignalWrapper;
