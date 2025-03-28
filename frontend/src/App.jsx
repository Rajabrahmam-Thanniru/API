import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Doc from "./Doc";
import Get_Data from "./Get_Data";
import Post_Data from "./Post_data";
import Delete_data from "./Delete_data";
import Update_data from "./Update_data";
import Register from "./Register";
function ProtectedRoute({ element }) {
  const isAuthenticated = localStorage.getItem("authToken");
  return isAuthenticated ? element : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Doc />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/get-data"
          element={<ProtectedRoute element={<Get_Data />} />}
        />
        <Route
          path="/post-data"
          element={<ProtectedRoute element={<Post_Data />} />}
        />
        <Route
          path="/delete-data"
          element={<ProtectedRoute element={<Delete_data />} />}
        />
        <Route
          path="/update-data"
          element={<ProtectedRoute element={<Update_data />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
