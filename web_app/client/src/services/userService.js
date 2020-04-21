import axios from 'axios';

export default {
    // Gets user information, such as comments, upvotes etc.
    getUser: async (uid) => {
        const res = await axios.get(`/api/user/${uid}`);
        return res.data || null;
    },

    // Adds a comment for the user
    addComment: async (uid, commentData) => {
        try {
            await axios.post(`/api/user/${uid}/addComment`, {
                data: commentData
            });
        } catch (err) {
            console.log(err);
        }
    },

    // Adds an upvote for the article group
    upvote: async (uid, pid, sid, voteDirection) => {
        try {
            return await axios.post(`/api/user/${uid}/upvote`, {
                data: {
                    primary_id: pid,
                    secondary_id: sid,
                    update_time: Date.now(),
                    voteDirection: voteDirection
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
}