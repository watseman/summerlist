import './App.css';
import Title from './components/Title';
import React, {useState ,useEffect, useTransition} from 'react'
import { Forms } from './components/Forms'
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'; 


function App() {

  const [challenges, setChallenges] = useState([]);
  const challengesCollectionRef = collection(db, 'list2')
  const userChallengesCollectionRef = collection(db, 'userlistcompleted')

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [user, setUser] = useState({});

  const getChallenges = async () => {
    const data = await getDocs(challengesCollectionRef);
    setChallenges(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
  }

  const toggleComplete = async (id, iscompleted) => {
    const userDoc = doc(db, "list2", id);
    const newFields = {iscompleted: !iscompleted};
    await updateDoc(userDoc, newFields);
    getChallenges();
  }

  const register = async () => {
    try{
      const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      console.log(user)
    }catch(error){
      console.log(error.message);
    }
  };

  const login = async () => {
    try{
      const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log(user)
    }catch(error){
      console.log(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };
  
  useEffect (() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    })
    getChallenges();
  }, []);
  
  return (
    <div >

    {
       // manage signup and login
    }

      <div>
        <h3 className='login'>Register User</h3>
        <input placeholder='Email...' onChange={(event) => {setRegisterEmail(event.target.value)}}/>
        <input placeholder='Password' onChange={(event) => {setRegisterPassword(event.target.value)}}/>

        <button onClick={register}>Create User</button>
      </div>     

      <div>
        <h3 className='login'>Login</h3>
        <input placeholder='Email...' onChange={(event) => {setLoginEmail(event.target.value)}}/>
        <input placeholder='Password' onChange={(event) => {setLoginPassword(event.target.value)}}/>
s
        <button onClick={login}>Login</button>
      </div>   

      <div className='login'>
        <h4> User Logged In: </h4>
        {user?.email}
        <button onClick={logout}>Sign Out</button>
      </div>

      {
       // manage list
      }

      <div className='TodoWrapper'>
        <h1>SUMMER LIST!</h1>
        {challenges.map((challenge) => {
           return <div className='Todo e'> <p id={challenge.id} onClick={() => {toggleComplete(challenge.id, challenge.iscompleted);}} className={`${challenge.iscompleted ? 'completed' : ""}`}> {challenge.challenge} </p> </div>})}
      </div>
    </div>
  );
}

export default App;
