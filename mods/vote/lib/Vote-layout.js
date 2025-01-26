import React, { useState, useEffect } from 'react';
import ElectionCard from './react-components/election-card';

const VoteLayout = ({ app, mod }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newElection, setNewElection] = useState({
    description: '',
    numCandidates: 2,
    candidateNames: ['', ''],
    startDate: '',
    endDate: ''
  });
  const [elections, setElections] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [voteCounts, setVoteCounts] = useState({});
  const [finalizedElections, setFinalizedElections] = useState(new Set());


  useEffect(() => {
    fetchElections();
  }, []);


  const getElectionStatus = (startDate, endDate) => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) return 'not-started';
    if (now > end) return 'ended';
    return 'active';
  };


  const handleSelection = (electionId, index) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [electionId]: index
    }));
  };

  const fetchElections = async () => {
    try {
      await mod.fetchElections(async (elections) => {
        setElections(elections)
        console.log(elections, 'elections')
        const counts = {};
        for (const election of elections) {
          const count = await mod.getVoteCount(election.id, election.signature);
          counts[election.id] = count.totalVotes;
        }
        setVoteCounts(counts);
      });
    } catch (err) {
      setError("Failed to fetch elections");
    }
  };



  const handleVote = async (signature, electionId, candidateIndex) => {
    setLoading(true);
    try {
      const election = elections.find(e => e.id === electionId);
      const now = new Date().getTime();
      const start = new Date(election.startDate).getTime();
      const end = new Date(election.endDate).getTime();

      if (now < start) {
        throw new Error("Election has not started yet");
      }
      if (now > end) {
        throw new Error("Election has ended");
      }

      const nonce = Math.floor(Math.random() * 1000000000);
      await mod.sendSubmitVoteTransaction({
        signature,
        electionId,
        candidateIndex,
        nonce,
      }, (result) => {
        console.log(result)
        if (result.success === false) {
          console.log('an error occured', result.message)
          window.salert(result.message)
        } else {
          window.siteMessage('Vote submitted successfully')
          fetchElections();
        }
      });
      setSelectedCandidates(prev => ({ ...prev, [electionId]: undefined }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (signature, electionId) => {
    try {
      await mod.sendFinalizeElectionTransaction({
        signature,
        electionId
      }, (result) => {
        if (result.success) {
          setFinalizedElections(prev => new Set([...prev, electionId]));
          fetchElections();
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };


  const handleCreateElection = async () => {
    if (!newElection.startDate || !newElection.endDate) {
      window.salert("Please set both start and end dates");
      return;
    }

    const startTime = new Date(newElection.startDate).getTime();
    const endTime = new Date(newElection.endDate).getTime();

    if (startTime >= endTime) {
      window.salert("End date must be after start date");
      return;
    }

    try {
      let result = await mod.sendCreateElectionTransaction({
        numCandidates: newElection.numCandidates,
        candidateNames: newElection.candidateNames,
        description: newElection.description,
        startDate: newElection.startDate,
        endDate: newElection.endDate
      }, () => {
        fetchElections()
      });

      if (result) {
        setActiveTab('dashboard');
        setNewElection({
          description: '',
          numCandidates: 2,
          candidateNames: ['', ''],
          startDate: '',
          endDate: ''
        });
        fetchElections();
      } else {
        window.salert("Could not create election");
      }
    } catch (err) {
      window.salert(err.message);
    }
  };

  const updateCandidateName = (index, name) => {
    const newNames = [...newElection.candidateNames];
    newNames[index] = name;
    setNewElection({ ...newElection, candidateNames: newNames });
  };

  const updateNumCandidates = (num) => {
    const candidateNames = [...newElection.candidateNames];
    while (candidateNames.length < num) {
      candidateNames.push('');
    }
    while (candidateNames.length > num) {
      candidateNames.pop();
    }
    setNewElection({
      ...newElection,
      numCandidates: num,
      candidateNames
    });
  };

  return (
    <div className="layout" style={{
      display: 'flex',
      position: 'relative'
    }}>

      <div className="left-column" style={{
        display: 'block',
        position: 'relative',
        left: 0
      }}>

        <div className="tab-buttons">

          <button
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Election
          </button>
          <button
            style={{
              background: 'none'
            }}
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>

        </div>
      </div>

      <div className="center-column" style={{
        maxWidth: '900px',
        // margin: selectedPost ? '0 auto' : undefined
      }}>
        <div className="voting-system">
          {error && (
            <div className="alert error">
              {error}
            </div>
          )}



          {activeTab === 'create' && (
            <div className="card">
              <div className="card-header">
                <h5>Create New Election</h5>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <input
                    className="input"
                    placeholder="Election Description"
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                  />
                  <div className="date-input-group">
                    <label>Election Duration:</label>
                    <div className="date-inputs">
                      <input
                        className="input"
                        type="datetime-local"
                        placeholder="Start Date"
                        value={newElection.startDate}
                        onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                      />
                      <input
                        className="input"
                        type="datetime-local"
                        placeholder="End Date"
                        value={newElection.endDate}
                        onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="number-input-group">
                    <label>Number of Candidates:</label>
                    <input
                      className="input"
                      type="number"
                      min="2"
                      max="256"
                      value={newElection.numCandidates}
                      onChange={(e) => updateNumCandidates(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="candidates-section">
                    {newElection.candidateNames.map((name, index) => (
                      <input
                        key={index}
                        className="input"
                        placeholder={`Candidate ${index + 1} Name`}
                        value={name}
                        onChange={(e) => updateCandidateName(index, e.target.value)}
                      />
                    ))}
                  </div>
                  <button className="button primary" onClick={handleCreateElection}>
                    Create Election
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="elections-list">
              {elections.map(election => (

                <ElectionCard
                key={election.id}
                election={election}
                voteCounts={voteCounts}
                selectedCandidates={selectedCandidates}
                loading={loading}
                finalizedElections={finalizedElections}
                onVote={handleVote}
                onFinalize={handleFinalize}
                onSelect={handleSelection}
              />   ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VoteLayout;