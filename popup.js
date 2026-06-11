document.addEventListener('DOMContentLoaded', function() {
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

            variables: { username: "thehan00000000000001", year: 2026 }
        })
    })
    .then(response => response.json())

    .then(data => {
        const matchedUser = data.data?.matchedUser;

        if (!matchedUser) {
            document.getElementById("status").textContent = "Profile not found.";
            return;
        }

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
            variables: { username: "thehan00000000000001", year: 2026 }
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

    
});


