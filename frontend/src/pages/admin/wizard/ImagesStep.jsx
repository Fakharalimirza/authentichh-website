import { GripVertical, Star, Trash2, Upload, Loader2 } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';

export default function ImagesStep({
  images, onFilesSelected, uploading,
  dragIndex, overIndex,
  handleDragStart, handleDragOver, handleDrop, handleDragEnd,
  handleDeleteImage, handleSetCover, fileInputRef, isEdit
}) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="wizard-step">
      <h2>Images</h2>
      {images.length > 0 && (
        <div className="wizard-images-grid" style={{ gap: 'var(--space-3)' }}>
          {images.map((img, index) => (
            <div
              key={img.id || `new-${index}`}
              className={`wizard-image-item ${img.is_cover ? 'is-cover' : ''} ${dragIndex === index ? 'dragging' : ''} ${overIndex === index ? 'drag-over' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              style={{
                cursor: 'grab',
                opacity: dragIndex === index ? 0.5 : 1,
                borderColor: overIndex === index ? 'var(--color-primary)' : undefined,
                position: 'relative'
              }}
            >
              <img src={getImageUrl(img.image_url, 'thumb')} alt="" />
              <div style={{
                position: 'absolute', top: 4, left: 4,
                background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-sm)',
                color: 'white', padding: 2, cursor: 'grab'
              }}>
                <GripVertical size={14} />
              </div>
              <div className="wizard-image-actions">
                <button type="button" className="wizard-image-btn" onClick={() => handleSetCover(img.id)}>
                  {img.is_cover ? <Star size={11} style={{ fill: 'var(--color-accent)', color: 'var(--color-accent)' }} /> : <Star size={11} />}
                  <span style={{ marginInlineStart: 3 }}>{img.is_cover ? 'Cover' : 'Set Cover'}</span>
                </button>
                <button type="button" className="wizard-image-btn danger" onClick={() => handleDeleteImage(img.id)}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className="wizard-upload-area"
        onClick={() => !uploading && fileInputRef?.current?.click()}
        style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.6 : 1 }}
      >
        {uploading ? (
          <>
            <Loader2 size={28} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              Uploading images...
            </p>
          </>
        ) : (
          <>
            <Upload size={28} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }} />
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              Click to select files or drag and drop
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file" multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <small className="form-hint">Allowed: JPEG, PNG, WebP. Max 5MB per image. Images upload automatically when selected.</small>
    </div>
  );
}
