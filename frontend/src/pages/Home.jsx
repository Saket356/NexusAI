import React from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { FcGoogle } from "react-icons/fc"
import { useDispatch, useSelector } from 'react-redux'
import { setUserdata } from '../redux/userSlice'
import SideBar from '../components/SideBar'
import ChatArea from '../components/ChatArea'
import Artifact from '../components/Artifact'

const Home = () => {

    const { userData } = useSelector(state => state.user)
    const dispatch = useDispatch()

    const handleLogin = async (token) => {
        try {
            const { data } = await api.post("/api/auth/login", { token })
            dispatch(setUserdata(data))
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    const googleLogin = async () => {
        const data = await signInWithPopup(auth, googleProvider)
        const token = await data.user.getIdToken()
        console.log(token)
        await handleLogin(token)
        console.log(data)
    }

    return (
        <div className="h-screen w-full flex bg-[#0d0d14] text-white overflow-hidden">
            <SideBar />
            <ChatArea />
            <Artifact />
            {!userData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-6 md:p-7 flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">Welcome to CortexAI</h2>
                            <p className="text-[13px] text-slate-500">Please login to continue using the app.</p>
                        </div>

                        <button
                            onClick={googleLogin}
                            className="w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 hover:from-indigo-400 hover:to-violet-600 active:from-indigo-600 active:to-violet-800 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-150 cursor-pointer"
                        >
                            <FcGoogle size={15} />
                            Continue with Google
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home