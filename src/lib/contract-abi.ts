export const contractABI = [
    {"type": "constructor", "inputs": [{"name": "walletAddresses", "type": "address[]", "internalType": "address[]"}, {"name": "targetAmounts", "type": "uint256[]", "internalType": "uint256[]"}], "stateMutability": "nonpayable"}, 
    {"name": "DonationReceived", "type": "event", "inputs": [{"name": "donor", "type": "address", "indexed": true, "internalType": "address"}, {"name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256"}, {"name": "milestoneIndex", "type": "uint256", "indexed": false, "internalType": "uint256"}], "anonymous": false}, 
    {"name": "MilestoneCompleted", "type": "event", "inputs": [{"name": "milestoneIndex", "type": "uint256", "indexed": false, "internalType": "uint256"}], "anonymous": false}, 
    {"type": "fallback", "stateMutability": "payable"}, 
    {"name": "donate", "type": "function", "inputs": [{"name": "milestoneIndex", "type": "uint256", "internalType": "uint256"}], "outputs": [], "stateMutability": "payable"}, 
    {"name": "getMilestone", "type": "function", "inputs": [{"name": "milestoneIndex", "type": "uint256", "internalType": "uint256"}], "outputs": [{"name": "wallet", "type": "address", "internalType": "address"}, {"name": "targetAmount", "type": "uint256", "internalType": "uint256"}, {"name": "currentAmount", "type": "uint256", "internalType": "uint256"}, {"name": "completed", "type": "bool", "internalType": "bool"}], "stateMutability": "view"}, 
    {"name": "getMilestonesCount", "type": "function", "inputs": [], "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}], "stateMutability": "view"}, 
    {"name": "getTotalDonations", "type": "function", "inputs": [], "outputs": [{"name": "total", "type": "uint256", "internalType": "uint256"}], "stateMutability": "view"}, 
    {"name": "milestones", "type": "function", "inputs": [{"name": "", "type": "uint256", "internalType": "uint256"}], "outputs": [{"name": "wallet", "type": "address", "internalType": "address"}, {"name": "targetAmount", "type": "uint256", "internalType": "uint256"}, {"name": "currentAmount", "type": "uint256", "internalType": "uint256"}, {"name": "completed", "type": "bool", "internalType": "bool"}], "stateMutability": "view"}, 
    {"name": "owner", "type": "function", "inputs": [], "outputs": [{"name": "", "type": "address", "internalType": "address"}], "stateMutability": "view"}, 
    {"name": "withdraw", "type": "function", "inputs": [], "outputs": [], "stateMutability": "nonpayable"}, 
    {"type": "receive", "stateMutability": "payable"}
  ]