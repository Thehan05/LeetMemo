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
            variables: { username: "thehan00000000000001" }
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
});
