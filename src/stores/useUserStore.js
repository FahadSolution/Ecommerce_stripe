import { create } from "zustand";
import axios from "../lib/axios.js";
import {toast} from "react-hot-toast";

export const useUserStore = create ((set,get)=>({
    user:null,
    loading:false,
    checkingAuth:true,

    signup: async ({name,email,password,confirmPassword}) => {
        set({ loading:true});
        if(password !== confirmPassword){
            set({loading:false});
            return toast.error("Passwords do not match");
        }
        try{
            const res = await axios.post("/auth/signup",{name,email,password});
            set({user:res.data,loading:false});
        }catch(error){
            console.log(error.response.data);
            set({loading :false});
            toast.error(error.response.data.message ||"An error occurred")
        };
    },
    login: async ({ email, password }) => {
        set({ loading: true });
        try {
            const res = await axios.post("/auth/login", { email, password });
            set({ user: res.data, loading: false });
            toast.success("Login successful!");
        } catch (error) {
        set({ loading: false });
        const errorMsg = error.response?.data?.message || "Login failed";
        console.log("📢 About to show toast with message:", errorMsg); // Debug
        toast.error(errorMsg);
    }
    },
    logout: async () =>{
        try{
            await axios.post("/auth/logout");
            set({ user :null});
            toast.success("Logout successfully")
        }catch(error){
            toast.error(error.response?.data?.message || "An error occurred during logout");
        }
    },

    checkAuth: async ()=>{
        set({ checkingAuth:true});
        try{
            const response = await axios.get("/auth/profile");
            set({ user: response.data, checkingAuth:false});
        }catch(error){
            console.log(error.message)
            set({ checkingAuth:false, user:null});
        }
    },
    refreshToken: async() => {
        if(get().checkingAuth) return;
        set({ checkingAuth:true})
        try{
            const response = await axios.post("/auth/refresh-token");
            set({checkingAuth:false});
            return response.data;
        }catch(error){
            set({user:null,checkingAuth:false});
            throw error;
        }
    },
}));

// Axios intercepter for token refresh

// let refreshPromise = null;

// axios.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;
//         if(error.response?.status === 401 && !originalRequest._retry){
//             originalRequest._retry = true;
//             try{
//                 if(refreshPromise){
//                     await refreshPromise;
//                     return axios(originalRequest);
//                 }
//                 //Start a new refresh process
//                 refreshPromise = useUserStore.getState().refreshToken();
//                 await refreshPromise;
//                 refreshPromise = null;

//                 return axios(originalRequest);
//             }catch(refreshError){
//                 useUserStore.getState().logout();
//                 return Promise.reject(refreshError)
//             }
//         }
//         return Promise.reject(error);
//     }
// )

let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only retry login/signup/refresh if 401
        const isAuthEndpoint = originalRequest.url.includes('/auth/login') || 
                               originalRequest.url.includes('/auth/signup') ||
                               originalRequest.url.includes('/auth/refresh-token');

        // Don't retry auth endpoints - just reject
        if (isAuthEndpoint) {
            return Promise.reject(error);
        }

        // For other endpoints, retry if 401
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (refreshError) {
                useUserStore.getState().logout();
                refreshPromise = null;
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);