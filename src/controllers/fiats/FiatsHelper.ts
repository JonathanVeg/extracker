import AsyncStorage from '@react-native-community/async-storage';
import ListFiats from './ListFiats';

export default async function listFiats() {
  try {
    let data = await AsyncStorage.getItem('@extracker:fiats');

    if (!data) data = 'BRL,USD';

    const fiats = data.split(',');

    return fiats.map(fiat => {
      this.label = fiat;

      const options = ListFiats;

      return options.filter(
        it => it.label.toLowerCase() === fiat.toLowerCase(),
      )[0];
    });
  } catch (e) {
    console.error(e);

    return [];
  }
}
