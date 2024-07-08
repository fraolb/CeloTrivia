# CeloTrivia

CeloTrivia is a decentralized trivia game built on the Celo blockchain. Users can create trivia games, participate in them, and win prizes. The app leverages smart contracts to securely manage prize distribution.

## Features

- Create and host trivia games
- Participate in trivia games and compete for prizes
- Secure prize distribution using Celo smart contracts
- Interactive user interface

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express, Socket io
- **Blockchain:** Celo, Solidity
- **Smart Contracts:** CeloTrivia smart contract
- **Libraries:** Wagmi, Viem, Ethers.js

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Celo Wallet

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/fraolb/CeloTrivia.git
   cd CeloTrivia
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory and add your Celo network and wallet details:

   ```env
   NEXT_PUBLIC_CELO_NETWORK=alfajores
   NEXT_PUBLIC_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
   NEXT_PUBLIC_CELO_WALLET_PRIVATE_KEY=your_private_key_here
   ```

4. **Compile smart contracts:**

   Navigate to the `smart-contracts` directory and compile the contracts:

   ```bash
   cd smart-contracts
   npx hardhat compile
   ```

5. **Deploy smart contracts:**

   Deploy the contracts to the Celo network:

   ```bash
   npx hardhat run scripts/deploy.js --network alfajores
   ```

6. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

### Creating a Trivia Game

1. Navigate to the dashboard.
2. Click on "Create a New Trivia".
3. Fill in the details for the trivia game.
4. Add prize money and confirm the transaction with your Celo wallet.

### Participating in a Trivia Game

1. Navigate to the list of available trivia games.
2. Select a trivia game to join.
3. Answer the trivia questions within the given time.
4. Check the leaderboard to see your ranking and if you won any prizes.

## Smart Contract

The CeloTrivia smart contract is written in Solidity and deployed on the Celo network. It handles the following:

- Creating trivia games
- Managing participants and their answers
- Distributing prizes to winners

### Smart Contract Functions

- `createTriviaGame()`: Create a new trivia game.
- `joinTriviaGame(uint256 gameId)`: Join an existing trivia game.
- `submitAnswer(uint256 gameId, uint256 questionId, string answer)`: Submit an answer to a trivia question.
- `distributePrizes(uint256 gameId)`: Distribute prizes to the winners of a trivia game.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

### Issues

If you find any issues or bugs, please open an issue on the GitHub repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Celo](https://celo.org/)
- [Wagmi](https://wagmi.sh/)
- [Viem](https://viem.sh/)
- [Ethers.js](https://docs.ethers.io/v5/)

---

_Feel free to reach out if you have any questions or need further assistance._

Happy coding! 🚀

---

**Maintainer**: [Fraol Bereket](https://github.com/fraolb)

**Contact**: [fraolbereket@gmail.com](mailto:fraolbereket@gmail.com)
