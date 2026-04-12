import "../Community/Community.module.css";

function Login(){

    /*try {
  const response = await authApi.login({ email, password });
  login(response.data);
} catch (error) {
  const status = error.response?.status;

  if (status === 401 || status === 403) {
    setServerErrors({ password: "Contraseña incorrecta" });
  } else if (status === 404) {
    setServerErrors({ email: "No existe ninguna cuenta con este email" });
  } else {
    setServerErrors({ _global: "Error inesperado. Inténtalo de nuevo." });
  }
}*/
    return(
        <main>
            <p>Registro de Login</p>
        </main>
    )
}

export default Login;