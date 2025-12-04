import { component$ } from "@builder.io/qwik";
import { Label } from "@qwik-ui/headless"

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = component$<FileUploadProps>(({ onFileSelect }) => {
  return (
    <>
      <Label for="file-input">Upload a file: </Label>
      <input
        id="file-input"
        type="file"  
        onChange$={(event) => {
          const target = event.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            onFileSelect(target.files[0]);
          }
        }}
      />
    </>
  );
});
