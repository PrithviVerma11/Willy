import React from 'react'
import {View , Text , TouchableOpacity,StyleSheet,TextInput , Image,KeyboardAvoidingView,ToastAndroid,Alert} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner';
import  firebase from 'firebase'
import db from '../config.js'
export default class BookTransactionScreen extends React.Component{
constructor(){
  super();
  this.state = {
    hasCameraPermissions:null,
    scanned:false,
    scannedBookId:'',
    scannedStudentId:'',
    buttonState:'normal',
    transactionMessage:''
  }
}
getCameraPermissions=async(id)=>{
  const {status}=await Permissions.askAsync(Permissions.CAMERA)
  this.setState({
    hasCameraPermissions:status==="granted",
    scanned:false,
    buttonState:id
  })
}
handleBarCodeScanned =async({type,data})=>{
  const {buttonState}=this.state
  if(buttonState==="BookId"){
    this.setState({
      scanned:true,
      scannedBookId:data,
      buttonState:'normal'
    })
  }else if(buttonState==='StudentId'){
    this.setState({
      scanned:true,
      scannedStudentId:data,
      buttonState:'normal'
    })
  }
}
handleTransaction=async()=>{
var transactionType=await this.checkBookEligibility()
console.log(transactionType) 
if(!transactionType){
  alert("This Book Does not exist in Our Database")
this.setState({scannedStudentId:"",scannedBookId:""})
}
else if(transactionType==="Issue"){
  var isStudentEligible=await this.checkStudentEligibilityForIssue()
  if(isStudentEligible){
this.initiateBookIssue()
alert("Book Issued to the student")
  }

}
else if(transactionType==="Return"){
  var isStudentEligible=await this.checkStudentEligibilityForReturn()
  if(isStudentEligible){
this.initiateBookReturn()
alert("Book Returned to the library")
  }

}
}
checkBookEligibility=async()=>{
  const bookRef=await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
  var transactionType = ""
  if(bookRef.docs.length===0){
    transactionType=false
  }else{
bookRef.docs.map((doc)=>{
  var book=doc.data()
  if(book.bookAvailability){
transactionType="Issue"
  }else{
transactionType="Return"
  }
})
  }
  return transactionType
}
checkStudentEligibilityForIssue=async()=>{
  const studentRef=await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
  var isStudentEligible=""
  if(studentRef.docs.length===0){
isStudentEligible=false
 this.setState({scannedBookId:"",scannedStudentId:""})
alert("The Student ID does not exist in the database")
}else{
studentRef.docs.map((doc)=>{
  var student = doc.data()
  if(student.numberOfBooksIssued<2){
isStudentEligible=true
  }else{
isStudentEligible=false
this.setState({scannedStudentId:"",scannedBookId:""})
alert("The student has already issued 2 books")
  }
})
  }
  return isStudentEligible
}
checkStudentEligibilityForReturn=async()=>{
  const transactionRef=await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
  var isStudentEligible=""
  transactionRef.docs.map((doc)=>{
    var lastBookTransaction=doc.data()
    if(lastBookTransaction.studentId===this.state.scannedStudentId){
isStudentEligible=true
alert("Book has been succesfully returned")
    }else{
isStudentEligible=false
this.setState({scannedStudentId:"",scannedBookId:""})
alert("The book was not issued by the student")
    }
  })
}
initiateBookIssue=async()=>{
  db.collection("transactions").add({
    studentId:this.state.scannedStudentId,
    bookId:this.state.scannedBookId,
    date:firebase.firestore.Timestamp.now().toDate(),
    transactionType:"Issue"
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    bookAvailability:false
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
  })
 alert("book Issued")
  this.setState({
    scannedBookId:"",
    scannedStudentId:""
  })
}
initiateBookReturn=async()=>{
  db.collection("transactions").add({
    studentId:this.state.scannedStudentId,
    bookId:this.state.scannedBookId,
    date:firebase.firestore.Timestamp.now().toDate(),
    transactionType:"Return"
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    bookAvailability:true
  })
  db.collection("students").doc(this.state.scannedStudentId).update({
    numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
  })
  alert("Book returned")
  this.setState({
    scannedBookId:"",
    scannedStudentId:""
  })
}
  render(){
    const hasCameraPermissions=this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const buttonState = this.state.buttonState
    if(buttonState!=="normal"&&hasCameraPermissions){
      return(
        <BarCodeScanner onBarCodeScanned = {scanned?undefined:this.handleBarCodeScanned}
        style = {StyleSheet.absoluteFillObject} />
      )
 
    }else if(buttonState==='normal'){
      return(
        <KeyboardAvoidingView style = {styles.container} behavior="padding" enabled>
          <View>
          <Image source={require("../assets/booklogo.jpg")}
          style = {{width:200,height:200}}/>
          <Text style = {{textAlign:'center',fontSize:35}}>Wireless Library</Text>
          </View>
          <View style = {styles.inputView}>
          <TextInput
          style = {styles.inputBox} 
          onChangeText={text=>this.setState({scannedBookId:text})}
          placeholder = "book id"
          value = {this.state.scannedBookId}/>
          <TouchableOpacity onPress ={()=>{this.getCameraPermissions("BookId")}} style = {styles.scanButton}>
        <Text style = {styles.buttonText}>Scan</Text>
          </TouchableOpacity>
          </View>
          
          
          <View style = {styles.inputView}>
          <TextInput
          style = {styles.inputBox} 
          onChangeText={text=>this.setState({scannedStudentId:text})}
          placeholder = "student id"
          value={this.state.scannedStudentId}/>
          <TouchableOpacity onPress={()=>{this.getCameraPermissions("StudentId")}} style = {styles.scanButton}>
        <Text style = {styles.buttonText}>Scan</Text>
          </TouchableOpacity>
          </View>
          <TouchableOpacity style = {styles.submitButton} onPress={async()=>{this.handleTransaction()}}>
            <Text style = {styles.submitButtonText}>
            Submit
            </Text>
          </TouchableOpacity>
          </KeyboardAvoidingView>
       )    
    }
 
}
}
const styles = StyleSheet.create({
    container:{flex:1,justifyContent:'center',alignItems:'center'},
    displayText:{fontSize:15,textDecorationLine:'underline',color:'white'},
    scanButton:{backgroundColor:'#000000',padding:10,margin:10},
    buttonText:{fontSize:15,textAlign:'center',marginTop:10,color:'white'},
    inputView:{flexDirection:"row",margin:20},
    inputBox:{width:200,height:40,borderWidth:1.5,borderRightWidth:0,fontSize:20},
    submitButton:{backgroundColor:"black",width:100,height:50},
    submitButtonText:{padding:10,textAlign:'center',fontSize:20,fontWeight:'bold',color:"white"}
    
})