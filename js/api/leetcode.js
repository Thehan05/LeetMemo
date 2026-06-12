const GRAPHQL_URL = "https://leetcode.com/graphql";

async function fetchGraphQL(query, variables) {
    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        throw new Error(`LeetCode request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors?.length) {
        throw new Error(result.errors[0].message);
    }

    return result.data;
}

export async function fetchProfile(username) {
    const data = await fetchGraphQL(
        `query userProfile($username: String!) {
            allQuestionsCount {
                difficulty
                count
            }
            matchedUser(username: $username) {
                username
                profile {
                    ranking
                    userAvatar
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }`,
        { username }
    );

    if (!data?.matchedUser) {
        return null;
    }

    return {
        ...data.matchedUser,
        allQuestionsCount: data.allQuestionsCount ?? []
    };
}

export async function fetchCalendar(username, year) {
    const data = await fetchGraphQL(
        `query userProfileCalendar(
            $username: String!,
            $year: Int!
        ) {
            matchedUser(username: $username) {
                userCalendar(year: $year) {
                    streak
                    totalActiveDays
                    submissionCalendar
                }
            }
        }`,
        { username, year }
    );

    const calendar = data?.matchedUser?.userCalendar;

    if (!calendar) {
        throw new Error("Activity calendar is unavailable.");
    }

    return calendar;
}

export async function fetchRecentSubmissions(username, limit = 5) {
    const data = await fetchGraphQL(
        `query recentAcSubmissions(
            $username: String!,
            $limit: Int!
        ) {
            recentAcSubmissionList(
                username: $username,
                limit: $limit
            ) {
                id
                title
                titleSlug
                timestamp
            }
        }`,
        { username, limit }
    );

    return data?.recentAcSubmissionList ?? [];
}
