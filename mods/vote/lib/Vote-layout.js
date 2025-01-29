import React, { useState, useEffect } from 'react';
import ElectionCard from './react-components/election-card';
import { Globe, UserSquare, PlusSquare } from 'lucide-react';


const VoteLayout = ({ app, mod }) => {
  const [activeTab, setActiveTab] = useState('All Polls');
  const [newElection, setNewElection] = useState({
    description: '',
    numCandidates: 2,
    candidateNames: ['', ''],
    startDate: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    endDate: ''
  });
  const [elections, setElections] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [voteCounts, setVoteCounts] = useState({});
  const [finalizedElections, setFinalizedElections] = useState(new Set());
  const [loadingStates, setLoadingStates] = useState({});


  useEffect(() => {
    refreshElections();
  }, [activeTab]);


  const getElectionStatus = (startDate, endDate) => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (now < start) return 'not-started';
    if (now > end) return 'ended';
    return 'active';
  };

  const handleEditStart = (election) => {
    setActiveTab('create');
    setNewElection({
      description: election.description,
      numCandidates: election.candidateNames.length,
      candidateNames: [...election.candidateNames],
      startDate: election.startDate,
      endDate: election.endDate,
      isEditing: true,
      signature: election.signature,
      id: election.id
    });
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
      if (newElection.isEditing) {
        // Handle edit
        await mod.sendUpdateElectionTransaction({
          signature: newElection.signature,
          description: newElection.description,
          candidateNames: newElection.candidateNames,
          startDate: newElection.startDate,
          endDate: newElection.endDate
        }, (result) => {
          if (result.success) {
            window.siteMessage("Poll updated successfully", 2000);
            setActiveTab('All Polls');
            setNewElection({
              description: '',
              numCandidates: 2,
              candidateNames: ['', ''],
              startDate: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
              endDate: '',
              isEditing: false
            });
            fetchElections();
          } else {
            window.salert(result.message || "Could not update poll");
          }
        });
      } else {
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
          setActiveTab('All Polls');
          setNewElection({
            description: '',
            numCandidates: 2,
            candidateNames: ['', ''],
            startDate: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
            endDate: ''
          });
          fetchElections();
        } else {
          window.salert("Could not create poll");
        }
      }
    } catch (err) {
      window.salert(err.message);
    }
  };

  const handleSelection = (electionId, index) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [electionId]: index
    }));
  };


  const fetchElections = async () => {
    try {
      if (activeTab === 'My Polls') {
        await mod.fetchElectionsForUser(mod.publicKey, async (elections) => {
          setElections(elections);
          const counts = {};
          for (const election of elections) {
            const count = await mod.getVoteCount(election.id, election.signature);
            counts[election.id] = count.totalVotes;
          }
          setVoteCounts(counts);
          handleFinalizeAll(elections);
        });
      } else {
        await mod.fetchElections(async (elections) => {
          setElections(elections);
          const counts = {};
          for (const election of elections) {
            const count = await mod.getVoteCount(election.id, election.signature);
            counts[election.id] = count.totalVotes;
          }
          setVoteCounts(counts);
          handleFinalizeAll(elections);
        });
      }
    } catch (err) {
      setError("Failed to fetch elections");
    }
  };





  const refreshElections = () => {
    fetchElections()
  }


  const handleVote = async (signature, electionId, candidateIndex) => {
    setLoadingStates(prev => ({ ...prev, [electionId]: true }));
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
          window.siteMessage('Vote submitted successfully', 2000)
          fetchElections();
        }
      });
      setSelectedCandidates(prev => ({ ...prev, [electionId]: undefined }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [electionId]: false }));
    }
  };


  const handleFinalizeAll = async (elections) => {
    try {
      const eligibleElections = elections.filter(election => {
        const status = getElectionStatus(election.startDate, election.endDate);
        return status === 'ended' &&
          election.status !== "finalized"
      });

      for (const election of eligibleElections) {
        await mod.sendFinalizeElectionTransaction({
          signature: election.signature,
          electionId: election.id
        }, (result) => {
          if (result.success) {
            setFinalizedElections(prev => new Set([...prev, election.id]));
          }
        });
      }
      if (eligibleElections.length > 0) {
        fetchElections();
      }
    } catch (err) {
      setError("Error finalizing elections: " + err.message);
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


  const updateCandidateName = (index, name) => {
    const newNames = [...newElection.candidateNames];
    newNames[index] = name;
    setNewElection({ ...newElection, candidateNames: newNames });
  };

  const updateNumCandidates = (num) => {
    if(num > 5) return salert("Poll options shouldn't exceed 5")
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
            <PlusSquare size={18} className="mr-2" />

            Create Poll
          </button>
          <button
            style={{
              background: 'none'
            }}
            className={`tab-button ${activeTab === 'All Polls' ? 'active' : ''}`}
            onClick={() => setActiveTab('All Polls')}
          >
            <Globe size={18} className="mr-2" />

            All Polls
          </button>

          <button
            style={{
              background: 'none'
            }}
            className={`tab-button ${activeTab === 'My Polls' ? 'active' : ''}`}
            onClick={() => setActiveTab('My Polls')}
          >
            <UserSquare size={18} className="mr-2" />

            My Polls
          </button>

        </div>
      </div>

      <div className="center-column" style={{
        maxWidth: '900px',
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
                <h5>{newElection.isEditing ? 'Edit Poll' : 'Create New Poll'}</h5>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <input
                    className="input"
                    placeholder="Poll Description"
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                  />
                  <div className="date-input-group">
                    <label>Poll Duration:</label>
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
                    <label>Number of Options:</label>
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
                        placeholder={`Option ${index + 1} Name`}
                        value={name}
                        onChange={(e) => updateCandidateName(index, e.target.value)}
                      />
                    ))}
                  </div>
                  <button className="button primary" onClick={handleCreateElection}>
                    {newElection.isEditing ? 'Update Poll' : 'Create Poll'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'All Polls' || activeTab === 'My Polls') && (
            <div className="elections-list">
              {elections.length === 0 ? (
                <div className="no-elections">
                  <h3>No Elections Found</h3>
                  <p>
                    {activeTab === 'My Polls'
                      ? "You haven't created any polls yet"
                      : "Create a new election to get started"}
                  </p>
                </div>
              ) : (
                elections.map(election => (
                  <ElectionCard
                    key={election.id}
                    election={election}
                    voteCounts={voteCounts}
                    selectedCandidates={selectedCandidates}
                    loading={loadingStates[election.id]}
                    finalizedElections={finalizedElections}
                    onVote={handleVote}
                    mod={mod}
                    app={app}
                    refreshElections={refreshElections}
                    onFinalize={handleFinalize}
                    onSelect={handleSelection}
                    handleEditStart={handleEditStart}
                  />
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VoteLayout;