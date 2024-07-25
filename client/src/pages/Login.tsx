import {useState} from 'react';

function Login() {
    const [message] = useState<String | null>(null)
    return (
        <div>
            <section id="form">
                <form method="POST">
                    <h1>Logowanie</h1>
                    {message && (
                        <div className="form-message form-message-error">
                            {message}
                        </div>
                    )}
                    <div className="form-input-group">
                        <input type="text" name="txtUser" className="form-input" autoFocus
                               placeholder="email" required/>
                    </div>
                    <div className="form-input-group">
                        <input type="password" name="txtPwd" className="form-input" autoFocus placeholder="Hasło"
                               required/>
                    </div>
                    <button type="submit">Zaloguj</button>
                    <p className="form-text">
                        <a href="#" className="form-link">Przypomnij hasło</a>
                    </p>
                    <p className="form-text">
                        <a href="/signup" id="linkCreateAccount">Jeszcze nie założyłeś konta?</a>
                    </p>
                </form>
            </section>
        </div>
    );
}

export default Login;
