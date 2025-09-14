import { LogIn } from 'lucide-react'

const ButtonLogin = ()=> {
    return (
        <button className='flex px-2'>
            <LogIn size={24}/>
            <span className='px-2 hover:text-red-400'>Login</span>
        </button>
    );
};

export default ButtonLogin;