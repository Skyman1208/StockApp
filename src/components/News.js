//* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, View, Text, Linking, Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { VictoryPie } from "victory-native";
import { firebase } from '../firebase/config';
import styles from '../styles/News.style';

const Tab = createMaterialTopTabNavigator();

function array(param) {
  var values = new Array();

    values[0] = 0.5 + (param/2);
    values[1] = 0.5 - (param/2);
  
  return values;
}

const Item = ({ item, style }) => {
  return (
    <TouchableOpacity onPress={()=>{ Linking.openURL(item.url)}} style={[styles.item, style]}>
        <View  style={{flexDirection: "column"}}>
          <View style={{flex:1.5}}>
            <Text style={{fontSize:16, fontWeight:'bold'}}>{item.title}</Text>
            <Text style={{paddingTop:6}}>{item.date}</Text>
            <Text>SA Score: {item.compound}</Text>
          </View>
          <View style={{justifyContent:'center', paddingLeft:Dimensions.get('window').width/3.5, paddingTop:10, flex:1}}>
            <VictoryPie
              height={200}
              width={200}
              padding={55}
              innerRadius={20}
              colorScale={["green","red" ]}
              data={array(item.compound)}
              labels={["Good", "Bad"]}
            />
          </View>
        </View>

    </TouchableOpacity >
  );
};

function NewsGlobal({ navigation }) { //Global

  const [selectedId, setSelectedId] = useState(null)
  const [data, setData] = useState('');
  const [NewsArr, setNewsArr] = React.useState(null);

  useEffect(() => {
    let isMounted = true;

    const newsRef = firebase.database().ref('/news/global/list');
    newsRef.on('value', (snapshot) => {
      if (isMounted) {
        let news = [];
        if (snapshot !== null) {
          snapshot.forEach((child) => {
            firebase.database().ref('/news/global/list/' + child.key).on('value', (childSnapshot) => {
              //console.log(childSnapshot.val())
              if (childSnapshot.val() !== null) {
                news.push({
                  id: childSnapshot.key,
                  compound: childSnapshot.val().Compound,
                  date: childSnapshot.val().Date,
                  title: childSnapshot.val().Title,
                  url: childSnapshot.val().Url
                })
              }
            })
          })
        }
        if (news !== null) {
          setNewsArr(news);
        }
      }
    })
    return () => { isMounted = false };
  }, [NewsArr === null]) //run as long as newsArr is null

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
      <View style={styles.stockView}>
        <FlatList
          //data={DATA}
          data={NewsArr}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        //extraData={selectedId}
        />
      </View>
    </View>

  );
}

function NewsLocal({ navigation }) { //Local

  const [selectedId, setSelectedId] = useState(null)
  const [data, setData] = useState('');
  const [NewsArr, setNewsArr] = React.useState(null);

  useEffect(() => {
    let isMounted = true;

    const newsRef = firebase.database().ref('/news/local/list');
    newsRef.on('value', (snapshot) => {
      if (isMounted) {
        let news = [];
        if (snapshot !== null) {
          snapshot.forEach((child) => {
            firebase.database().ref('/news/local/list/' + child.key).on('value', (childSnapshot) => {
              //console.log(childSnapshot.val())
              if (childSnapshot.val() !== null) {
                news.push({
                  id: childSnapshot.key,
                  compound: childSnapshot.val().Compound,
                  date: childSnapshot.val().Date,
                  title: childSnapshot.val().Title,
                  url: childSnapshot.val().Url
                })
              }
            })
          })
        }
        if (news !== null) {
          setNewsArr(news);
        }
      }
    })
    return () => { isMounted = false };
  }, [NewsArr === null]) //run as long as newsArr is null

  const renderItem = ({ item }) => {
    return (
      <Item
        item={item}
        style={styles.flatlist}
      />
    );
  }

  return (
    <View style={styles.view}>
      <View style={styles.stockView}>
        <FlatList
          //data={DATA}
          data={NewsArr}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        //extraData={selectedId}
        />
      </View>
    </View>

  );
}

//Stack for global and local news
//Create stack to keep global news tab history
const GlobalStack = createStackNavigator();

//component and stack for Global news
function Global() {
  return (
    <GlobalStack.Navigator screenOptions={{
      headerShown: false
    }}>
      <GlobalStack.Screen name="Global" component={NewsGlobal} screenOptions={{
        headerShown: false
      }}
      />
    </GlobalStack.Navigator>
  )
}

//Create stack to keep local news tab history
const LocalStack = createStackNavigator();

//component and stack for Global news
function Local() {
  return (
    <LocalStack.Navigator screenOptions={{
      headerShown: false
    }}>
      <LocalStack.Screen name="Local" component={NewsLocal}
      />
    </LocalStack.Navigator>
  )
}

export default function NewsStackScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Global" component={Global}
      />
      <Tab.Screen name="Local" component={Local} />
    </Tab.Navigator>
  );
}