import { BrowserRouter as Router } from 'react-router-dom';

import { Footer } from '../components/modules/Footer';
import { Header } from '../components/modules/Header';

import AppRoutes from './AppRoutes.tsx';

function App() {
    return (
        <Router>
            <Header />
            <main className="main-content">
                <AppRoutes />
            </main>
            <Footer />
        </Router>
    );
}

export default App;
