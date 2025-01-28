import {BrowserRouter as Router} from 'react-router-dom';

import {Footer} from '../components/modules/Footer';
import {Header} from '../components/modules/Header';

import AppRoutes from './AppRoutes.tsx';
import {ErrorProvider} from '../shared/providers/errorProvider.tsx';
import {UserProvider} from "../shared/providers/userProvider.tsx";

function App() {
    return (
        <ErrorProvider>
            <UserProvider>
                <Router>
                    <div className="content">
                        <Header/>
                        <main className="main-content">
                            <AppRoutes/>
                        </main>
                        <Footer/>
                    </div>

                </Router>
            </UserProvider>
        </ErrorProvider>

    );
}

export default App;
