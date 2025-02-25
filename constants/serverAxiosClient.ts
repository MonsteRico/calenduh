import axios from "axios";
// Set config defaults when creating the instance
const server = axios.create({
	baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
});
export default server;
