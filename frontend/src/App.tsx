
import { Routes, Route } from 'react-router-dom';
import { CommitPage } from './pages/CommitPage/commit.page';
import { NotFoundPage } from './pages/NotFoundPage/notfound.page';

function App() {
  return (
    <Routes>
      <Route path="/repositories/:owner/:repository/commit/:commitSHA" element={<CommitPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
