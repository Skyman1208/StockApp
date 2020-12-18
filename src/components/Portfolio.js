/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchBar } from 'react-native-elements';

import { firebase } from '../firebase/config';

const Item = ({ item, onPress, style }) => {

  return (
    < TouchableOpacity onPress={onPress} style={[styles.item, style]} >
      <View style={styles.container}>
        <Text style={[styles.title, styles.header]}>{item.sharesName}</Text>
        <Text style={{ color: 'green' }}>{item.sentiValue}</Text>
        <Text>{item.bbStatus}</Text>
      </View>
    </TouchableOpacity >
  );
};

function DetailsScreen({ route }) {
  const { obj } = route.params; //destructuring

  const {
    id,
    bbStatus,
    ema50,
    ema100,
    ema200,
    sharesCurrPrice,
    sentiValue,
    sharesName,
    companyurl,
  } = obj;

  return (
    <View style={styles.detailsView}>
      <Text>BB status: <Text>{bbStatus}</Text></Text>
      <Text>ema 50: <Text>{ema50}</Text></Text>
      <Text>ema 100: <Text>{ema100}</Text></Text>
      <Text>ema 200: <Text>{ema200}</Text></Text>
      <Text>sharesCurrentPrice: <Text>{sharesCurrPrice}</Text></Text>
      <Text>Sentiment Value: <Text>{sentiValue}</Text></Text>
      <Text>Shares Name: <Text>{sharesName}</Text></Text>
      <Text>Company URL: <Text>{companyurl}</Text></Text>
    </View>
  )
}

function Portfolio({ navigation }) {
  //const [stockId, setStockId] = React.useState([]);
  const [search, setSearch] = useState(''); //for searchbar state
  //For handling query to filter the stock listed in portfolio
  const [data, setData] = useState('');
  //array to keep list of portfolio fetch from Firebase
  const [portfolioArr, setPortfolioArr] = React.useState(null);

  useEffect(() => {
    let isMounted = true;
    firebase.database().ref('/users/' + 'CF81IUxlLwMBIhvwpqrvm3ze0Mv2' + '/portfolio').on('value', (snapshot) => {
      if (isMounted) {
        let portfolio = [];
        if (snapshot !== undefined || null) { //because this node has child === null
          snapshot.forEach((child => {
            firebase.database().ref('/processedData/' + child.val()).on('value', (snapshot) => {
              if (snapshot.val() !== null) {
                portfolio.push({
                  id: snapshot.key,
                  bbStatus: snapshot.val().bbStatus,
                  ema50: snapshot.val().ema50,
                  ema100: snapshot.val().ema100,
                  ema200: snapshot.val().ema200,
                  sharesCurrentPrice: snapshot.val().sharesCurrPrice,
                  sentiValue: snapshot.val().sentiValue,
                  sharesName: snapshot.val().sharesName,
                  companyUrl: snapshot.val().companyurl,
                });
              }
            });
          }))
        }
        if (portfolio !== null) { //ensure portfolio not null before set
          setPortfolioArr(portfolio);
        }
      }
    })
    return () => { isMounted = false };
  }, [portfolioArr === null]); //run useEffect as long as portfolioArr is null

  React.useEffect(() => {
    console.log(portfolioArr);
    console.log();
  }, [])

  const handleSearch = (text) => {
    const newData = data.filter(item => {
      const itemData = item.fullname.toLowerCase();
      const textData = text.toLowerCase();
      return itemData.indexOf(textData) > -1;
    });
    setData(newData); //set new data into data
    setSearch(text);
  }

  const renderItem = ({ item }) => {
    return (
      <Item
        item={item}
        style={styles.flatlist}
        onPress={() => {
          //setSelectedId(item.id);
          navigation.navigate('Details', {
            //itemId: item.id,
            obj: item, //objects of clicked element
          });
        }}
      />
    );
  }

  return (
    <View style={styles.view}>
      <SearchBar
        placeholder="Search stock"
        onChangeText={
          //(text) => { setSearch(text) }
          //set arr = DATA obj upon clicking on this component. But think this is
          //not the best idea because fulldata should contains element beforehand.
          //Will refactor later
          //setFullData(DATA);
          (text) => handleSearch(text)
        }
        //To get the query string. Will be use to filter the flatlist locally
        onSubmitEditing={(event) => {
          let query = event.nativeEvent.text;
          //console.log(query);
          //TODO: add query method to call
        }}
        value={search}
        platform="android"
        style={styles.searchBar}
      />
      <View style={styles.stockView}>
        {/*console.log(portfolioArr)*/}
        <FlatList
          //data={DATA}
          data={portfolioArr}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        //extraData={selectedId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    height: 100,
    width: 300,
    marginVertical: 8,
    marginHorizontal: 16,
    //marginRight: 50,
    borderRadius: 10,
  },
  container: {
    flexDirection: "row",
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
  detailsView: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
  },
})

const PortfolioStack = createStackNavigator();

export default function PortfolioStackScreen() {
  return (
    <PortfolioStack.Navigator>
      <PortfolioStack.Screen
        name="Portfolio"
        component={Portfolio}
      />
      <PortfolioStack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({ title: route.params.obj.sharesName })}
      />
    </PortfolioStack.Navigator>
  )
}