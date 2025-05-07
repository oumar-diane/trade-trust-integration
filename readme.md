
# TradeTrust Integration 
integration of tradetrust backend for zenithblox Universal Adapter and BPMN Modeler

## Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)
- express


# Installation- Clone the repository or download the ZIP file.
```bash

# Run 
1.npm install
2.fill in the .env file with your own environment variables
 - choose the network you want to use (id)
  export declare enum CHAIN_ID {
    local = "1337",
    mainnet = "1",
    matic = "137",
    amoy = "80002",
    sepolia = "11155111",
    xdc = "50",
    xdcapothem = "51",
    stabilitytestnet = "20180427",
    stability = "101010",
    astron = "1338"
  }
3. run the server ```bash npm run dev

```