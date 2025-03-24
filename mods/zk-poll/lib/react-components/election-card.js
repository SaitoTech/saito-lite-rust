
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const ElectionCard = ({
    election,
    voteCounts,
    selectedCandidates,
    loading,
    finalizedElections,
    refreshElections,
    onVote,
    onFinalize,
    onSelect,
    handleEditStart,
    app,
    mod
}) => {
    const getElectionStatus = (startDate, endDate) => {
        const now = new Date().getTime();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        if (now < start) return 'not-started';
        if (now > end) return 'ended';
        return 'active';
    };

    const calculateVotePercentage = (votes, totalVotes) => {

        if (!totalVotes || !votes) return 0;
        return (votes / totalVotes) * 100;
    };

    const handleEdit = () => {
        if (!isOwner) {
            return window.salert("You cannot edit this poll");
        }

        // Cannot edit if voting has started
        const status = getElectionStatus(election.startDate, election.endDate);
        if (status !== 'not-started') {
            return window.salert("Cannot edit poll after voting has started");
        }
        handleEditStart(election);
    };

    const handleDelete = async (signature, electionId) => {
        let result = await sconfirm("Are you sure you want to delete this poll?")
        if (!result) return;
        console.log('Delete election:', election.id);
        mod.sendDeleteElectionTransaction({ signature, electionId }, ({ success, message }) => {
            if (success) {
                siteMessage(message, 2000)
                refreshElections()
            } else if (success === false) {
                salert(message);
            }
        })
    };

    const style = {
        container: {
            margin: '0 auto',
            padding: '16px'
        },
        card: {
            borderRadius: '8px',
            padding: '24px',
            color: 'white',
            border: '1px solid var(--saito-border-color)'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
        },
        title: {
            fontSize: '24px',
            fontWeight: '600'
        },
        voteCount: {
            color: '#9ca3af'
        },
        dates: {
            color: '#9ca3af',
            fontSize: '14px',
            marginBottom: '24px'
        },
        candidateList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '16px'
        },
        candidateItem: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#374151',
            borderRadius: '8px',
            padding: '12px'
        },
        radio: {
            marginRight: '12px'
        },
        candidateInfo: {
            flex: 1
        },
        candidateName: {
            color: 'white',
            marginBottom: '4px'
        },
        voteStats: {
            color: '#9ca3af',
            fontSize: '14px'
        },
        progressBar: {
            width: '50%',
            backgroundColor: '#4b5563',
            borderRadius: '9999px',
            height: '8px'
        },
        progressFill: {
            backgroundColor: '#3b82f6',
            height: '100%',
            borderRadius: '9999px',
            transition: 'width 0.3s ease'
        },
        status: {
            backgroundColor: 'rgba(55, 65, 81, 0.5)',
            color: 'white',
            padding: '8px',
            textAlign: 'center',
            borderRadius: '8px',
            marginBottom: '16px'
        },
        button: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px'
        },
        buttonDisabled: {
            backgroundColor: '#4b5563',
            cursor: 'not-allowed'
        },
        results: {
            marginTop: '16px',
            padding: '16px',
            backgroundColor: 'rgba(55, 65, 81, 0.5)',
            borderRadius: '8px'
        }
    };

    const status = getElectionStatus(election.startDate, election.endDate);
    const totalVotes = voteCounts[election.id] || 0;
    const isOwner = election.publicKey === mod.publicKey;


    return (
        <div className="election-container">
            <div className="election-card">
                <div className="election-header">
                    <h2 className="election-title">{election.description}</h2>
                    <span className="vote-count">{totalVotes} votes</span>
                    {isOwner && (
                        <div className="election-actions">
                            <div
                                onClick={handleEdit}
                                className="election-icon-button"
                            >
                                <Edit2 className="election-icon" />
                            </div>
                            <div
                                onClick={() => handleDelete(election.signature)}
                                className="election-icon-button"
                            >
                                <Trash2 className="election-icon" />
                            </div>
                        </div>
                    )}
                </div>

                <div style={style.dates}>
                    <div>Start: {new Date(election.startDate).toLocaleString()}</div>
                    <div>End: {new Date(election.endDate).toLocaleString()}</div>
                </div>

                <div style={style.candidateList}>
                    {election.candidateNames.map((name, index) => {
                        const votes = election.finalTally ? election.finalTally[index] : 0;
                        const percentage = calculateVotePercentage(votes, totalVotes);

                        return (
                            <div key={index} style={style.candidateItem}>
                                <input
                                    type="radio"
                                    name={`election-${election.id}`}
                                    style={style.radio}
                                    checked={selectedCandidates[election.id] === index}
                                    onChange={() => onSelect(election.id, index)}
                                    disabled={loading || status !== 'active'}
                                />
                                <div style={style.candidateInfo}>
                                    <div style={style.candidateName}>{name}</div>
                                    <div style={style.voteStats}>
                                        {votes} votes ({percentage.toFixed(1)}%)
                                    </div>
                                </div>
                                <div style={style.progressBar}>
                                    <div style={{ ...style.progressFill, width: `${percentage}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={style.status}>
                    {status === 'not-started' ? 'Voting not started' :
                        status === 'ended' ? 'Voting ended' :
                            'Voting active'}
                </div>

                {status === 'active' && (
                    <button
                        style={{
                            ...style.button,
                            ...(loading || selectedCandidates[election.id] === undefined ? style.buttonDisabled : {})
                        }}
                        onClick={() => onVote(election.signature, election.id, selectedCandidates[election.id])}
                        disabled={loading || selectedCandidates[election.id] === undefined}
                    >
                        {loading ? 'Submitting...' : 'Vote'}
                    </button>
                )}

                {status === 'ended' && election.status !== "finalized" && (
                    <button
                        style={style.button}
                        onClick={() => onFinalize(election.signature, election.id)}
                    >
                        Finalize Results
                    </button>
                )}


            </div>
        </div>
    );
};

export default ElectionCard;