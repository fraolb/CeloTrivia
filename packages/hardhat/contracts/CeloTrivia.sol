// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract CeloTriviaV3 {
    struct Deposit {
        uint256 amount;
        address depositor;
        bool exists;
    }

    IERC20 public cUSD;
    mapping(uint256 => Deposit) private deposits;

    event Deposited(address indexed depositor, uint256 key, uint256 amount);
    event Withdrawn(address indexed withdrawer, uint256 key, uint256 amount);

    constructor(address _cUSDAddress) {
        cUSD = IERC20(_cUSDAddress);
    }

    function deposit(uint256 key, uint256 amount) external {
        require(amount > 0, "Deposit must be greater than 0");
        require(!deposits[key].exists, "Key already in use");

        require(
            cUSD.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        deposits[key] = Deposit({
            amount: amount,
            depositor: msg.sender,
            exists: true
        });

        emit Deposited(msg.sender, key, amount);
    }

    function withdraw(uint256 key, uint256 amount) external {
        require(deposits[key].exists, "Invalid key");
        require(deposits[key].amount >= amount, "Insufficient funds");

        deposits[key].amount -= amount;
        if (deposits[key].amount == 0) {
            deposits[key].exists = false;
        }

        require(cUSD.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawn(msg.sender, key, amount);
    }

    function withdrawAll(uint256 key) external {
        require(deposits[key].exists, "Invalid key");
        require(deposits[key].depositor == msg.sender, "Not the depositor");

        uint256 remainingAmount = deposits[key].amount;
        deposits[key].amount = 0;
        deposits[key].exists = false;

        require(cUSD.transfer(msg.sender, remainingAmount), "Transfer failed");

        emit Withdrawn(msg.sender, key, remainingAmount);
    }

    function getRemainingAmount(uint256 key) external view returns (uint256) {
        require(deposits[key].exists, "Invalid key");
        return deposits[key].amount;
    }
}
