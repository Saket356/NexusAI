import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
  name: "user",

  initialState: {
    userData: null,
  },

  reducers: {
    // Setter
    setUserdata: (state, action) => {
      state.userData = action.payload
    }
  }
})

// Export action
export const { setUserdata } = userSlice.actions

// Export reducer imported as userreducer in store.js
export default userSlice.reducer