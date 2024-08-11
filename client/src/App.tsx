import { BrowserRouter as Router } from 'react-router-dom';
import './assets/css/styles.css';
import { Footer } from './components/organisms/Footer';
import { Header } from './components/organisms/Header';
import AppRoutes from './routes/AppRoutes';

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
