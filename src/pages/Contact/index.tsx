import { SLACK_CONTACT_URL } from 'react-native-dotenv';
import IconFA from 'react-native-vector-icons/FontAwesome';
import RNPickerSelect from 'react-native-picker-select';
import React, { useEffect, useState } from 'react';
import { Alert as RNAlert, View, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Row } from '../../components/Generics';
import HamburgerIcon from '../../components/HamburgerIcon';
import { H2 } from '../../components/Hs';
import { Spacer } from '../../components/Spacer';
import Alert from '../../models/Alert';
import MyInput from '../../components/MyInput';
import AlertsAPI from '../../controllers/Alerts';
import { readOneSignalUserId } from '../../controllers/OneSignal';
import { useToast } from '../../hooks/ToastContext';
import CoinSelector from '../../components/CoinSelector';
import Axios from 'axios';

const ContactPage = ({ navigation }) => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const { showToast } = useToast();

  navigation?.setOptions({
    title: 'Contact',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
  });

  const validateEmail = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text);
  };

  const validateFields = () => {
    if (!message) {
      showToast({ text: 'Please fill the message', type: 'error' });

      return false;
    }

    if (!email) {
      showToast({ text: 'Please fill the email', type: 'error' });

      return false;
    }

    if (!validateEmail(email)) {
      showToast({ text: 'Please enter a valid email address', type: 'error' });

      return false;
    }

    return true;
  };

  async function handleSendMessage() {
    try {
      if (sending) return;
      if (!validateFields()) return;

      setSending(true);

      await Axios.post(SLACK_CONTACT_URL, {
        text: `
E-mail: ${email}
Message: ${message}
        `,
      });

      showToast("Thanks for contacting me. I'll answer as soon as possible.");

      setMessage('');
      setEmail('');
    } catch (err) {
      showToast({ text: 'Error while sending message', type: 'error' });

      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={{ paddingHorizontal: 10, flex: 1 }}>
      <H2>Message</H2>
      <MyInput placeholder="Message" value={message} onChangeText={setMessage} />
      <H2>E-mail (for receiving an answer)</H2>
      <MyInput placeholder="E-mail" value={email} onChangeText={setEmail} />

      <TouchableOpacity onPress={handleSendMessage}>
        <H2 center>{sending ? 'Sending...' : 'Send'}</H2>
      </TouchableOpacity>
    </View>
  );
};

export default ContactPage;
