import { useEffect, useState } from "react"
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from "react-redux"
import { useSendLogoutMutation } from '../features/auth/authApiSlice'
import { setOpen, setType } from "../features/modal/modalSlice"
import useAuth from '../hooks/useAuth'
import Modal from '../features/modal/Modal'
import { MODAL } from '../constants/constants'

const Layout = () => {
    const [show, setShow] = useState(false)
    const [lastScrollY, setLastScrollY] = useState(0)
  
    const { username, role } = useAuth()

    const dispatch = useDispatch()

    const navigate = useNavigate()

    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') { 
              if (window.scrollY > lastScrollY) { // if scroll down hide the navbar
                setShow(false)
              } else { // if scroll up show the navbar
                if (window.scrollY > 104) {
                  setShow(true)
                }
              }
              setLastScrollY(window.scrollY)
            }
          }
  
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar)

            return () => {
                window.removeEventListener('scroll', controlNavbar)
            }
        }
    }, [lastScrollY])

    const clickHandle = (t) => {
        dispatch(setType({ type: t }))
        dispatch(setOpen({ open: true }))
    }

    return (
        <>
            <Modal />
            <header className={`main-header__container ${show 
                    && 'main-header-scroll'}`}>
                <Link to='/'>
                    <h1 className="main-header__title">KeeBlog</h1>
                </Link>
                <nav className="main-header__nav">
                    {   !role
                        ? <>
                            <button className="login__button" onClick={() => clickHandle(MODAL.TYPE.SignIn)}>
                                Sign In</button>
                            <button className="signup__button" onClick={() => clickHandle(MODAL.TYPE.SignUp)}>
                                Sign Up</button>
                        </>
                        : <>
                            {username}
                            <button className="login__button" onClick={() => navigate('/write')}>Write</button>
                            <button className="login__button" onClick={sendLogout}>Log off</button>
                        </>
                    }
                </nav>
            </header>
            <div className='main__container'>
                <Outlet context={[show, setShow]} />
            </div>
        </>
    )
}

export default Layout