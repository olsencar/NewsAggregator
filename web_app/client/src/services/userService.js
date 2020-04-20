import axios from 'axios';

export default {
    getUser: async (uid) => {
        const res = await axios.get(`/api/user/${uid}`);
        return res.data || null;
    },

    addComment: async (uid, commentData) => {
        try {
            await axios.post(`/api/user/${uid}/addComment`, {
                data: commentData
            });
        } catch (err) {
            console.log(err);
        }
    },

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