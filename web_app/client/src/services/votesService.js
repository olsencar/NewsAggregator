import axios from 'axios';

export default {
    getVotes: async (pid, sid) => {
        let res = await axios.get(`/api/votes/byId/${pid}-${sid}`);
        return res.data || null;
    },
    addVotes: async (pid, sid, left_votes, right_votes) => {
        let vote_data = {pid: pid, sid: sid, left_votes:left_votes, right_votes:right_votes}
        await axios.post(`/api/votes/upvote`, vote_data).then(function (response) {
            console.log('Vote Added.');
        })
        .catch(function (error) {
            console.log(error);
        });
    },
    //effectively the same function as addVotes above, 
    //but differentiated for API clarity => will combine into a single `updateVotes`
    removeVotes: async (pid, sid, left_votes, right_votes) => {
        let vote_data = {pid: pid, sid: sid, left_votes:left_votes, right_votes:right_votes}
        await axios.post(`/api/votes/upvote`, vote_data).then(function (response) {
            console.log('Vote Removed.');
        })
        .catch(function (error) {
            console.log(error);
        });
    }
}