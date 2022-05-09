const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

const verifierRegex = /contract Verifier/

let content = fs.readFileSync("./contracts/LessThan10Verifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract LessThan10Verifier');

fs.writeFileSync("./contracts/LessThan10Verifier.sol", bumped);

content = fs.readFileSync("./contracts/RangeProofVerifier.sol", { encoding: 'utf-8' });
bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract RangeProofVerifier');

fs.writeFileSync("./contracts/RangeProofVerifier.sol", bumped);
