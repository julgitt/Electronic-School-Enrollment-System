import {BrowserRouter as Router} from 'react-router-dom';

import {Footer} from '../components/modules/Footer';
import {Header} from '../components/modules/Header';

import AppRoutes from './AppRoutes.tsx';
import {CandidateProvider} from "../shared/providers/candidateProvider.tsx";
import {ErrorProvider} from '../shared/providers/errorProvider.tsx';

function App() {
    return (
        <ErrorProvider>
            <CandidateProvider>
                <Router>
                    <Header/>
                    <main className="main-content">
                        <AppRoutes/>
                    </main>
                    <Footer/>
                </Router>
            </CandidateProvider>
        </ErrorProvider>

    );
}

export default App;
