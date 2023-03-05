import {useCallback, useEffect, useState} from 'react';
import './App.css';
import {saveImage, getAllImages, TFile} from './models/imageDb';

function App() {
  const [images, setImages] = useState<TFile[]>([]);

  const getImages = useCallback(async () => {
    const images = await getAllImages();
    const updatedImages = await Promise.all(
      images.map(async image => {
        const file = image.data;
        return new Promise<TFile>(resolve => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              ...image,
              dataUrl: reader.result as string,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    setImages(updatedImages);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      try {
        for (let i = 0; i < files.length; i++) {
          const id = await saveImage(files[i]);
          console.log(`File ${files[i].name} uploaded with ID ${id}`);
          getImages();
        }
      } catch (error) {
        console.error(`Failed to upload files: ${error}`);
      }
    }
  };

  useEffect(() => {
    getImages();
  }, [getImages]);

  useEffect(() => {
    console.log(images);
  }, [images]);

  return (
    <div className="App" style={{paddingTop: '100px'}}>
      <input type="file" multiple onChange={handleFileUpload} />
      <button onClick={getImages}>Get Images</button>
      <hr />
      <div>
        {images.map(image => (
          <img key={image.id} src={image.dataUrl} alt={image.name} style={{maxWidth: '250px'}} />
        ))}
      </div>
    </div>
  );
}

export default App;
