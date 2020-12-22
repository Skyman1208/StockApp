/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, View, Text, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchBar } from 'react-native-elements';
import filter from 'lodash.filter'; //for filtering searchbar
// Line chart
import { AreaChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'


import { firebase } from '../firebase/config';
import styles from '../styles/Watchlist.style';
import DetailsScreen from './WatchlistDetailsScreen';


const onPress = () => {
  Alert.alert(
    'ADD TO PROTFOLIO',
    'Are you sure?', // <- this part is optional, you can pass an empty string
    [
      { text: 'Yes', onPress: () => console.log('YES Pressed') }, // insert ADD TO PORTFOLIO function
      { text: 'No', onPress: () => console.log('NO Pressed') },
    ],
    { cancelable: false },
  );
};

const Item = ({ item, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.item, style]} >
      <View style={styles.container}>
        <View style={{ flex: 15 }}>
          <Text style={{ textAlign: 'center', fontSize: 17, fontWeight: "bold", paddingTop: 11, paddingRight: 15 }} >{item.sharesName}</Text>
        </View>
        <View style={{ flex: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold", paddingLeft: 6, paddingTop: 11, color: 'green' }}>{"RM " + item.sharesCurrentPrice}</Text>
        </View>
        <View style={{ flex: 10, paddingRight: 15 }}>
          <AreaChart
            style={{ height: 40, width: 90 }}
            data={[2, 4, 5, 6, 7, 8, 15, 7, 5, 4, 4, 5, 7, 6, 5, 4]}
            // contentInset={{ top: 30, bottom: 30 }}
            curve={shape.curveNatural}
            svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
          >
          </AreaChart>
        </View>
      </View>
    </TouchableOpacity >
  );
};

function Watchlist({ navigation }) {
  const [selectedId, setSelectedId] = useState([]); //for storing selected id on clicked flatlist
  const [search, setSearch] = useState(""); //for searchbar state
  const [data, setData] = useState([]); //empty array to store list of items during query
  const [watchlistArr, setWatchlistArr] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const watchlistRef = firebase.database().ref('/watchlist/shares');

    watchlistRef.on('value', (snapshot) => {
      if (isMounted) {
        let watchlist = [];
        if (snapshot !== null) {
          snapshot.forEach((child) => {
            firebase.database().ref('/watchlist/shares/' + child.key).on('value', (childSnapshot) => {
              //console.log(childSnapshot.val())
              if (childSnapshot.val() !== null) {
                watchlist.push({
                  id: childSnapshot.key,
                  sharesCurrentPrice: childSnapshot.val().sharesCurrPrice,
                  sharesName: childSnapshot.val().sharesName
                })
              }
            })
          })
        }
        if (watchlist !== null) {
          setWatchlistArr(watchlist);
        }
      }
    })
    return () => { isMounted = false };
  }, [watchlistArr === null]) //run as long as watchlistArr is null


  //For handling query to filter the stock listed in portfolio
  const handleSearch = (text) => {
    const formattedQUery = text.toLowerCase();
    const filteredData = filter(watchlistArr, data => {
      return contains(data, formattedQUery);
    })
    setData(newData); //set new data into data
    setSearch(text);
  }

  const contains = ({ sharesName }, query) => {
    if (sharesName.includes(query)) {
      return true
    }
  }

  const renderItem = ({ item }) => {
    return (
      <Item
        item={item}
        style={styles.flatlist}
        onPress={() => {
          setSelectedId(item.id);
          navigation.navigate('Details', {
            itemId: item.id,
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
        <FlatList
          //data={DATA}
          data={watchlistArr}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          extraData={selectedId}
        />
      </View>
    </View>
  );
}
const WatchlistStack = createStackNavigator();

export default function WatchlistStackScreen() {
  return (
    <WatchlistStack.Navigator>
      <WatchlistStack.Screen name="Watchlist" component={Watchlist} />
      <WatchlistStack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({ title: route.params.obj.fullname })}
      />
    </WatchlistStack.Navigator>
  )
}
