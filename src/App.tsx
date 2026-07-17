import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import About from "./pages/About";
import AdminCMS from "./pages/AdminCMS";
import RequireAdmin from "./components/RequireAdmin";
import { Layout } from "./pages/Layout";

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
              <RequireAdmin>
                <AdminCMS />
              </RequireAdmin>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
