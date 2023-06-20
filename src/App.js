import './App.css';
import './modal.css'
import {React, useState ,useEffect} from 'react'
import { collection, getDocs, doc, addDoc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'; 
import logo from './profilepic.png'
import leaderboardpic from './leaderboard.png'
import logout from './logout.png'
import { eventWrapper } from '@testing-library/user-event/dist/utils';

function App() {

  const [challenges, setChallenges] = useState([]);
  const [userData, setUserData] = useState([]);
  const challengesCollectionRef = collection(db, 'list');
  const userChallengesCollectionRef = collection(db, 'completedchallenges');
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const userCollectionRef = collection(db, 'users');
  const [filter, setFilter] = useState('All');

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [modal, setModal] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState(false);

  const [search, setSearch] = useState("");

  const [user, setUser] = useState({});

  const toggleModal = () => {
    setModal(!modal);
  };

  const toggleLeaderBoard = () => {
    setLeaderboard(!leaderboard);
  };

  
  if(modal) {
    document.body.classList.add('active-modal')
  } else {
    document.body.classList.remove('active-modal')
  }

  if(leaderboard) {
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

  const getUserData = async () => {
    const data = await getDocs(userCollectionRef);
    setUserData(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
  }

  const register = async () => {
    try{
      const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      console.log(user)
      await addDoc(userCollectionRef,{userid: user.user.uid, points: 0, email:registerEmail});
      console.log(user.user.uid)
    }catch(error){
      console.log(error.message);
    }
  };

  const login = async () => {
    try{
      const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      getChallenges();
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
    getUserData();
  }, []);

  const save = async () => {
    console.log("a")
    deleteUserCompleted()
    challenges.map( async (challenges) => {
      if(document.getElementById(challenges.id).className === 'completed'){
        await addDoc(userChallengesCollectionRef, {challengeid: challenges.id, userid: user?.uid})
        console.log("save")
      } 
    })
    countPoints();
  }

  const countPoints = async () => {
    let userScore = 0;
    challenges.map( async (challenges) => {
      if(document.getElementById(challenges.id).className === 'completed'){
        userScore += challenges.points 
      } 
    })
    console.log(userScore)
    
    userData.map(async (users) => {
      if(user?.uid === users.userid){
        let userDoc = doc(db, "users", users.id)
        let newFields = {points: userScore}
        await updateDoc(userDoc, newFields)
        console.log("points updated for " + user.email)
      }
    })
  }

  const getScore = () =>{
    userData.map((users) => {
      if(users.userid === user?.uid){
        setScore(users.points)
      }else{
        console.log("noone logged in")
      }
    })
  }

  const deleteUserCompleted = async (id) => {
    completedChallenges.map(async (chalid) =>  {

      if(user?.uid === chalid.userid){
        console.log(chalid.userid)
        await deleteDoc(doc(db,"completedchallenges", chalid.id))
      }
    })

  }

  const applyCompletedChallenges = () => {
    completedChallenges.map((challenges) => {
      if(user?.uid === challenges?.userid){
        document.getElementById(challenges?.challengeid).className = "completed"
      }
    } )  
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
          <button className='todo-btn' onClick={logout}> Log-out</button>
          <img className='logout' src={logout} onClick={logout}></img>
          {user?.email}
          <img className='profilepic' src={logo} onClick={toggleModal}></img>
          {modal && (
          <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <h5>! Please don't make more than one account !</h5>
            <p>
              <div className='login'>
                <h3>Register User</h3>
                <input className='input' placeholder='Email...' onChange={(event) => {setRegisterEmail(event.target.value)}}/>
                <input className='input' placeholder='Password' onChange={(event) => {setRegisterPassword(event.target.value)}}/>

                <button className='todo-btn' onClick={() => {register(); toggleModal()}}>Create User</button>
              </div>     

              <div className='login'>
                <h3 >Login</h3>
                <input className='input' placeholder='Email...' onChange={(event) => {setLoginEmail(event.target.value)}}/>
                <input className='input' placeholder='Password' onChange={(event) => {setLoginPassword(event.target.value)}}/>
                <button className='todo-btn' onClick={() => {login(); toggleModal()}}>Login</button>
              </div>   
            </p>
            <button className="close-modal todo-btn" onClick={toggleModal}>
              CLOSE
            </button>
          </div>
        </div>
        )}

        <img className='leaderboard' src={leaderboardpic} onClick={toggleLeaderBoard}></img>

        {leaderboard && (
          <div className='modal'>
            <div onClick={toggleLeaderBoard} className='overlay'></div>
            <div className='modal-content'>
              <h5> LEADERBOARD </h5>
              {userData.map((users) => {
                return <p> {users.email} {users.points}</p>
              })}
            </div>
          </div>
        )}
        </div>
    </header>
      


      {
       // manage list
      }

      <div className='TodoWrapper'>
        {challenges.map((challenge) => {
            if(challenge.catagory === "Main-Quest"){
              return <p id={challenge.id} className='Todo-Main' onClick={() => {document.getElementById(challenge.id).classList.toggle('completed');
                                                                          document.getElementById(challenge.id).classList.toggle('Todo-Main');}}> {challenge.challenge} </p>
              
            }else if (challenge.catagory === "Side-Quest") {
              return  <p id={challenge.id} className='Todo-Side' onClick={() => {document.getElementById(challenge.id).classList.toggle('completed');
                                                                            document.getElementById(challenge.id).classList.toggle('Todo-Side');}}>  {challenge.challenge} </p>
          }else if (challenge.catagory === "Drugs"){
            return  <p id={challenge.id} className='Todo-Drugs' onClick={() => {document.getElementById(challenge.id).classList.toggle('completed');
                                                                            document.getElementById(challenge.id).classList.toggle('Todo-Drugs');}}>  {challenge.challenge} </p>
          }else if (challenge.catagory === "Sex"){
            return  <p id={challenge.id} className='Todo-Sex' onClick={() => {document.getElementById(challenge.id).classList.toggle('completed');
                                                                            document.getElementById(challenge.id).classList.toggle('Todo-Sex');}}>  {challenge.challenge} </p>
          }else if (challenge.catagory === "Illegal"){
            return  <p id={challenge.id} className='Todo-Illegal' onClick={() => {document.getElementById(challenge.id).classList.toggle('completed');
                                                                            document.getElementById(challenge.id).classList.toggle('Todo-Illegal');}}>  {challenge.challenge} </p>
          }else if (challenge.catagory === "Cancelled"){
            return  <p id={challenge.id} className='Todo-Cancelled' onClick={() => {document.getElementById(challenge.id).classList.toggle('completed');
                                                                            document.getElementById(challenge.id).classList.toggle('Todo-Cancelled');}}>  {challenge.challenge} </p>
          }
            })}

            {applyCompletedChallenges()}
      </div>
      <div>
        <button className='savebutton e' onClick={save}> save </button>
      </div>
    </div>
      
  );
}

export default App;