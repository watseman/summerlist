import './App.css';
import './modal.css'
import React, {useState ,useEffect, useTransition} from 'react'
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'; 
import logo from './profilepic.png'

function App() {

  const [challenges, setChallenges] = useState([]);
  const challengesCollectionRef = collection(db, 'list2');
  const userChallengesCollectionRef = collection(db, 'completedchallenges');
  const [completedChallenges, setCompletedChallenges] = useState([]);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [modal, setModal] = useState(false);

  const [search, setSearch] = useState("");

  const [user, setUser] = useState({});

  const toggleModal = () => {
    setModal(!modal);
  };

  
  if(modal) {
    document.body.classList.add('active-modal')
  } else {
    document.body.classList.remove('active-modal')
  }

  const getChallenges = async () => {
    const data = await getDocs(challengesCollectionRef);
    setChallenges(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
    setCompleted()
  }

  const setCompleted = async () => {
    console.log("loading")
    const data2 = await getDocs(userChallengesCollectionRef);
    setCompletedChallenges(data2.docs.map((doc) => ({...doc.data(), id: doc.id})))
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
      setCompleted();
      console.log(user)
    }catch(error){
      console.log(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    getChallenges();
  };
  
  useEffect (() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    })
    getChallenges();
  }, []);

  const save = async () => {
    deleteUserCompleted()
    challenges.map( async (challenges) => {
      if(document.getElementById(challenges.id).className === 'completed'){
        await addDoc(userChallengesCollectionRef, {challengeid: challenges.id, userid: user?.uid})
      } 
    })
  }

  const deleteUserCompleted = async (id) => {
    const data = await getDocs(userChallengesCollectionRef);
    completedChallenges.map(async (chalid) =>  {

      if(user?.uid === chalid.userid){
        console.log(chalid.userid)
        await deleteDoc(doc(db,"completedchallenges", chalid.id))
      }
    })
  }

  return (
    <div >

    {
       //
       // manage signup and login
       //
    }
    <header className='header'>
        <div className='login'>
          {user?.email}
          <img className='profilepic' src={logo} onClick={toggleModal}></img>
          <input className='input' placeholder='Search...' onChange={(event) => {setSearch(event.target.value)}}/>
          {modal && (
          <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <h2>AHHHHHHH</h2>
            <p>
              <div className='login'>
                <h3>Register User</h3>
                <input className='input' placeholder='Email...' onChange={(event) => {setRegisterEmail(event.target.value)}}/>
                <input className='input' placeholder='Password' onChange={(event) => {setRegisterPassword(event.target.value)}}/>

                <button className='todo-btn' onClick={register}>Create User</button>
              </div>     

              <div className='login'>
                <h3 >Login</h3>
                <input className='input' placeholder='Email...' onChange={(event) => {setLoginEmail(event.target.value)}}/>
                <input className='input' placeholder='Password' onChange={(event) => {setLoginPassword(event.target.value)}}/>
                <button className='todo-btn' onClick={login}>Login</button>
              </div>   
            </p>
            <button className="close-modal todo-btn" onClick={toggleModal}>
              CLOSE
            </button>
          </div>
        </div>
        )}
        </div>
    </header>
      


      {
       // manage list
      }

      <div className='TodoWrapper'>
        <h1>SUMMER LIST!</h1>
        {challenges.map((challenge) => {
          var chaltext = challenge.challenge
              completedChallenges.map((challenges) => {
                if(challenge?.userid === null || challenge?.userid === ""){
                  console.log("null")
                }
                else if(user?.uid === challenges?.userid){
                  document.getElementById(challenges?.challengeid).className = "completed"
                }
              } )  
            if(search === ""){
              return <div  className='Todo e' onClick={() => document.getElementById(challenge.id).classList.toggle('completed')}> <p id={challenge.id}> {chaltext} </p> </div>
            }else if (chaltext.includes(search)) {
              return <div  className='Todo e' onClick={() => document.getElementById(challenge.id).classList.toggle('completed')}> <p id={challenge.id}> {chaltext} </p> </div>
          }else{
            return <div> <p id={challenge.id}></p></div>;
          }
            })}
      </div>
      <div>
        <button className='savebutton e' onClick={save}> save </button>
      </div>
    </div>
      
  );
}

export default App;