import { Outlet, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';

const PrivateRoutes = () => {
    const { state } = useContext(AuthContext);

    let auth = {'isLogged' : state.isLoggedIn}
    return(
        auth.isLogged ? <Outlet/> : <Navigate to="/login"/>
    )
}

export default PrivateRoutes