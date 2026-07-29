import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import { Layout } from "./pages/Layout";
import Admin from "./pages/Admin";
import About from "./pages/About";
import { AdminRoute } from "./utils/AdminRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
