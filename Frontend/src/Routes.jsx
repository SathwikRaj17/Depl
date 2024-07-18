import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import Stream from './Pages/Stream'
import Results from './Pages/Results';
const RoutesComponent = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/error" element={<h1>Sorry Backend is down</h1>} />
                <Route path="/check" element={<h1>Testing</h1>}/>
                <Route path="/stream" element={<Stream />} />
                <Route path="/results" element={<Results />}/>
            </Routes>
        </Router>
    );
}

export default RoutesComponent;
