import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.min.css";

const CONTRACT_ADDRESS = "0xBE4c41206006861104175f4C0a1168a8A2aE6D56";
const CONTRACT_ABI = [

{
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Borrow",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Deposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Repay",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdraw",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "borrow",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getLoan",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalDeposits",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "isLoanOverdue",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "repay",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalDeposits",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  
];

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [totalDeposits, setTotalDeposits] = useState("0");
  const [userLoan, setUserLoan] = useState("0");

  // Separate input fields for each action
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  useEffect(() => {
    checkWalletConnection();
    window.ethereum?.on("chainChanged", () => window.location.reload());
    window.ethereum?.on("accountsChanged", () => window.location.reload());
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const { chainId } = await provider.getNetwork();
      setAccount(address);

      if (chainId !== 10143) {
        alert(`Please switch to Monad Testnet! (Current chain: ${chainId})`);
      }

      await fetchBankDetails(address, provider);
    } else {
      alert("MetaMask not found! Please install it.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0");
    setTotalDeposits("0");
    setUserLoan("0");
  };

  const fetchBankDetails = async (user, provider) => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const userBalance = await contract.getBalance(user);
      const bankDeposits = await contract.getTotalDeposits();
      const loanAmount = await contract.getLoan(user);

      setBalance(ethers.formatEther(userBalance));
      setTotalDeposits(ethers.formatEther(bankDeposits));
      setUserLoan(ethers.formatEther(loanAmount));
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  const handleTransaction = async (method, value) => {
    if (!value || isNaN(value) || parseFloat(value) <= 0) return alert("Enter a valid amount!");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      let tx;
      const amountInEther = ethers.parseEther(value); // Convert input to BigNumberish
      
      if (method === "deposit") {
      tx = await contract.deposit({ value: amountInEther });
    } else if (method === "repay") {
      tx = await contract.repay(amountInEther, { value: amountInEther }); // Fix: Pass amount + value
    } else {
      tx = await contract[method](amountInEther);
    }

      await tx.wait();
      alert(`${method.charAt(0).toUpperCase() + method.slice(1)} successful!`);
      fetchBankDetails(account, provider);
    } catch (error) {
      alert(`${method.charAt(0).toUpperCase() + method.slice(1)} failed: ${error.message}`);
    }
  };

  return (
    <div className="container mt-5 text-center">
      <h2 className="mb-3">Virtual Bank</h2>
      {account ? (
        <button className="btn btn-danger mb-3" onClick={disconnectWallet}>
          Disconnect Wallet
        </button>
      ) : (
        <button className="btn btn-primary mb-3" onClick={checkWalletConnection}>
          Connect MetaMask
        </button>
      )}
      <h4 className="mb-4">Bank Total Deposits: {totalDeposits} MON</h4>

      <div className="row">
        {/* Deposit Section */}
        <div className="col-md-6 mb-4">
          <div className="card p-3 border-primary">
            <h5>Deposit</h5>
            <p>Your Deposit: {balance} MON</p>
            <input type="number" className="form-control mb-2" placeholder="Amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
            <button className="btn btn-success" onClick={() => handleTransaction("deposit", depositAmount)}>
              Deposit
            </button>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="col-md-6 mb-4">
          <div className="card p-3 border-danger">
            <h5>Withdraw</h5>
            <p>Withdrawable: {balance} MON</p>
            <input type="number" className="form-control mb-2" placeholder="Amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
            <button className="btn btn-danger" onClick={() => handleTransaction("withdraw", withdrawAmount)}>
              Withdraw
            </button>
          </div>
        </div>

        {/* Borrow Section */}
        <div className="col-md-6">
          <div className="card p-3 border-warning">
            <h5>Borrow</h5>
            <p>Borrowed: {userLoan} MON</p>
            <input type="number" className="form-control mb-2" placeholder="Amount" value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)} />
            <button className="btn btn-warning" onClick={() => handleTransaction("borrow", borrowAmount)}>
              Borrow
            </button>
          </div>
        </div>

        {/* Repay Section */}
        <div className="col-md-6">
          <div className="card p-3 border-info">
            <h5>Repay</h5>
            <p>Repay Amount: {userLoan} MON</p>
            <input type="number" className="form-control mb-2" placeholder="Amount" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} />
            <button className="btn btn-info" onClick={() => handleTransaction("repay", repayAmount)}>
              Repay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
