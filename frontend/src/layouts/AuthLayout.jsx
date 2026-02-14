import React from 'react'
import { useState } from 'react'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'

const AuthLayout = () => {
    const [toggle, setToggle] = useState(false)
  return (
    <div>
        {
            toggle ? <Login setToggle={setToggle} /> : <SignUp setToggle={setToggle} />
        }
    </div>
  )
}

export default AuthLayout