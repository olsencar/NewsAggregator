import axios from 'axios';

export default {
    getComments: async (pid, sid) => {
        let res = await axios.get(`/api/comments/byId/${pid}-${sid}`);
        return res.data || null;
    },
    addComment: async (comment_data) => {
        await axios.post(`/api/comments/add`, comment_data).then(function (response) {
            console.log('2. Just added the comment');
        })
        .catch(function (error) {
            console.log(error);
        });
    }
}