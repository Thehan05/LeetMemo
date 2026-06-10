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
                    submitStatsGlobal {
                        acSubmissionNum { difficulty count }
                    }
                }
            }`,
            variables: { username: "thehan00000000000001" }
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Error fetching data:", error));
});
