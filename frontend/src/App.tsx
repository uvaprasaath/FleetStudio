
import { Routes, Route } from 'react-router-dom';
import { CommitPage } from './pages/CommitPage/commit.page';



function App() {
  return (
    <Routes>
      <Route path="/repositories/:owner/:repository/commit/:commitSHA" element={<CommitPage />} />
    </Routes>
  );
}

export default App;
