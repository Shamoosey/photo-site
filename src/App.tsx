import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "./pages/Layout";
import Admin from "./pages/Admin/Admin";
import { AdminRoute } from "./utils/AdminRoute";
import AlbumGrid from "./pages/AlbumGrid";
import { ImageGrid } from "./pages/ImageGrid";
import EditAlbum from "./pages/Admin/EditAlbum";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AlbumGrid />} />
          <Route path="/about" element={<About />} />
          <Route path="/albums/:id" element={<ImageGrid />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="admin/editAlbum/:id"
            element={
              <AdminRoute>
                <EditAlbum />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
