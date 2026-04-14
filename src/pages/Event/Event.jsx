import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function Event (){

const { user } = useAuth();
const navigate = useNavigate();

const handleRegister = () => {
  if (!user) {
    navigate('/home/login');
    return;
  }
  //logica registro del evento
};
    return(
        <main>
            <p>Info de evento</p>
        </main>
    )
}

export default Event;