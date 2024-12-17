import {BrowserRouter as Router} from 'react-router-dom';

import {Footer} from '../components/modules/Footer';
import {Header} from '../components/modules/Header';

import AppRoutes from './AppRoutes.tsx';
import {ErrorProvider} from '../shared/providers/errorProvider.tsx';

function App() {
    return (
        <ErrorProvider>
            <Router>
                <Header/>
                <main className="main-content">
                    <AppRoutes/>
                </main>
                <Footer/>
            </Router>
        </ErrorProvider>

    );
}

export default App;
