// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalShakes;

    uint256 private seed;

    event NewShake(address indexed from, uint256 timestamp, string message);

    struct Shake {
        address shaker;
        string message;
        uint256 timestamp;
    }

    Shake[] shakes;

    mapping(address => uint256) public lastWavedAt;

    constructor() payable {
        console.log("Yo, this is the tree shaker.");
    }

    function shake(string memory _message) public {
        require(
            lastWavedAt[msg.sender] + 20 seconds < block.timestamp,
            "Wait 20 seconds"
        );

        lastWavedAt[msg.sender] = block.timestamp;

        totalShakes += 1;
        console.log("%s has shaken the tree!", msg.sender);

        shakes.push(Shake(msg.sender, _message, block.timestamp));

        uint256 randomNumber = (block.difficulty + block.timestamp + seed) %
            100;
        console.log("Random # generated: %s", randomNumber);

        seed = randomNumber;

        if (randomNumber < 50) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than they contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewShake(msg.sender, block.timestamp, _message);
    }

    function getAllShakes() public view returns (Shake[] memory) {
        return shakes;
    }

    function getTotalShakes() public view returns (uint256) {
        console.log("%d tree shakers have shaken the tree!", totalShakes);
        return totalShakes;
    }
}
