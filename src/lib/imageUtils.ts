const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export const resizeImage = async (file: File): Promise<File> => {
  if (file.size <= MAX_FILE_SIZE) return file;

  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Start with original dimensions and gradually reduce until file size is under 2MB
      const quality = 0.9;
      let attempt = 0;
      const maxAttempts = 10;

      const compress = () => {
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return;

            if (blob.size <= MAX_FILE_SIZE || attempt >= maxAttempts) {
              // We've reached target size or max attempts
              resolve(
                new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
              );
            } else {
              // Reduce dimensions and try again
              attempt++;
              width *= 0.9;
              height *= 0.9;
              compress();
            }
          },
          "image/jpeg",
          quality
        );
      };

      compress();
    };
  });
};
