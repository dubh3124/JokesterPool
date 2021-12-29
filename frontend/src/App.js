import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/JokesterPool.json';
import Rating from "react-rating";
import SyncLoader from "react-spinners/SyncLoader";
import {FacebookShareButton, FacebookIcon} from "react-share";
import AddJoke from "./AddJoke";


export default function App() {
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = React.useState("");
  const contractAddress = process.env.REACT_APP_JOKESTER_CONTRACT;
  const contractABI = abi.abi;
  var ratejoke =  React.useRef()
  var jokeIdli = React.useRef(null)
  var [jokes, setJokes] = React.useState([]);
  let [loading, setLoading] = React.useState(false);
  let [mined, setMined] = React.useState(false);

  function calculateAverage(array) {
    var total = 0;
    var count = 0;

    array.forEach(function(item, index) {
        total += item.toNumber();
        count++;
    });
    let result = total / count
    return result.toFixed(2);
  };

  function useForceUpdate(){
    const [value, setValue] = React.useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
  };

  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const getJokes = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const jokesterContract = new ethers.Contract(contractAddress, contractABI, signer);

        let jokeobj;
        let jokeobjs = [];
        let jokeids = await jokesterContract.getJokeIDs();
        console.log("Retrieved total jokes count...", jokeids.length);
        console.log(jokeids)

        if (jokeids.length > 0) {

          for ( let id of jokeids) {
            jokeobj = await getJoke(id)
            jokeobjs.push(jokeobj)
          }
          setJokes(jokes => [
              ...jokes,
              ...jokeobjs
            ]
          )
        } else {
          console.log("No Jokes Yet!")
        }

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getJoke = async (jokeid) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const jokesterContract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log(jokeid)
        let joke = await jokesterContract.getJoke(jokeid);
        return joke
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const rateJoke = async (id, rating) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const jokesterContract = new ethers.Contract(contractAddress, contractABI, signer);
        /*
        * Execute the actual wave from your smart contract
        */
        console.log(id, rating)
        const addJokeTxn = await jokesterContract.rateJoke(id, rating);
        console.log("Setting Rating: " + rating + "for " + id)
        console.log("Mining...", addJokeTxn.hash);
        setLoading(true);

        await addJokeTxn.wait();
        setLoading(false);
        console.log("Mined -- ", addJokeTxn.hash);
        setMined(true);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onNewJoke = async(from, timestamp, joke_id) => {
    let jokeobj;
    let jokeobjs = [];
    console.log('NewJoke', from, timestamp, joke_id);
    jokeobj = await getJoke(joke_id)
    console.log("jojke", jokeobj)
    jokeobjs.push(jokeobj)
    console.log("jokes", jokes)
    console.log("jokeobjs", jokeobjs)

    setJokes(jokes => [
        ...jokes,
        ...jokeobjs
      ]
    )

  };

  const getDate = (epochtimestamp) => {
    console.log("epoch", epochtimestamp)
    let d = new Date(epochtimestamp*1000)
    return d.toDateString();
  }

  React.useEffect(() => {
    let jokesterContract;
    checkIfWalletIsConnected();
    getJokes();

    if (mined == true) {
      setMined(false);
    }
    
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      jokesterContract = new ethers.Contract(contractAddress, contractABI, signer);
      jokesterContract.on('NewJoke', onNewJoke);
    }

    

    return () => {
      if (jokesterContract) {
        jokesterContract.off('NewJoke', onNewJoke);
      }
    };


  }, [])
  
  return (
    <div>
      <section class="hero is-primary is-fullheight has-text-centered">
        <div class="hero-head has-text-centered">
          <nav class="navbar">
            <div class="container">
              <div class="navbar-brand">
                <a class="navbar-item">
                  <h1 class="is-size-3"> Jokester Pool(Alpha)</h1>
                </a>
                <span class="navbar-burger" data-target="navbarMenuHeroA">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              {/*<div id="navbarMenuHeroA" class="navbar-menu">*/}
              {/*  <div class="navbar-end">*/}
              {/*    <a class="navbar-item is-active">*/}
              {/*      Home*/}
              {/*    </a>*/}
              {/*    <a class="navbar-item">*/}
              {/*      Examples*/}
              {/*    </a>*/}
              {/*    <a class="navbar-item">*/}
              {/*      Documentation*/}
              {/*    </a>*/}
              {/*    <span class="navbar-item">*/}
              {/*      <a class="button is-primary is-inverted">*/}
              {/*        <span class="icon">*/}
              {/*          <i class="fab fa-github"></i>*/}
              {/*        </span>*/}
              {/*        <span>Download</span>*/}
              {/*      </a>*/}
              {/*    </span>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>
          </nav>
        </div>


        <div class="hero-body">
          <div class="container has-text-centered">
            <p class="subtitle">
              Laugh and Rate Users Jokes
            </p>
            {!currentAccount && (
            <button class="button is-large" onClick={connectWallet}>
              Connect Wallet
            </button>
            )}

            <AddJoke/>

            <div class="columns is-multiline">
                {jokes.map(joke=> 
                  <div class="column is-one-third" key={joke["jokeid"]} jokeid={joke["jokeid"]} ref={jokeIdli} >
                    <div class="card">
                    <div class="card-content">
                    <h3 class="card-header has-background-primary is-size-7">Author: {joke["author"]}</h3>
                    <p class="title has-text-dark">{joke["joke"]}</p>
                    <p class="subtitle has-text-dark">{getDate(joke["timestamp"].toNumber())}</p>                    
                    <footer class="card-footer">
                    <div class="card-footer-item">
                      {loading == false &&
                      <Rating
                        emptySymbol="far fa-star fa-2x"
                        fullSymbol="fas fa-star fa-2x"
                        placeholderSymbol="fas fa-star fa-2x"
                        stop={5}
                        placeholderRating={calculateAverage(joke["ratings"])}
                        onClick={(rating) => {rateJoke(joke["jokeid"], rating)}}
                      />
                      }
                      <SyncLoader loading={loading}/>
                    </div>
                    <div class="card-footer-item">
                      <FacebookShareButton 
                          quote={joke["joke"]}
                          hashtag={"#jokesterpool"}>
                          <FacebookIcon size={36} />
                      </FacebookShareButton>
                    </div>
                    </footer>
                    </div>
                    </div>
                  </div>
                  
                )}

                

                
            </div>
              </div>
            </div>

        <div class="hero-foot has-text-centered">
          <nav class="tabs">
            <div class="container">
              <ul>
                <li class="is-active"><a>Overview</a></li>
                <li><a>Modifiers</a></li>
                <li><a>Grid</a></li>
                <li><a>Elements</a></li>
                <li><a>Components</a></li>
                <li><a>Layout</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
}
