import { Route, Routes } from "react-router";
import { Layout } from "./pages/Layout";
import Admin from "./pages/Admin";
import { AdminRoute } from "./utils/AdminRoute";
import AlbumGrid from "./pages/AlbumGrid";
import { ImageGrid } from "./pages/ImageGrid";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AlbumGrid />} />
          <Route path="/albums/:id" element={<ImageGrid />} />
          {/* <Route path="about" element={<About />} /> */}
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
