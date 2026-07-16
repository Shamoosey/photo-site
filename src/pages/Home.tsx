import PhotoGrid from "../components/PhotoGrid";
import { usePhotoCollection } from "../hooks/usePhotos";

export default function Home() {
  const { photoCollection, isLoading, error } = usePhotoCollection("home", undefined);
  return (
    <div className="flex">
      {!isLoading && photoCollection ? (
        <PhotoGrid collection={photoCollection} />
      ) : (
        <div>
          <div>LOADING</div>
          <div>{error}</div>
        </div>
      )}
    </div>
  );
}
