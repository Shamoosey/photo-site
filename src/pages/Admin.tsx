import { usePhotos } from "../hooks/usePhotos";
import CreateImageForm from "../components/CreateImageForm";
import EditableImageList from "../components/EditableImageList";

function Admin() {
  const { images, refetch } = usePhotos(undefined);

  return (
    <div className="flex mt-8 md:mt-20 px-4 md:px-0">
      <form className="flex flex-col w-full max-w-3xl mx-auto md:mx-0">
        <h1 className="text-xl">Images</h1>
        <CreateImageForm refetch={refetch} />
        <EditableImageList images={images} refetch={refetch} />
      </form>
    </div>
  );
}

export default Admin;
