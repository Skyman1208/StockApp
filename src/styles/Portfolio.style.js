import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
  item: {
    padding: 18,
    height: 200,
    width: Dimensions.get('window').width - 25,
    marginVertical: 6,
    borderRadius: 15,
  },
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 20,
    fontWeight: "400",
  },
  flatlist: {
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  view: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockView: {
    width: '100%',
    marginBottom: 60
  },
  searchBar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});