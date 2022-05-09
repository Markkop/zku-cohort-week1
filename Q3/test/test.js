const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}


describe("LessThan10 with Groth16", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
      //[assignment] insert your script here
      Verifier = await ethers.getContractFactory("LessThan10Verifier");
      verifier = await Verifier.deploy();
      await verifier.deployed();
  });

  ["-1", "0", "1", "2", "10", "11"].forEach((value) => {
    it("Should return true for correct proof", async function () {
      const { proof, publicSignals } = await groth16.fullProve({"in":value}, "contracts/circuits/LessThan10/LessThan10_js/LessThan10.wasm","contracts/circuits/LessThan10/circuit_final.zkey");

      console.log(`Is ${value} LessThan10 =`,publicSignals[0]);

      const editedPublicSignals = unstringifyBigInts(publicSignals);
      const editedProof = unstringifyBigInts(proof);
      const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
  
      const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
  
      const a = [argv[0], argv[1]];
      const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
      const c = [argv[6], argv[7]];
      const Input = argv.slice(8);

      expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
  })
});


describe("RangeProof with Groth16", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
      //[assignment] insert your script here
      Verifier = await ethers.getContractFactory("RangeProofVerifier");
      verifier = await Verifier.deploy();
      await verifier.deployed();
  });

  const range = ["2", "5"];
  ["0", "1", "2", "4", "5", "6"].forEach((value) => {
    it("Should return true for correct proof", async function () {
      const { proof, publicSignals } = await groth16.fullProve({"in":value, "range": range}, "contracts/circuits/RangeProof/RangeProof_js/RangeProof.wasm","contracts/circuits/RangeProof/circuit_final.zkey");

      console.log(`Is ${value} between ${range} =`,publicSignals[0]);

      const editedPublicSignals = unstringifyBigInts(publicSignals);
      const editedProof = unstringifyBigInts(proof);
      const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
  
      const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
  
      const a = [argv[0], argv[1]];
      const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
      const c = [argv[6], argv[7]];
      const Input = argv.slice(8);

      expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
  })
});
