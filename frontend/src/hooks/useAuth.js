//small hook so that we can easily access auth context in any component without importing useContext and AuthContext every time
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default useAuth;