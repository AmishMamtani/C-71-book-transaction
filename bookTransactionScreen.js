import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import { TextInput } from 'react-native-gesture-handler';
import db from '../config'
import * as firebase from 'firebase'

export default class BookTransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions: null,
            scanned : false,
            scannedData :'',
            buttonState: 'normal',
            scannedBookID : '',
            scannedStudentID :'',
            transactionMessage :''
        }
    }
    getCameraPermissions=async(id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions:status==='granted',
            buttonState:id,
            scanned:false
        })
    }
    handleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==='BookID'){
            this.setState({
                scanned:true,
                scannedBookID:data,
                buttonState:'normal'
            }) 
        }
        else if(buttonState==='StudentID'){
            this.setState({
                scanned:true,
                scannedStudentID:data,
                buttonState:'normal'
            }) 
        }
        
    }
handleTransaction=async()=>{
    console.log('Handle Transaction'+ this.state.scannedBookID)
    var transactionMessage
    try{
    db.collection('Books').doc(this.state.scannedBookID).get().then((doc)=>{
        var book = doc.data()
        console.log(book)
        if(book.bookAvailability){
            this.initiateBookIssue()
            transactionMessage='Book Issued'
        }
        else {
            this.initiateBookReturn();
            transactionMessage = 'Book Returned'
        }
    })
} catch(error){console.log(error)}
    this.setState({
        transactionMessage:transactionMessage
    })
}
initiateBookIssue=async()=>{
    console.log('initiateBookIssue')
    db.collection('Transactions').add({
        studentId:this.state.scannedStudentID,
        bookId: this.state.scannedBookID,
        date: firebase.firestore.Timestamp.now().toDate(),
        transactionType: 'issue'
    })
    db.collection('Books').doc(this.state.scannedBookID).update({
        bookAvailability: false
    })
    db.collection('Students').doc(this.state.scannedStudentID).update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(1)
    })
    Alert.alert('Book Issued')
    this.setState({
        scannedBookID:'',
        scannedStudentID:''
    })
}
initiateBookReturn=async()=>{
    console.log('initiateBookReturn')
    db.collection('Transactions').add({
        studentId:this.state.scannedStudentID,
        bookId: this.state.scannedBookID,
        date: firebase.firestore.Timestamp.now().toDate(),
        transactionType: 'return'
    })
    db.collection('Books').doc(this.state.scannedBookID).update({
        bookAvailability: true
    })
    db.collection('Students').doc(this.state.scannedStudentID).update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1)
    })
    Alert.alert('Book Returned')
    this.setState({
        scannedBookID:'',
        scannedStudentID:''
    })
}

render(){
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const buttonState = this.state.buttonState
    if(buttonState!=='normal'&& hasCameraPermissions){


        return(
            <BarCodeScanner
            onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            />
        )
    
    }
    else if(buttonState==='normal'){
        return(
            <View style={{flex:1,
            justifyContent:'center',
            alignItems:'center'
            }}>
                <View>
                    <Image source={require('../assets/booklogo.jpg')} 
                    style={{width:200,height:200}}/>
                    <Text style={{textAlign:'center', fontSize:30}}>
                        Wireless Library
                    </Text>
                </View>
                <View style={styles.inputView}>
                <TextInput style={styles.inputBox} placeholder='Enter Book ID'
                value={this.state.scannedBookID}
                />
                <TouchableOpacity style={styles.scanButton} onPress={()=>{
                            this.getCameraPermissions('BookID')
                            }}>
                    <Text style={styles.buttonText}>
                        Scan
                    </Text>
                </TouchableOpacity>
                </View>
                <View style={styles.inputView}>
                <TextInput style={styles.inputBox} placeholder='Enter Student ID'
                value={this.state.scannedStudentID}
                />
                <TouchableOpacity style={styles.scanButton} onPress={()=>{

                    this.getCameraPermissions('StudentID')
                    }}>
                    <Text>
                        Scan QR Code
                    </Text>
                </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={
                    async()=>{
                        this.handleTransaction()
                    }
                }>
                    <Text style={styles.submitButtonText}>
                        Submit
                    </Text>
                </TouchableOpacity>

            </View>
        );
    }
    
}
}

const styles = StyleSheet.create
({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
displayText:{ fontSize: 15, textDecorationLine: 'underline' }, 
scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 }, 
buttonText:{ fontSize: 20, },
inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 },
inputView:{ flexDirection:'row', margin:20 },
submitButton:{ backgroundColor: '#FBC02D', width: 100, height:50 }, 
submitButtonText:{ padding: 10, textAlign: 'center', fontSize: 20, 
                    fontWeight:"bold", color: 'white' }
});