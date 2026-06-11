document.addEventListener('DOMContentLoaded', function() {
    
    function loadProfile(username) {
        document.getElementById("profile-setup").style.display = "none";
        document.getElementById("profile-dashboard").style.display = "block";

        fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `query userProfile($username: String!) {
                    matchedUser(username: $username) {
                        username
                        profile {
                            ranking
                        }
                        submitStatsGlobal {
                            acSubmissionNum { difficulty count }
                        }
                    }
                }`,

                variables: { username: username, year: 2026 }
            })
        })
        .then(response => response.json())

        .then(data => {
            const matchedUser = data.data?.matchedUser;

            if (!matchedUser) {
                document.getElementById("status").textContent = "Profile not found.";
                document.getElementById("profile-setup").style.display = "block";
                document.getElementById("profile-dashboard").style.display = "none";
                return;
            }

            chrome.storage.local.set({ username: username });

            const stats = matchedUser.submitStatsGlobal.acSubmissionNum;

            const getCount = difficulty => {
                return stats.find(item => item.difficulty === difficulty)?.count ?? 0;
            };

            document.getElementById("status").textContent = "";
            document.getElementById("username").textContent = matchedUser.username;
            document.getElementById("ranking").textContent = matchedUser.profile?.ranking ?? "-";
            document.getElementById("easy-count").textContent = getCount("Easy");
            document.getElementById("medium-count").textContent = getCount("Medium");
            document.getElementById("hard-count").textContent = getCount("Hard");
        })
        
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("status").textContent = "Could not load profile.";
        });

        fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `query userProfileCalendar($username: String!, $year: Int!) {
                        matchedUser(username: $username) {
                            userCalendar(year: $year) {
                                streak
                                totalActiveDays
                                submissionCalendar
                            }
                        }
                    }`,
                variables: { username: username, year: 2026 }
            })
        })
        .then(response => response.json())

        .then(data => {
            const matchedUser = data.data?.matchedUser;

            if (!matchedUser) {
                document.getElementById("status").textContent = "Profile not found.";
                return;
            }

            const calendar = matchedUser.userCalendar;

            document.getElementById("streak").textContent = calendar.streak;
            document.getElementById("active-days").textContent = calendar.totalActiveDays;    

            const calendarData = JSON.parse(calendar.submissionCalendar);
            const heatmap = document.getElementById("heatmap");

            const today = new Date();
            const oneDay = 24 * 60 * 60 * 1000;
            const yearStart = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
            const totalDays = Math.floor((today - yearStart) / oneDay) + 1;

            for(let i = 0; i < totalDays; i++) {
                const date = new Date(yearStart.getTime() + i * oneDay);
                const timestamp = Math.floor(date.getTime() / 1000);
                const count = calendarData[timestamp] ?? 0;

                const cell = document.createElement("div");
                if (count === 0) {
                    cell.style.backgroundColor = "#2d2d2d";
                } else if (count <= 2) {
                    cell.style.backgroundColor = "#0e4429";
                } else if (count <= 5) {
                    cell.style.backgroundColor = "#006d32";
                } else {
                    cell.style.backgroundColor = "#26a641";
                }
                heatmap.appendChild(cell);
            }
        })
        
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("status").textContent = "Could not load profile.";
        });

        fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `query recentAcSubmissions($username: String!, $limit: Int!) {
                    recentAcSubmissionList(username: $username, limit: $limit) {
                        id
                        title
                        titleSlug
                        timestamp
                    }
                }`,
                variables: { username: username, limit: 5 }
            })
        })
        .then(response => response.json())
        .then(data => {
            const submissions = data.data?.recentAcSubmissionList || [];
            const submissionsList = document.getElementById("recent-submissions");
            submissionsList.innerHTML = "";
            submissions.forEach(sub => {
                const item = document.createElement("li");
                item.textContent = `${sub.title} - ${timeAgo(sub.timestamp)}`;
                submissionsList.appendChild(item);
            });

            document.getElementById("problem-select").innerHTML = submissions.map(sub =>
                `<option value="${sub.titleSlug}">${sub.title}</option>`
            ).join("");
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }

    chrome.storage.local.get("username", function(result) {
        if (result.username) {
            loadProfile(result.username);
        } else {
            document.getElementById("profile-setup").style.display = "block";
        }
    });

    document.getElementById("load-profile").addEventListener("click", function() {
        const username = document.getElementById("username-input").value.trim();
        if (username) {
            loadProfile(username);
        } else {
            document.getElementById("status").textContent = "Please enter a valid username.";
        }
    });
    
    document.getElementById("change-user").addEventListener("click", function() {
        chrome.storage.local.remove("username");
        document.getElementById("profile-setup").style.display = "block";
        document.getElementById("profile-dashboard").style.display = "none";
    });


    document.getElementById("save-notes").addEventListener("click", function() {
        const problemSlug = document.getElementById("problem-select").value;
        const notes = document.getElementById("notes-input").value.trim();
        if (problemSlug && notes) {
            chrome.storage.local.get("notes", function(result) {
                const allNotes = result.notes || {};
                allNotes[problemSlug] = notes;
                chrome.storage.local.set({ notes: allNotes }, function() {
                    document.getElementById("notes-status").textContent = "Notes saved!";
                    setTimeout(() => {
                        document.getElementById("notes-status").textContent = "";
                    }, 2000);
                });
            });
        } else {
            document.getElementById("notes-status").textContent = "Please select a problem and enter some notes.";
        }
    });

    document.getElementById("problem-select").addEventListener("change", function() {
        const slug = this.value;
        chrome.storage.local.get("notes", function(result) {
            const allNotes = result.notes || {};
            document.getElementById("notes-input").value = allNotes[slug] || "";
        });
    });

    function timeAgo(timestamp) {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / 60);
        const hours = Math.floor(diff / 3600);
        const days = Math.floor(diff / 86400);
        const months = Math.floor(diff / 2592000);
        const years = Math.floor(diff / 31536000);

        if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
        else if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        else if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        else if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        else if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        else return "Just now";
    }
});

