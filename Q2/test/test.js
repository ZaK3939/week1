const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16,plonk } = require("snarkjs");

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

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // Create the proof
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        // Check publicSignals
        console.log('1x2 =',publicSignals[0]);
        // string2BigInts
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // Create solifiy call argv
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        // use regular expression and split for function call
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // make input args
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        console.log(Input)
        // kick test
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("VerifierGroth16");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        // Create the proof
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/groth16/circuit_final.zkey");
        // Check publicSignals
        console.log('1x2x3 =',publicSignals[1]);
        // string2BigInts
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // Create solifiy call argv
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        // use regular expression and split for function call
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // make input args
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        // kick test
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0,0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


// const WITNESS_FILE = 'tmp'
// const generateWitness = async (inputs) => {
//   const wc = require('contracts/circuits/Multiplier3/Multiplier3_js/witness_calculator.js')
//   const buffer = fs.readFileSync("contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm");
//   const witnessCalculator = await wc(buffer)
//   const buff = await witnessCalculator.calculateWTNSBin(inputs, 0);
//   fs.writeFileSync(WITNESS_FILE, buff)
// }

describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
         // Create the proof
        // const inputSignals = { enabled: 1, in: [1, 1, 1] } // replace with your signals
        // await generateWitness(inputSignals)
        // const { proof, publicSignals } = await plonk.prove("contracts/circuits/Multiplier3/circuit_final.zkey",WITNESS_FILE);
        // // Check publicSignals
        // console.log(proof)
        // console.log('1x2x3 =',publicSignals[1]);
        // // string2BigInts
        // const editedPublicSignals = unstringifyBigInts(publicSignals);
        // const editedProof = unstringifyBigInts(proof);
        // // Create solifiy call argv
        // const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        
        // // use regular expression and split for function call
        // const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // // make input args
        // console.log(argv)
        // const a = [argv[0], argv[1]];
        // const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        // const c = [argv[6], argv[7]];
        // const Input = argv.slice(8);
        // console.log(Input)
        // // kick test
        // expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
        var text = fs.readFileSync("./contracts/circuits/Multiplier3/call.txt", 'utf-8');
        var calldata = text.split(',');
        Input =["0x0000000000000000000000000000000000000000000000000000000000000002","0x0000000000000000000000000000000000000000000000000000000000000006"]
        expect(await verifier.verifyProof(calldata[0], Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [0, 0];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});