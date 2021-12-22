// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

contract JokesterPool {

    /*
     * We will be using this below to help generate a random number
     */
    uint256 private seed;
    /*
     * This is an address => uint mapping, meaning I can associate an address with a number!
     * In this case, I'll be storing the address with the last time the user added a joke.
     */
    mapping(address => uint256) public lastAddedJoke;



    constructor() payable {
        console.log("We have been constructed!");
        /*
         * Set the initial seed
         */
        seed = (block.timestamp + block.difficulty) % 100;

    }
    event NewJoke(address indexed from, uint256 timestamp, bytes32 joke_id);

    struct Joke {
        address author;
        string joke;
        uint[] ratings;
        uint256 timestamp;
    }

    // Joke jokeStruct;
    mapping(bytes32 => Joke) public jokeStructs;
    bytes32[] public jokes;

    function hash(string memory _text, address _addr) private pure returns (bytes32) {
        return keccak256(abi.encode(_text, _addr));
    }


    function getJoke(bytes32 joke_id) public view returns(bytes32 jokeid, address author, string memory joke, uint[] memory ratings, uint256 timestamp) {
        author = jokeStructs[joke_id].author;
        joke = jokeStructs[joke_id].joke;
        ratings = jokeStructs[joke_id].ratings;
        timestamp = jokeStructs[joke_id].timestamp;
        jokeid = joke_id;
        return (jokeid, author, joke, ratings, timestamp);
    }

    function getJokeIDs() public view returns(bytes32[] memory)  {
        return jokes;
    }

    function addJoke(string memory jokestring) public {

        // require(
        //     lastAddedJoke[msg.sender] + 15 minutes < block.timestamp,
        //     "Wait 15m"
        // );

        // /*
        //  * Update the current timestamp we have for the user
        //  */
        // lastAddedJoke[msg.sender] = block.timestamp;

        bytes32 joke_id = hash(jokestring, msg.sender);
        jokeStructs[joke_id].author = msg.sender;
        jokeStructs[joke_id].joke = jokestring;
        jokeStructs[joke_id].timestamp = block.timestamp;
        jokes.push(joke_id);
        console.log("%s has added joke", msg.sender);

        emit NewJoke(msg.sender, block.timestamp, joke_id);

        // /*
        //  * Generate a new seed for the next user that sends a wave
        //  */
        // seed = (block.difficulty + block.timestamp + seed) % 100;
        // console.log(seed);

        // /*
        //  * Give a 25% chance that the user wins the prize.
        //  */
        // if (seed <= 5) {
        //     console.log("%s won!", msg.sender);


        //     uint256 prizeAmount = 0.0001 ether;
        //     require(
        //         prizeAmount <= address(this).balance,
        //         "Trying to withdraw more money than the contract has."
        //     );
        //     (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        //     require(success, "Failed to withdraw money from contract.");
        // }
    } 

    function rateJoke(bytes32 joke_id, uint rating ) public {
        jokeStructs[joke_id].ratings.push(rating);
    }

}