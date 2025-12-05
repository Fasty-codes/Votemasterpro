// Data structure for elections
        let elections = JSON.parse(localStorage.getItem('elections')) || [];
        let currentElection = null;
        let selectedCandidate = null;
        let isVotingEnabled = true;
        let voteTimer = null;
        let nextVoteTime = 0;
        let currentCandidateImage = null;

        // Admin password (default is "admin123")
        let adminPassword = localStorage.getItem('adminPassword') || "admin123";

        // DOM elements
        const electionNameInput = document.getElementById('election-name');
        const candidateNameInput = document.getElementById('candidate-name');
        const candidateImageInput = document.getElementById('candidate-image');
        const candidateImagePreview = document.getElementById('candidate-image-preview');
        const addCandidateBtn = document.getElementById('add-candidate-btn');
        const createElectionBtn = document.getElementById('create-election-btn');
        const candidateList = document.getElementById('candidate-list');
        const electionList = document.getElementById('election-list');
        const votingSection = document.getElementById('voting-section');
        const votingElectionName = document.getElementById('voting-election-name');
        const candidatesGrid = document.getElementById('candidates-grid');
        const voteBtn = document.getElementById('vote-btn');
        const countdown = document.getElementById('countdown');
        const leaderboard = document.getElementById('leaderboard');
        const leaderboardResults = document.getElementById('leaderboard-results');
        const finishElectionBtn = document.getElementById('finish-election-btn');
        const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
        const confirmationModal = document.getElementById('confirmation-modal');
        const confirmBtn = document.getElementById('confirm-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const successModal = document.getElementById('success-modal');
        const successOkBtn = document.getElementById('success-ok-btn');
        const successText = document.getElementById('success-text');
        const confirmationText = document.getElementById('confirmation-text');
        const resetDataBtn = document.getElementById('reset-data-btn');
        const totalVotesEl = document.getElementById('total-votes');
        const votingStatusEl = document.getElementById('voting-status');
        const nextVoteTimerEl = document.getElementById('next-vote-timer');
        const resultsTotalVotesEl = document.getElementById('results-total-votes');
        const leadingCandidateEl = document.getElementById('leading-candidate');
        const voteDifferenceEl = document.getElementById('vote-difference');
        const barChartEl = document.getElementById('bar-chart');
        const pieChartEl = document.getElementById('pie-chart');
        const pieCenterEl = document.getElementById('pie-center');
        const passwordModal = document.getElementById('password-modal');
        const passwordInput = document.getElementById('password-input');
        const verifyPasswordBtn = document.getElementById('verify-password-btn');
        const cancelPasswordBtn = document.getElementById('cancel-password-btn');
        const passwordError = document.getElementById('password-error');
        const adminPasswordInput = document.getElementById('admin-password');
        const setPasswordBtn = document.getElementById('set-password-btn');
        const currentPasswordDisplay = document.getElementById('current-password-display');

        // Initialize the app
        function init() {
            updatePasswordDisplay();
            renderElectionList();
            addCandidateBtn.addEventListener('click', addCandidate);
            createElectionBtn.addEventListener('click', createElection);
            voteBtn.addEventListener('click', submitVote);
            finishElectionBtn.addEventListener('click', showPasswordModal);
            backToDashboardBtn.addEventListener('click', showDashboard);
            confirmBtn.addEventListener('click', handleConfirmation);
            cancelBtn.addEventListener('click', closeModal);
            successOkBtn.addEventListener('click', closeSuccessModal);
            resetDataBtn.addEventListener('click', resetAllData);
            candidateImageInput.addEventListener('change', handleImageUpload);
            verifyPasswordBtn.addEventListener('click', verifyPassword);
            cancelPasswordBtn.addEventListener('click', closePasswordModal);
            setPasswordBtn.addEventListener('click', setAdminPassword);
            adminPasswordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    setAdminPassword();
                }
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.dropdown')) {
                    document.querySelectorAll('.dropdown').forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                }
            });

            // Update next vote timer every second
            setInterval(updateNextVoteTimer, 1000);
        }

        // Update password display
        function updatePasswordDisplay() {
            currentPasswordDisplay.textContent = adminPassword;
        }

        // Set admin password
        function setAdminPassword() {
            const newPassword = adminPasswordInput.value.trim();
            if (!newPassword) {
                showModal("Please enter a password");
                return;
            }

            adminPassword = newPassword;
            localStorage.setItem('adminPassword', adminPassword);
            adminPasswordInput.value = '';
            updatePasswordDisplay();
            showSuccessModal('Admin password updated successfully!');
        }

        // Show password modal
        function showPasswordModal() {
            passwordInput.value = '';
            passwordError.style.display = 'none';
            passwordModal.classList.add('active');
            passwordModal.style.display = 'flex';
            passwordInput.focus();
        }

        // Close password modal
        function closePasswordModal() {
            passwordModal.classList.remove('active');
            setTimeout(() => {
                passwordModal.style.display = 'none';
            }, 300);
        }

        // Verify password
        function verifyPassword() {
            const enteredPassword = passwordInput.value.trim();
            
            if (enteredPassword === adminPassword) {
                closePasswordModal();
                showFinishConfirmation();
            } else {
                passwordError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
                
                // Shake animation for wrong password
                passwordInput.style.animation = 'none';
                setTimeout(() => {
                    passwordInput.style.animation = 'shake 0.5s';
                }, 10);
            }
        }

        // Add shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);

        // Handle image upload
        function handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    currentCandidateImage = e.target.result;
                    candidateImagePreview.innerHTML = `<img src="${e.target.result}" alt="Candidate Image">`;
                };
                reader.readAsDataURL(file);
            }
        }

        // Add candidate to the new election form
        function addCandidate() {
            const candidateName = candidateNameInput.value.trim();
            if (!candidateName) {
                showModal("Please enter a candidate name");
                return;
            }

            const candidateId = Date.now().toString();
            const candidateItem = document.createElement('div');
            candidateItem.className = 'candidate-item';

            // Use image if available, otherwise use first letter
            let photoContent = candidateName.charAt(0).toUpperCase();
            if (currentCandidateImage) {
                photoContent = `<img src="${currentCandidateImage}" alt="${candidateName}">`;
            }

            candidateItem.innerHTML = `
                <div class="candidate-photo">${photoContent}</div>
                <div class="candidate-name">${candidateName}</div>
                <button class="btn btn-danger btn-small remove-candidate" data-id="${candidateId}">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            candidateList.appendChild(candidateItem);
            candidateNameInput.value = '';
            candidateImageInput.value = '';
            candidateImagePreview.innerHTML = '<div class="placeholder">No Image</div>';
            currentCandidateImage = null;
            candidateNameInput.focus();

            // Add event listener to remove button
            candidateItem.querySelector('.remove-candidate').addEventListener('click', function () {
                candidateList.removeChild(candidateItem);
            });
        }

        // Create a new election
        function createElection() {
            const electionName = electionNameInput.value.trim();
            if (!electionName) {
                showModal("Please enter an election name");
                return;
            }

            const candidateItems = candidateList.querySelectorAll('.candidate-item');
            if (candidateItems.length === 0) {
                showModal("Please add at least one candidate");
                return;
            }

            const candidates = [];
            candidateItems.forEach(item => {
                const name = item.querySelector('.candidate-name').textContent;
                const photoElement = item.querySelector('.candidate-photo');
                let photo = null;

                // Check if candidate has an image
                const img = photoElement.querySelector('img');
                if (img) {
                    photo = img.src;
                }

                candidates.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: name,
                    photo: photo,
                    votes: 0
                });
            });

            const election = {
                id: Date.now().toString(),
                name: electionName,
                candidates: candidates,
                isActive: true,
                votes: [],
                lastVoteTime: 0
            };

            elections.push(election);
            localStorage.setItem('elections', JSON.stringify(elections));

            // Reset form
            electionNameInput.value = '';
            candidateList.innerHTML = '';

            renderElectionList();
            showSuccessModal('Election created successfully!');
        }

        // Render the list of elections
        function renderElectionList() {
            electionList.innerHTML = '';

            if (elections.length === 0) {
                electionList.innerHTML = '<p>No elections created yet. Create your first election!</p>';
                return;
            }

            elections.forEach(election => {
                const electionItem = document.createElement('li');
                electionItem.className = 'election-item';
                electionItem.innerHTML = `
                    <div>
                        <div class="election-name">${election.name}</div>
                        <div class="election-info">Candidates: ${election.candidates.length} | Votes: ${election.votes.length}</div>
                    </div>
                    <div class="election-actions">
                        <span class="election-status ${election.isActive ? 'status-active' : 'status-finished'}">
                            ${election.isActive ? 'Active' : 'Finished'}
                        </span>
                        <button class="btn view-election-btn" data-id="${election.id}">
                            ${election.isActive ? '<i class="fas fa-vote-yea"></i> Vote' : '<i class="fas fa-chart-bar"></i> Results'}
                        </button>
                        <div class="dropdown">
                            <button class="dropdown-btn"><i class="fas fa-ellipsis-v"></i></button>
                            <div class="dropdown-content">
                                <button class="delete-election" data-id="${election.id}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                                ${!election.isActive ? `
                                <button class="reactivate-election" data-id="${election.id}">
                                    <i class="fas fa-play"></i> Reactivate
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;

                electionList.appendChild(electionItem);

                // Add event listener to view/vote button
                electionItem.querySelector('.view-election-btn').addEventListener('click', function () {
                    const electionId = this.getAttribute('data-id');
                    viewElection(electionId);
                });

                // Add event listener to dropdown button
                const dropdownBtn = electionItem.querySelector('.dropdown-btn');
                dropdownBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const dropdown = this.closest('.dropdown');
                    dropdown.classList.toggle('active');
                });

                // Add event listener to delete button
                electionItem.querySelector('.delete-election').addEventListener('click', function (e) {
                    e.stopPropagation();
                    const electionId = this.getAttribute('data-id');
                    deleteElection(electionId);
                });

                // Add event listener to reactivate button
                const reactivateBtn = electionItem.querySelector('.reactivate-election');
                if (reactivateBtn) {
                    reactivateBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const electionId = this.getAttribute('data-id');
                        reactivateElection(electionId);
                    });
                }
            });
        }

        // View an election (either for voting or results)
        function viewElection(electionId) {
            currentElection = elections.find(e => e.id === electionId);
            if (!currentElection) return;

            if (currentElection.isActive) {
                // Show voting interface
                votingElectionName.textContent = currentElection.name;
                updateVotingInfo();
                renderCandidateCards();
                votingSection.style.display = 'block';
                leaderboard.style.display = 'none';
                showDashboard(false);

                // Check if voting is enabled
                checkVotingStatus();
            } else {
                // Show leaderboard
                showLeaderboard();
            }
        }

        // Render candidate cards for voting
        function renderCandidateCards() {
            candidatesGrid.innerHTML = '';
            selectedCandidate = null;

            currentElection.candidates.forEach(candidate => {
                const candidateCard = document.createElement('div');
                candidateCard.className = 'candidate-card';
                candidateCard.setAttribute('data-id', candidate.id);

                // Use image if available, otherwise use first letter
                let photoContent = candidate.name.charAt(0).toUpperCase();
                if (candidate.photo) {
                    photoContent = `<img src="${candidate.photo}" alt="${candidate.name}">`;
                }

                candidateCard.innerHTML = `
                    <div class="candidate-photo-large">${photoContent}</div>
                    <h3>${candidate.name}</h3>
                `;

                candidateCard.addEventListener('click', function () {
                    if (!isVotingEnabled) return;

                    // Deselect all other options
                    document.querySelectorAll('.candidate-card').forEach(card => {
                        card.classList.remove('selected');
                    });

                    // Select this option
                    this.classList.add('selected');
                    selectedCandidate = candidate.id;
                });

                candidatesGrid.appendChild(candidateCard);
            });
        }

        // Check voting status based on time
        function checkVotingStatus() {
            const now = Date.now();
            const timeSinceLastVote = now - currentElection.lastVoteTime;

            if (timeSinceLastVote < 5000 && currentElection.lastVoteTime !== 0) {
                // Still in cooldown period
                isVotingEnabled = false;
                nextVoteTime = currentElection.lastVoteTime + 5000;
                votingStatusEl.textContent = "Waiting";
                voteBtn.disabled = true;
            } else {
                // Voting is enabled
                isVotingEnabled = true;
                nextVoteTime = 0;
                votingStatusEl.textContent = "Ready";
                voteBtn.disabled = false;
            }
        }

        // Update next vote timer
        function updateNextVoteTimer() {
            if (nextVoteTime > 0) {
                const now = Date.now();
                const timeLeft = Math.ceil((nextVoteTime - now) / 1000);

                if (timeLeft > 0) {
                    nextVoteTimerEl.textContent = `${timeLeft}s`;
                } else {
                    nextVoteTimerEl.textContent = "0s";
                    isVotingEnabled = true;
                    votingStatusEl.textContent = "Ready";
                    voteBtn.disabled = false;
                }
            } else {
                nextVoteTimerEl.textContent = "0s";
            }
        }

        // Update voting info
        function updateVotingInfo() {
            totalVotesEl.textContent = currentElection.votes.length;
        }

        // Submit a vote
        function submitVote() {
            if (!selectedCandidate) {
                showModal("Please select a candidate to vote for");
                return;
            }

            if (!isVotingEnabled) {
                showModal("Please wait for the timer to finish before voting");
                return;
            }

            // Record the vote
            const candidate = currentElection.candidates.find(c => c.id === selectedCandidate);
            candidate.votes++;
            currentElection.votes.push(Date.now().toString());
            currentElection.lastVoteTime = Date.now();

            // Update localStorage
            localStorage.setItem('elections', JSON.stringify(elections));

            // Play beep sound
            makeBeep("eeee");

            // Show success message
            showSuccessModal('Your vote has been submitted successfully! Next vote available in 5 seconds.');

            // Disable voting and start countdown
            isVotingEnabled = false;
            nextVoteTime = Date.now() + 5000;
            votingStatusEl.textContent = "Waiting";
            voteBtn.disabled = true;

            // Reset selection
            selectedCandidate = null;
            document.querySelectorAll('.candidate-card').forEach(card => {
                card.classList.remove('selected');
            });

            // Update voting info
            updateVotingInfo();
        }

        // Custom beep sound function
        function makeBeep(word) {
            // Count how long the "eeee..." part is
            const match = word.match(/e+/);
            const length = match ? match[0].length : 1;

            // Duration in seconds (tweak multiplier to change how long it lasts)
            const duration = length * 0.1;

            // Create audio context
            const ctx = new (window.AudioContext || window.webkitAudioContext)();

            // Create oscillator (tone generator)
            const oscillator = ctx.createOscillator();
            oscillator.type = 'square';
            oscillator.frequency.value = 1000;

            // Create gain node (volume)
            const gainNode = ctx.createGain();
            gainNode.gain.value = 1.0;

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Start and stop oscillator
            oscillator.start();
            oscillator.stop(ctx.currentTime + duration);
        }

        // Show finish confirmation modal
        function showFinishConfirmation() {
            confirmationText.textContent = "Are you sure you want to finish this election? This action cannot be undone.";
            confirmationModal.classList.add('active');
            confirmationModal.style.display = 'flex';
        }

        // Handle confirmation modal actions
        function handleConfirmation() {
            if (confirmationText.textContent.includes("finish")) {
                finishElection();
            } else if (confirmationText.textContent.includes("delete")) {
                deleteElection(currentElection.id, true);
            } else if (confirmationText.textContent.includes("reset")) {
                resetAllData(true);
            }
            closeModal();
        }

        // Close modal
        function closeModal() {
            confirmationModal.classList.remove('active');
            setTimeout(() => {
                confirmationModal.style.display = 'none';
            }, 300);
        }

        // Close success modal
        function closeSuccessModal() {
            successModal.classList.remove('active');
            setTimeout(() => {
                successModal.style.display = 'none';
            }, 300);
        }

        // Show modal with message
        function showModal(message) {
            confirmationText.textContent = message;
            confirmationModal.classList.add('active');
            confirmationModal.style.display = 'flex';
        }

        // Show success modal with message
        function showSuccessModal(message) {
            successText.textContent = message;
            successModal.classList.add('active');
            successModal.style.display = 'flex';
        }

        // Finish the current election
        function finishElection() {
            if (!currentElection) return;

            currentElection.isActive = false;
            localStorage.setItem('elections', JSON.stringify(elections));

            showSuccessModal('Election finished! You can now view the results.');
            renderElectionList();

            showLeaderboard();
        }

        // Delete an election
        function deleteElection(electionId, confirmed = false) {
            if (!confirmed) {
                const election = elections.find(e => e.id === electionId);
                confirmationText.textContent = `Are you sure you want to delete the election "${election.name}"? This action cannot be undone.`;
                confirmationModal.classList.add('active');
                confirmationModal.style.display = 'flex';
                currentElection = election;
                return;
            }

            elections = elections.filter(e => e.id !== electionId);
            localStorage.setItem('elections', JSON.stringify(elections));

            renderElectionList();
            showSuccessModal('Election deleted successfully!');

            if (currentElection && currentElection.id === electionId) {
                showDashboard();
            }
        }

        // Reactivate an election
        function reactivateElection(electionId) {
            const election = elections.find(e => e.id === electionId);
            if (election) {
                election.isActive = true;
                localStorage.setItem('elections', JSON.stringify(elections));

                renderElectionList();
                showSuccessModal('Election reactivated successfully!');
            }
        }

        // Reset all data
        function resetAllData(confirmed = false) {
            if (!confirmed) {
                confirmationText.textContent = "Are you sure you want to reset all data? This will delete all elections and cannot be undone.";
                confirmationModal.classList.add('active');
                confirmationModal.style.display = 'flex';
                return;
            }

            elections = [];
            localStorage.removeItem('elections');

            renderElectionList();
            showSuccessModal('All data has been reset successfully!');
            showDashboard();
        }

        // Show leaderboard
        function showLeaderboard() {
            if (!currentElection) return;

            // Sort candidates by votes (descending)
            const sortedCandidates = [...currentElection.candidates].sort((a, b) => b.votes - a.votes);
            const totalVotes = currentElection.votes.length;

            // Update results info
            resultsTotalVotesEl.textContent = totalVotes;

            if (sortedCandidates.length > 0) {
                leadingCandidateEl.textContent = sortedCandidates[0].name;

                if (sortedCandidates.length > 1) {
                    voteDifferenceEl.textContent = `${sortedCandidates[0].votes - sortedCandidates[1].votes} votes`;
                } else {
                    voteDifferenceEl.textContent = "N/A";
                }
            } else {
                leadingCandidateEl.textContent = "-";
                voteDifferenceEl.textContent = "-";
            }

            leaderboardResults.innerHTML = '';

            sortedCandidates.forEach((candidate, index) => {
                const leaderboardItem = document.createElement('div');
                leaderboardItem.className = 'leaderboard-item';

                // Determine position icon
                let positionIcon = '';
                if (index === 0) {
                    positionIcon = '<i class="fas fa-crown"></i>';
                } else if (index === 1) {
                    positionIcon = '<i class="fas fa-medal"></i>';
                } else if (index === 2) {
                    positionIcon = '<i class="fas fa-award"></i>';
                } else {
                    positionIcon = `<i class="fas fa-hashtag"></i>`;
                }

                const votePercentage = totalVotes > 0 ? (candidate.votes / totalVotes * 100).toFixed(1) : 0;

                // Use image if available, otherwise use first letter
                let photoContent = candidate.name.charAt(0).toUpperCase();
                if (candidate.photo) {
                    photoContent = `<img src="${candidate.photo}" alt="${candidate.name}">`;
                }

                leaderboardItem.innerHTML = `
                    <div class="position position-${index + 1}">${positionIcon} ${index + 1}</div>
                    <div class="candidate-photo">${photoContent}</div>
                    <div style="flex-grow: 1;">
                        <div class="candidate-name">${candidate.name}</div>
                        <div class="vote-progress">
                            <div class="vote-progress-bar" style="width: ${votePercentage}%"></div>
                        </div>
                    </div>
                    <div class="vote-count"><i class="fas fa-vote-yea"></i> ${candidate.votes} votes (${votePercentage}%)</div>
                `;

                leaderboardResults.appendChild(leaderboardItem);
            });

            // Generate charts
            generateBarChart(sortedCandidates, totalVotes);
            generatePieChart(sortedCandidates, totalVotes);

            leaderboard.style.display = 'block';
            votingSection.style.display = 'none';
            showDashboard(false);
        }

        // Generate bar chart
        function generateBarChart(candidates, totalVotes) {
            barChartEl.innerHTML = '';

            candidates.forEach(candidate => {
                const percentage = totalVotes > 0 ? (candidate.votes / totalVotes * 100).toFixed(1) : 0;

                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.innerHTML = `
                    <div class="bar-label">${candidate.name}</div>
                    <div class="bar-value">
                        <div class="bar-fill" style="width: 0%" data-width="${percentage}%">${percentage}%</div>
                    </div>
                `;

                barChartEl.appendChild(bar);
            });

            // Animate bars after a short delay
            setTimeout(() => {
                document.querySelectorAll('.bar-fill').forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width;
                });
            }, 300);
        }

        // Generate pie chart with labels
        function generatePieChart(candidates, totalVotes) {
            pieChartEl.innerHTML = '';
            
            // Clear any existing labels
            const existingLabels = document.querySelectorAll('.pie-label');
            existingLabels.forEach(label => label.remove());

            if (totalVotes === 0) {
                pieChartEl.style.background = '#e9ecef';
                pieCenterEl.textContent = 'No Votes';
                return;
            }

            let gradientString = '';
            let currentPercent = 0;
            const colors = [
                '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#f8961e',
                '#7209b7', '#06d6a0', '#118ab2', '#ef476f', '#ffd166'
            ];

            // Calculate angles for labels
            candidates.forEach((candidate, index) => {
                const percentage = (candidate.votes / totalVotes * 100);
                const color = colors[index % colors.length];

                gradientString += `${color} ${currentPercent}% ${currentPercent + percentage}%`;
                if (index < candidates.length - 1) {
                    gradientString += ', ';
                }

                // Calculate label position (middle of the segment)
                const middleAngle = (currentPercent + percentage / 2) * 3.6; // Convert to degrees
                const radian = (middleAngle - 90) * (Math.PI / 180); // Convert to radians, offset by -90°
                
                // Position on the circle (radius = 40%)
                const radius = 40;
                const x = 50 + radius * Math.cos(radian);
                const y = 50 + radius * Math.sin(radian);

                // Create label
                if (percentage > 5) { // Only show label if segment is large enough
                    const label = document.createElement('div');
                    label.className = 'pie-label';
                    label.textContent = candidate.name.charAt(0); // Show first letter
                    label.title = `${candidate.name}: ${candidate.votes} votes (${percentage.toFixed(1)}%)`;
                    label.style.left = `${x}%`;
                    label.style.top = `${y}%`;
                    label.style.transform = 'translate(-50%, -50%)';
                    
                    // Add to pie chart container
                    pieChartEl.parentElement.appendChild(label);
                }

                currentPercent += percentage;
            });

            pieChartEl.style.background = `conic-gradient(${gradientString})`;
            pieCenterEl.textContent = `${totalVotes}\nVotes`;
        }

        // Show or hide dashboard
        function showDashboard(show = true) {
            const dashboard = document.querySelector('.dashboard');
            dashboard.style.display = show ? 'grid' : 'none';

            if (show) {
                votingSection.style.display = 'none';
                leaderboard.style.display = 'none';
                currentElection = null;
            }
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);