pragma circom 2.1.6

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/gates.circom";

template DynamicVoteCircuit(MAX_CANDIDATES) {
    // PUBLIC INPUTS
    signal input numCandidates;    // The actual number of candidates for this election
    signal input electionId;       // Ties the proof to a specific election

    // PRIVATE INPUTS
    signal input candidateIndex;   // The chosen candidate (in 0..numCandidates-1)
    signal input r;                // Random nonce

    // PUBLIC OUTPUT
    signal output voteCommitment;

    component rangeCheckMax = LessThan();
    rangeCheckMax.in[0] <== numCandidates;
    rangeCheckMax.in[1] <== MAX_CANDIDATES + 1;  
    rangeCheckMax.out === 1;

    component rangeCheckCandidate = LessThan();
    rangeCheckCandidate.in[0] <== candidateIndex;
    rangeCheckCandidate.in[1] <== numCandidates;
    rangeCheckCandidate.out === 1;
    
    component hash = Poseidon(3);
    hash.inputs[0] <== electionId; 
    hash.inputs[1] <== candidateIndex;
    hash.inputs[2] <== r;
}

component main = DynamicVoteCircuit(256);
