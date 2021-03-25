import React from 'react'
import {View , Text} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import db from '../config.js'
export default class SearchScreen extends React.Component{
constructor(props){
  super(props);
  this.state={allTransactions:[]}
}
componentDidMount=async()=>{
  const query = await db.collection("transactions").get()
  query.docs.map((doc)=>{
    this.setState({
      allTransactions:[...this.state.allTransactions,doc.data()]
    })
  })
}
  render(){
return(
 <ScrollView>
   {this.state.allTransactions.map((transaction,index)=>{
     return(
       <View key={index} style={{borderBottomWidth:2}}>
         <Text>{transaction.transactionType}</Text>
         <Text>{transaction.studentId}</Text>
         <Text>{transaction.bookId}</Text>
         {/* <Text>{transaction.date.toDate()}</Text> */}
       </View>
     )
   })}
</ScrollView>
)    
}
}