import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaTrash, FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";
import * as CmsService from "../services/cms.service";
import type { ImageCollection } from "../types/ImageCollection";

export default function AdminCMS() {
  const [collections, setCollections] = useState<ImageCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateCollectionExpanded, setIsCreateCollectionExpanded] = useState(false);

  // Create collection form state
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [createCollectionError, setCreateCollectionError] = useState<string | null>(null);
  const [createCollectionStatus, setCreateCollectionStatus] = useState<string | null>(null);

  // Add image form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [imageMetaData, setImageMetaData] = useState("");
  const [addImageError, setAddImageError] = useState<string | null>(null);
  const [addImageStatus, setAddImageStatus] = useState<string | null>(null);

  // Edit mode state
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editImageCaption, setEditImageCaption] = useState("");
  const [editImageMetaData, setEditImageMetaData] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editCollectionDescription, setEditCollectionDescription] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollections() {
      setIsLoading(true);

      try {
        const data = await CmsService.getPhotoCollections();
        setCollections(data);
        if (data.length > 0) {
          setSelectedCollectionId(data[0].id);
        }
      } catch {
        setAddImageError("Unable to load collections at this time.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCollections();
  }, []);

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId),
    [collections, selectedCollectionId],
  );

  async function handleDeleteImage(imageId: string) {
    if (!selectedCollection) {
      setAddImageError("No collection selected.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this image from the selected collection? This action cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setAddImageStatus(null);
    setAddImageError(null);

    try {
      await CmsService.deleteImage(selectedCollection.id, imageId);
      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === selectedCollection.id
            ? {
                ...collection,
                images: collection.images.filter((image) => image.id !== imageId),
              }
            : collection,
        ),
      );
      setAddImageStatus("Image deleted successfully.");
    } catch {
      setAddImageError("Unable to delete the image.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCollection() {
    if (!selectedCollection) {
      setAddImageError("No collection selected.");
      return;
    }

    const confirmed = window.confirm(
      `Delete the collection "${selectedCollection.name}" and all of its photos? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setAddImageStatus(null);
    setAddImageError(null);

    try {
      await CmsService.deletePhotoCollection(selectedCollection.id);
      setCollections((prev) => prev.filter((collection) => collection.id !== selectedCollection.id));
      setSelectedCollectionId((prevSelected) => {
        const remainingCollections = collections.filter((collection) => collection.id !== prevSelected);
        return remainingCollections.length > 0 ? remainingCollections[0].id : "";
      });
      setAddImageStatus("Collection deleted successfully.");
    } catch {
      setAddImageError("Unable to delete the collection.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditImage(imageId: string, caption: string, metaData: string) {
    setEditError(null);
    setEditStatus(null);
    setIsLoading(true);

    try {
      const updatedImage = await CmsService.editPhoto(imageId, caption, metaData);
      setCollections((prev) =>
        prev.map((col) =>
          col.id === selectedCollectionId
            ? {
                ...col,
                images: col.images.map((img) => (img.id === imageId ? updatedImage : img)),
              }
            : col,
        ),
      );
      setEditingImageId(null);
      setEditStatus("Image updated successfully.");
    } catch {
      setEditError("Unable to update the image.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditCollection(collectionId: string, description: string) {
    if (!selectedCollection) {
      setEditError("No collection selected.");
      return;
    }

    setEditError(null);
    setEditStatus(null);
    setIsLoading(true);

    try {
      const updatedCollection = await CmsService.editPhotoCollection(
        collectionId,
        selectedCollection.name,
        description,
      );
      setCollections((prev) =>
        prev.map((col) => (col.id === collectionId ? updatedCollection : col)),
      );
      setEditingCollectionId(null);
      setEditStatus("Collection updated successfully.");
    } catch {
      setEditError("Unable to update the collection.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateCollectionStatus(null);
    setCreateCollectionError(null);

    if (!collectionName.trim()) {
      setCreateCollectionError("Collection name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const created = await CmsService.createPhotoCollection({
        name: collectionName.trim(),
        description: collectionDescription.trim(),
      });

      setCollections((prev) => [created, ...prev]);
      setSelectedCollectionId(created.id);
      setCollectionName("");
      setCollectionDescription("");
      setCreateCollectionStatus("Collection created successfully.");
    } catch {
      setCreateCollectionError("Unable to create a new collection.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddImageStatus(null);
    setAddImageError(null);

    if (!selectedCollectionId) {
      setAddImageError("Please select a collection for the image.");
      return;
    }

    if (!imageFile) {
      setAddImageError("Please select an image file to upload.");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        try {
          const createdImage = await CmsService.createImage(selectedCollectionId, {
            imageBase64: base64,
            caption: imageCaption.trim() || undefined,
            metaData: imageMetaData.trim() || undefined,
          });

          setCollections((prev) =>
            prev.map((collection) =>
              collection.id === selectedCollectionId
                ? { ...collection, images: [...collection.images, createdImage] }
                : collection,
            ),
          );

          setImageFile(null);
          setImageCaption("");
          setImageMetaData("");
          setAddImageStatus("Image added to the selected collection.");
        } catch {
          setAddImageError("Unable to add the image to the collection.");
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setAddImageError("Failed to read the image file.");
        setIsLoading(false);
      };

      reader.readAsDataURL(imageFile);
    } catch {
      setAddImageError("Unable to process the image file.");
      setIsLoading(false);
    }
  }

  function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Admin CMS</h1>
        <p className="text-sm text-slate-600">
          Add new image collections and individual images. This page is only available to admin users.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 p-6 shadow-sm bg-white">
            <button
              type="button"
              onClick={() => setIsCreateCollectionExpanded(!isCreateCollectionExpanded)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-xl font-semibold">Create image collection</h2>
              <span className="text-slate-600">
                {isCreateCollectionExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>
            {isCreateCollectionExpanded ? (
              <form className="space-y-4 mt-4" onSubmit={handleCreateCollection}>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Collection name</span>
                  <input
                    value={collectionName}
                    onChange={(event) => setCollectionName(event.target.value)}
                    onFocus={() => setCreateCollectionError(null)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
                    placeholder="e.g. Summer 2025"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Description</span>
                  <textarea
                    value={collectionDescription}
                    onChange={(event) => setCollectionDescription(event.target.value)}
                    onFocus={() => setCreateCollectionError(null)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
                    rows={4}
                    placeholder="Optional collection description"
                  />
                </label>

                {createCollectionError ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                    {createCollectionError}
                  </div>
                ) : null}

                {createCollectionStatus ? (
                  <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3">
                    {createCollectionStatus}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create collection
                </button>
              </form>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 p-6 shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4">Add image to collection</h2>

            <form className="space-y-4" onSubmit={handleAddImage}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Choose collection</span>
                <select
                  value={selectedCollectionId}
                  onChange={(event) => {
                    setSelectedCollectionId(event.target.value);
                    setAddImageError(null);
                  }}
                  onFocus={() => setAddImageError(null)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
                >
                  {collections.length === 0 ? (
                    <option value="">No collections available</option>
                  ) : (
                    collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Image file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  onFocus={() => setAddImageError(null)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
                />
                {imageFile && (
                  <p className="mt-2 text-sm text-slate-600">Selected: {imageFile.name}</p>
                )}
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Caption</span>
                <input
                  value={imageCaption}
                  onChange={(event) => setImageCaption(event.target.value)}
                  onFocus={() => setAddImageError(null)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
                  placeholder="Optional image caption"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Meta data</span>
                <input
                  value={imageMetaData}
                  onChange={(event) => setImageMetaData(event.target.value)}
                  onFocus={() => setAddImageError(null)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-slate-400 focus:outline-none"
                  placeholder="Optional image metadata"
                />
              </label>

              {addImageError ? (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                  {addImageError}
                </div>
              ) : null}

              {addImageStatus ? (
                <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3">
                  {addImageStatus}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || collections.length === 0}
                className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add image
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Collections overview</h2>
            {isLoading ? (
              <div>Loading collections…</div>
            ) : collections.length === 0 ? (
              <div className="text-sm text-slate-600">No collections yet. Create a collection to get started.</div>
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <div key={collection.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">{collection.name}</div>
                        <div className="text-sm text-slate-600">{collection.images.length} images</div>
                      </div>
                      {selectedCollectionId === collection.id ? (
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">Selected</span>
                      ) : null}
                    </div>
                    {collection.description ? (
                      <p className="mt-3 text-sm text-slate-600">{collection.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedCollection ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Selected collection</h2>
                  <div className="text-sm text-slate-700">
                    <div className="font-semibold">{selectedCollection.name}</div>
                    {editingCollectionId === selectedCollection.id ? (
                      <div className="mt-3 space-y-3">
                        <textarea
                          value={editCollectionDescription}
                          onChange={(e) => setEditCollectionDescription(e.target.value)}
                          onFocus={() => setEditError(null)}
                          className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                          rows={3}
                          placeholder="Collection description"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCollection(selectedCollection.id, editCollectionDescription)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCollectionId(null)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-slate-600">{selectedCollection.description || "No description provided."}</p>
                          <p className="mt-4 text-slate-500">{selectedCollection.images.length} images in this collection</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCollectionId(selectedCollection.id);
                            setEditCollectionDescription(selectedCollection.description || "");
                          }}
                          disabled={isLoading}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Edit description"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editError ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    {editError}
                  </div>
                ) : null}

                {editStatus ? (
                  <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
                    {editStatus}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleDeleteCollection}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete collection
                </button>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Images</h3>
                  {selectedCollection.images.length === 0 ? (
                    <div className="text-sm text-slate-600">No images in this collection yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCollection.images.map((image) => (
                        <div key={image.id} className="rounded-2xl border border-slate-200 p-3">
                          {editingImageId === image.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Caption</label>
                                <input
                                  type="text"
                                  value={editImageCaption}
                                  onChange={(e) => setEditImageCaption(e.target.value)}
                                  onFocus={() => setEditError(null)}
                                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                                  placeholder="Image caption"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Metadata</label>
                                <input
                                  type="text"
                                  value={editImageMetaData}
                                  onChange={(e) => setEditImageMetaData(e.target.value)}
                                  onFocus={() => setEditError(null)}
                                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                                  placeholder="Image metadata"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditImage(image.id, editImageCaption, editImageMetaData)}
                                  disabled={isLoading}
                                  className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingImageId(null)}
                                  disabled={isLoading}
                                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={image.imageUrl}
                                  alt={image.caption ?? image.id}
                                  className="h-20 w-20 rounded-xl object-cover"
                                />
                                <div className="text-sm text-slate-700 flex-1">
                                  <div className="font-semibold">{image.caption || "Untitled image"}</div>
                                  <div className="text-slate-600">{image.metaData || "No metadata"}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingImageId(image.id);
                                    setEditImageCaption(image.caption || "");
                                    setEditImageMetaData(image.metaData || "");
                                  }}
                                  disabled={isLoading}
                                  className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Edit image"
                                >
                                  <FaEdit className="text-sm" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(image.id)}
                                  disabled={isLoading}
                                  className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Delete image"
                                >
                                  <FaTrash className="text-lg" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
