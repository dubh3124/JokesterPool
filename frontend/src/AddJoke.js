import React, {useRef, useState} from 'react';
import './App.css';
import {ethers} from "ethers";
import abi from "./utils/JokesterPool.json";


function AddJoke() {

  var jokeForm = useRef()
  const contractAddress = process.env.REACT_APP_JOKESTER_CONTRACT;
  const contractABI = abi.abi;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const addJoke = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const jokesterContract = new ethers.Contract(contractAddress, contractABI, signer);
        const addJokeTxn = await jokesterContract.addJoke(jokeForm.current.value);
        console.log("Mining...", addJokeTxn.hash);

        await addJokeTxn.wait();
        console.log("Mined -- ", addJokeTxn.hash);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  return (
      <div>
        <button className="button is-large" onClick={handleShow}>Add Joke</button>
        {show && (
            <div class="modal is-active">
              <div className="modal-background"></div>
              <div className="modal-content">
                <div className="field">
                  <label className="label">Add Joke</label>
                  <div className="control">
                    <textarea  className="textarea is-large" placeholder="Make Us Laugh..." ref={jokeForm}></textarea>
                  </div>
                </div>
                <div className="field">
                  <div className="control">
                    <button className="button" onClick={addJoke}>Submit</button>
                  </div>
                </div>
                <button className="modal-close is-large" aria-label="close" onClick={handleClose}></button>
              </div>
            </div>
            )}
      </div>
  )
}

export default AddJoke

